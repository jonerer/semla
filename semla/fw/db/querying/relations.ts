import { findOneSql } from './utils'
import { Field } from './fields'
import { assureBucket, getLowercasedModel, ModelType } from '../models'
import { QueryBuilder, QueryField } from './queryBuilder'
import { jsFieldName, singularize } from '../../utils'
import { CollectedRelation } from '../models/collector'

const setupBelongsTo = (model: ModelType, relation: CollectedRelation) => {
    const field = Field.FromRelation(relation)
    // todo: this needs to be affected by the _id field
    model._relationFields.push(field)

    // set up the instance field
    const jsName = field.jsName
    Object.defineProperty(model.prototype, jsName, {
        get: function() {
            assureBucket(this)
            const otherModel = field.targetModel
            const idVal = this._attributes[jsName + 'Id']
            const that = this

            if (!otherModel) {
                throw new Error('Target model not found for relation ' + model._modelName + '->' + relation.name)
            }

            if (!idVal) {
                return idVal
            }

            const obj = {
                then(resolve, reject) {
                    if (idVal !== undefined) {
                        return resolve(otherModel.findOne(idVal))
                    }
                    return resolve(that._attributes[jsName])
                },
                sql: findOneSql(otherModel, idVal)[0],
                id: idVal,
            }
            return obj
        },
        set: function(newVal) {
            // if you try to set to a model instance, then also update
            // the _id attribute
            const idAttribute = jsName + 'Id'
            assureBucket(this)
            const isId =
                typeof newVal === 'number' || typeof newVal === 'string'

            const isNullish = newVal == null // null or undefined

            const isValidModelInstance =
                typeof newVal === 'object' &&
                !isNullish &&
                newVal.id !== undefined

            if (isId) {
                this._attributes[idAttribute] = newVal
            } else if (isValidModelInstance) {
                this._attributes[idAttribute] = newVal.id
            } else if (isNullish) {
                this._attributes[idAttribute] = newVal
            } else {
                throw new Error(
                    `Invalid value for belongsTo field ${model._modelName}.${jsName}: ${newVal}. If it's a model instance, it hasn't been saved yet.`
                )
            }

            this._dirtyKeys[idAttribute] = true
            this._dirtyKeys[jsName] = true
            this._attributes[jsName] = newVal
        },
    })

    // set up the model field for query building
    const qf = new QueryField(model, field, '=')
    qf.setRelation(field)
    Object.defineProperty(model, field.jsName, {
        value: qf,
    })
}

const setupHasMany = (model: ModelType, relation: CollectedRelation) => {
    const field = Field.FromRelation(relation)
    const otherModel = field.targetModel

    model._relationFields.push(field)

    if (!otherModel) {
        throw new Error('Target model not found for relation ' + model._modelName + '->' + relation.name)
    }

    const jsName = jsFieldName(model._modelName) + 'Id'

    Object.defineProperty(model.prototype, field.jsName, {
        get: function() {
            const qb = new QueryBuilder()
            const condition = [otherModel[jsName], this.id]
            qb.addCondition(condition)
            qb.targetModel(otherModel)
            const obj = {
                then(resolve, reject) {
                    return resolve(otherModel.find(condition))
                },
                sql: qb.sql()[0],
            }
            return obj
        },
        set: function() {
            throw new Error('You cant set a hasMany field')
        },
    })

    // set up the model field for query building
    const qf = new QueryField(model, field, '=')
    qf.setRelation(field)
    Object.defineProperty(model, field.jsName, {
        value: qf,
    })
}

export const setupRelations = (model: ModelType) => {
    model._relationFields = []
    for (const relation of model._setup.relations) {
        if (relation.type === 'belongsTo') {
            setupBelongsTo(model, relation)
        } else if (relation.type === 'hasMany') {
            setupHasMany(model, relation)
        }
    }
}
