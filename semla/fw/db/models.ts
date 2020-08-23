import { query } from './db.js'
import { pluralize } from '../utils.js'
import { QueryBuilder, QueryField } from './querying/queryBuilder.js'
import { PostgresDbAdapter } from './adapters'
import { addARQueryThings } from './ar'
import { findOneSql } from './querying/utils'
import { Field, Fields } from './querying/fields'
import { setupRelations } from './querying/relations'
import { ValidationCollector } from './validation/collection'
import { ModelSetupCollector } from './models/collector'
import { addGlobal } from '../globals'

export const assureBucket = obj => {
    if (!obj._dirtyKeys) {
        obj._dirtyKeys = {}
    }

    if (!obj._attributes) {
        obj._attributes = {}
    }
}

let dbAdapter = new PostgresDbAdapter()

export function setDbAdapter(adapter) {
    dbAdapter = adapter
}

export const registerModelsAsQueryParams = async app => {
    // register as query param
    for (const model of Object.values(models)) {
        const lowercased = model._modelName.toLowerCase()

        model._routeParamName = lowercased

        const getterParam = model._setup._getFromParamCallback

        app.param(model._routeParamName, async (req, res, next, id) => {
            let inst
            try {
                inst = await getterParam(id)
            } catch (e) {
                // wrong type or just nothing found
            }
            if (!inst) {
                next(new Error('Unable to find ' + lowercased + '. 404 yo.'))
            }
            if (!req.matchedParams) {
                req.matchedParams = {}
            }

            req.matchedParams[lowercased] = inst
            next()
        })
    }
}

export const modelNameToTableName = name => {
    let dbName = ''
    for (let i = 0; i < name.length; i++) {
        const curChar = name.charAt(i)
        if (i > 0 && curChar.toLowerCase() !== curChar) {
            dbName += '_'
        }

        dbName += curChar.toLowerCase()
    }

    return pluralize(dbName)
}

export const getLowercasedModel = name => {
    for (const model of Object.values(models)) {
        if (model._modelName.toLowerCase() === name.toLowerCase()) {
            return model
        }
    }
}

const prepareFiller = model => {
    let fillableFields = model._setup.fillable_fields
    let fillables: string[] = []
    if (!Array.isArray(fillableFields)) {
        fillables = [fillableFields]
    } else {
        fillables = fillableFields
    }

    model.prototype.fill = function(inputObj) {
        for (const fillableField of fillables) {
            const inBody = inputObj[fillableField]

            if (inBody !== undefined) {
                this[fillableField] = inBody
            }
        }
    }
}

export const collectSetup = model => {
    const collector = new ModelSetupCollector(model)

    // load validation config into collector
    if (model.setup) {
        model.setup.call(model.prototype, collector)
    }
    model._setup = collector
}

export const prepareModels = async () => {
    // let's load models into global scope
    for (const modelKey of Object.keys(models)) {
        const model = models[modelKey]
        collectSetup(model)
    }

    const proms = Object.keys(models).map(async key => {
        const model = models[key]
        model.prototype._modelName = key
        model._modelName = key
        model._tableName = modelNameToTableName(key)

        const globalThing = {
            name: key,
            global: model,
            description: 'Global access for model ' + key,
        }
        addGlobal(globalThing) // put them in global namespace for easy access

        model._validations = model._setup.validationCollector

        // load metadata
        model._loaded = false
        const metadataRes = await dbAdapter.getModelTableMetadata(model)
        model._loaded = true

        model.loaded = () => {
            return model._loaded
        }

        model.prototype.toString = function() {
            const attrs = this._attributes
            const nonPwKeys = Object.keys(attrs).filter(x => {
                return (
                    x.toLowerCase().indexOf('pass') === -1 &&
                    x.toLowerCase().indexOf('secret') === -1
                )
            })
            const attrString = nonPwKeys
                .map(x => {
                    return x + ': ' + JSON.stringify(attrs[x])
                })
                .join(',')

            let toRet = model._modelName + ' '

            if (this.isNew()) {
                toRet += '(unsaved)'
            } else {
                toRet += '#' + this.id
            }

            toRet += ' ' + attrString

            return toRet
        }

        const fields: Field[] = []
        // add getters and setters for the fields

        for (const rawField of metadataRes) {
            const { name, type } = rawField

            let field = Field.FromDb(name, type)
            fields.push(field)

            Object.defineProperty(model.prototype, field.jsName, {
                get: function() {
                    assureBucket(this)
                    return this._attributes[field.jsName]
                },
                set: function(newVal) {
                    assureBucket(this)
                    this._dirtyKeys[field.jsName] = true
                    this._attributes[field.jsName] = newVal
                },
            })

            // attach User.id and the like, for querying purposes
            const qf = new QueryField(model, field, '=')
            Object.defineProperty(model, field.jsName, {
                value: qf,
            })

            const notQf = new QueryField(model, field, '!=')
            Object.defineProperty(model, field.jsName + '__not', {
                value: notQf,
            })

            const ltQf = new QueryField(model, field, '<')
            Object.defineProperty(model, field.jsName + '__lt', {
                value: ltQf,
            })
        }
        model._fields = new Fields(fields)

        addARQueryThings(model)
        setupRelations(model)

        prepareFiller(model)
    })

    await Promise.all(proms)
}

export interface ModelType {
    _fields: Fields
    _relationFields: Field[]
    _modelName: string
    prototype: any
    _routeParamName: string
    _setup: ModelSetupCollector
    _tableName: string
    _validations: ValidationCollector
    _loaded: boolean
    loaded(): boolean

    // some AR things.
    // note: these are not the AR types that the end-user will see
    // just dummy typings that are good enough for framework-internal use
    findOne(any): any
    find(any): any
}

interface ModelsType {
    [s: string]: ModelType
}

export const models: ModelsType = {}

export function registerModel(model) {
    models[model.name] = model
}

export function clearModels() {
    // this exists just for testing
    Object.keys(models).forEach(x => delete models[x])
}

export function getUserModels(): ModelsType {
    // filter out all models starting with 'dev'
    const keys = Object.keys(models).filter(
        x => !x.toLowerCase().startsWith('dev')
    )
    let newObj = {}
    for (const key of keys) {
        newObj[key] = models[key]
    }
    return newObj
}

export function getModels() {
    return models
}
