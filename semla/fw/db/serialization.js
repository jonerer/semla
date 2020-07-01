import { singularize } from '../utils'

const serializers = {}
function serializerDefaultMany(items) {
    const that = this
    const proms = items.map(item => {
        return serialize(item, that.constructor.name)
    })

    return Promise.all(proms)
}

export const registerSerializer = serializer => {
    const splitted = serializer.name.split('Serializer')
    const normalized = splitted[0].toLowerCase()
    if (!serializer.prototype.many) {
        serializer.prototype.many = serializerDefaultMany
    }
    serializer.prototype.json = serialize

    serializers[normalized] = serializer
}

class SerializationCollector {
    constructor() {
        this.fieldsToResolve = []
        this.objsGiven = {}
        this.fieldsToStringify = []

        // bind this in case someone destructures the collector
        this.add = this.add.bind(this)
        this.addString = this.addString.bind(this)
    }

    add(...args) {
        const obj = args[0]
        if (args.length > 1) {
            for (const o of args) {
                this.fieldsToResolve.push(o)
            }
        } else if (Array.isArray(obj)) {
            for (const item of obj) {
                this.fieldsToResolve.push(item)
            }
        } else if (typeof obj === 'object') {
            this.objsGiven = { ...this.objsGiven, ...obj }
        } else {
            // just one thing
            this.fieldsToResolve.push(obj)
        }
    }

    addString(obj) {
        this.add(obj)

        if (Array.isArray(obj)) {
            for (const item of obj) {
                this.fieldsToStringify.push(item)
            }
        } else {
            this.fieldsToStringify.push(obj)
        }
    }
}

const resolveOne = async (instance, data) => {
    const resolutionCollector = new SerializationCollector()
    const oneResult = await instance.one(data, resolutionCollector)
    if (oneResult === undefined) {
        // if you return undefined, then we'll do the resolution via the collector

        let result = {} // first, resolve values for all the desired fields
        for (const fieldName of resolutionCollector.fieldsToResolve) {
            let value = await data[fieldName]

            //if array/object-like, run it through the serializer
            if (typeof value === 'object') {
                value = await serialize(value)
            }

            result[fieldName] = value
        }

        // then stringify things
        for (const fieldName of resolutionCollector.fieldsToStringify) {
            let resultElement = result[fieldName]
            if (resultElement != null) {
                const value = '' + resultElement
                result[fieldName] = value
            }
        }

        // then merge with the objects given
        const given = resolutionCollector.objsGiven
        result = { ...result, ...given }
        return result
    } else {
        return oneResult
    }
}

const availableSerializers = () => {
    return Object.keys(serializers).join(',')
}

const findDefaultSerializerName = hej => {
    const modelNames = {}
    if (!Array.isArray(hej)) {
        modelNames[hej._modelName] = true
    } else {
        for (const item of hej) {
            modelNames[item._modelName] = true
        }
    }

    if (Object.keys(modelNames).length !== 1) {
        throw new Error(
            'Mixed models in array for serialization. Undefined behaviour'
        )
    }

    const serializerName = Object.keys(modelNames)[0]
    return serializerName
}

export const serialize = async (hej, desiredSerializer) => {
    if (hej && hej.then) {
        // if hej is a thenable, then let's resolve it first
        hej = await hej
    }
    if (Array.isArray(hej) && hej.length === 0) {
        return []
    }

    if (hej == null) {
        return hej
    }

    let serializerToUse = null
    let needsSerializer = true
    if (desiredSerializer) {
        const splitted = desiredSerializer.toLowerCase().split('serializer')
        if (splitted.length > 1) {
            // shave off "serializer" from the requested name
            desiredSerializer = splitted[0]
        }
        const desiredLowercase = desiredSerializer.toLowerCase()
        serializerToUse = serializers[desiredLowercase]
        if (!serializerToUse) {
            throw new Error(
                'No serializer found. Was looking for ' +
                    desiredLowercase +
                    '. Available ones: ' +
                    availableSerializers()
            )
        }
    } else {
        const serializerName = findDefaultSerializerName(hej)
        needsSerializer = serializerName !== 'undefined'

        const defaultSerializerName = singularize(serializerName).toLowerCase()
        serializerToUse = serializers[defaultSerializerName]
    }

    if (!needsSerializer) {
        // assume it's a plain object and the user knows what she's doing
        return hej
    }

    if (serializerToUse) {
        let serializerInstance = new serializerToUse()

        let serialized
        if (Array.isArray(hej)) {
            serialized = await serializerInstance.many(hej)
        } else {
            serialized = await resolveOne(serializerInstance, hej) // serializerInstance.one(hej)
        }

        return serialized
    } else {
        let mName = hej._modelName
        if (Array.isArray(hej)) {
            mName = hej[0]._modelName
        }
        throw new Error(
            'No serializer found for model ' +
                mName +
                '. Available ones: ' +
                availableSerializers()
        )
    }
}
