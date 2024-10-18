import { query } from './db.js'
import { pluralize } from '../utils'
import { QueryBuilder, QueryField } from './querying/queryBuilder'
import { PostgresDbAdapter } from './adapters'
import { addARQueryThings } from './ar'
import { findOneSql } from './querying/utils'
import { Field, Fields } from './querying/fields'
import { setupRelations } from './querying/relations'
import { ValidationCollector } from './validation/collection.js'
import { ModelSetupCollector } from './models/collector'
import { addGlobal } from '../globals'
import getCallerFile from 'get-caller-file'
import debug from 'debug'

const dbg = debug('semla:models')

/**
 * /**
 *  * Represents the structure of a ModelType object. This is primarily used internally within the framework.
 *  this was generated, could be wrong.
 *   @typedef {Object} ModelType
 *   @property {Fields} _fields - Object containing fields of the model.
 *   @property {Field[]} _relationFields - Array of relation fields related to this model.
 *   @property {string} _modelName - The name of the model.
 *   @property {any} prototype - Prototype for instances of this model.
 *   @property {string} _routeParamName - Parameter name used in route URLs.
 *   @property {ModelSetupCollector} _setup - A collector object used to set up the model.
 *   @property {string} _tableName - The name of the table in the database associated with the model.
 *   @property {ValidationCollector} _validations - A collector object that handles validation for this model.
 *   @property {boolean} _loaded - Indicates if the model has been loaded.
 *   @property {string} _registeringPath - The path where the model is registered.
 *   @property {boolean} loaded - Indicates whether the model has been fully loaded. Returns `true` if fully loaded, otherwise `false`.
 *
 // some AR things.
 // note: these are not the AR types that the end-user will see
 // just dummy typings that are good enough for framework-internal use
 *   @property {Function} findOne - A placeholder method for finding a single record.
 *   @property {Function} find - A placeholder method for finding multiple records.
 */

/**
 * Represents the structure of a ModelsType object. This is primarily used internally within the framework.
 * @typedef {Object.<string, ModelType>} ModelsType
 * @description Object where each property key is a string, and the value is a ModelType.
 */

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

    /** @type {string[]} */
    let fillables = []
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

/**
 * @param {ModelType} model
 * @param {Field} field
 * */
const addQueryProperties = (model, field) => {
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

    const lteQf = new QueryField(model, field, '<=')
    Object.defineProperty(model, field.jsName + '__lte', {
        value: lteQf,
    })

    const gtQf = new QueryField(model, field, '>')
    Object.defineProperty(model, field.jsName + '__gt', {
        value: gtQf,
    })

    const gteQf = new QueryField(model, field, '>=')
    Object.defineProperty(model, field.jsName + '__gte', {
        value: gteQf,
    })

    const inQf = new QueryField(model, field, 'ANY')
    Object.defineProperty(model, field.jsName + '__in', {
        value: inQf,
    })
}

export const prepareModels = async () => {
    dbg('Run setup for models')
    for (const modelKey of Object.keys(models)) {
        const model = models[modelKey]
        collectSetup(model)
    }

    dbg(`Prepare ${Object.keys(models).length} models`)
    const proms = Object.keys(models).map(async (key, idx) => {
        const modelDbg = debug('semla:models:prepare_' + idx)
        const model = models[key]
        if (model.loaded && model.loaded()) {
            modelDbg(`Prepare model ${idx}: ${key} SKIPPED, already loaded`)
            return
        }
        modelDbg(`Prepare model ${idx}: ${key}`)
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
        modelDbg('Getting metadata from table, generating fields')
        const metadataRes = await dbAdapter.getModelTableMetadata(model)
        if (metadataRes.length > 0) {
            // no metadata available
            model._loaded = true
        }

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

        /** @type {Field[]} */
        const fields = []
        // add getters and setters for the fields

        for (const rawField of metadataRes) {
            const { name, type } = rawField

            let field = Field.FromDb(name, type)
            fields.push(field)

            Object.defineProperty(model.prototype, field.jsName, {
                // for a database attribute "id", add the "id" thing to model instances

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

            addQueryProperties(model, field)
        }
        model._fields = new Fields(fields)

        addARQueryThings(model)
        setupRelations(model)

        prepareFiller(model)
        modelDbg(`Done`)
    })

    await Promise.all(proms)
    dbg(`Model preparation done`)
}

/** @type {ModelsType} */
export const models = {}

export function registerModel(model) {
    model._registeringPath = getCallerFile()
    models[model.name] = model
}

export function clearModels() {
    // this exists just for testing
    Object.keys(models).forEach(x => delete models[x])
}

/** @returns {ModelsType} */
export function getUserModels() {
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

/** @returns {ModelType[]} */
export function getLoadedUserModelList() {
    const models = getUserModels()

    /** @type {ModelType[]} */
    let modelList = []
    for (const model of Object.values(models)) {
        const isLoaded = model.loaded && model.loaded()
        if (isLoaded) {
            modelList.push(model)
        }
    }
    return modelList
}

export function getModels() {
    return models
}
