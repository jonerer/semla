import { registerSerializer, serialize } from '../../fw/db/serialization'

class SimpleUserSerializer {
    async one(user) {
        const obj = {
            id: '' + user.id,
            str1: '' + user.str1,
            str2: '' + user.str2,
            name: user.name,
            email: user.email ? user.email : ' - no email supplied - ',
            nice: user.nice,
            propfour: user.propfour,
            propfive: user.propfive,
            undef: user.undef,
            nullval: user.nullval,
        }

        if (user.cat) {
            obj.cat = await this.json(user.cat)
        }

        return obj
    }
}

class CoolUserSerializer {
    async one(user, { add, addString }) {
        add(['name', 'cat'])
        add('propfour', 'propfive')
        add('nice')
        addString('id')
        addString(['str1', 'str2'])
        add('undef')
        add('nullval')
        add({
            email: user.email ? user.email : ' - no email supplied - ',
        })
    }
}

class CatSerializer {
    // to use as resolved cat's serializer
    async one(cat) {
        return {
            id: '' + cat.id,
        }
    }
}

const testInstance = () => {
    return {
        id: 5,
        name: ' ettnamn',
        nice: true,
        email: 'mejl@mejl.com',
        propfour: 4,
        propfive: 5,
        str1: 123,
        str2: 456,
        undef: undefined,
        cat: new Promise(resolve => {
            resolve({
                _modelName: 'cat',
                id: 55,
                name: 'catnamn',
            })
        }),
    }
}

test('Simple serializers', async () => {
    registerSerializer(SimpleUserSerializer)
    registerSerializer(CatSerializer)

    const inst = testInstance()

    const serialized = await serialize(inst, 'simpleuser')

    compareSerializers(serialized, inst)
})

const compareSerializers = (serialized, inst) => {
    expect(serialized.id).toBe('' + inst.id)
    expect(serialized.name).toBe(inst.name)
    expect(serialized.nice).toBe(inst.nice)
    expect(serialized.email).toBe(inst.email)
    expect(serialized.str1).toBe('' + inst.str1)
    expect(serialized.str2).toBe('' + inst.str2)
    expect(serialized.undef).toBe(inst.undef)
    expect(serialized.cat.id).toBe('' + 55)
}

test('Cool serializers', async () => {
    registerSerializer(CoolUserSerializer)
    registerSerializer(CatSerializer)

    const inst = testInstance()

    const serialized = await serialize(inst, 'cooluser')

    compareSerializers(serialized, inst)
})

test('Cool serializers on arrays', async () => {
    registerSerializer(CoolUserSerializer)
    registerSerializer(CatSerializer)

    const inst = testInstance()
    const inst2 = testInstance()

    const arr = [inst, inst2]

    const serialized = await serialize(arr, 'cooluser')

    compareSerializers(serialized[0], inst)
    compareSerializers(serialized[1], inst)
})

class StringerSerializer {
    async one(item, { add, addString }) {
        addString(['id', 'nulled', 'undefineded'])
    }
}

test('Stringifying null and undefined stuff', async () => {
    registerSerializer(StringerSerializer)

    const inst = {
        id: 3,
        nulled: null,
        undefineded: undefined,
    }

    const serialized = await serialize(inst, 'stringer')

    expect(serialized.id).toBe('3')
    expect(serialized.nulled).toBeNull()
    expect(serialized.undefined).toBeUndefined()
})
