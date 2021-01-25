import { ValidationCollector } from '../validation/collection'
import { ModelType } from '../models'

export interface CollectedRelation {
    type: 'belongsTo' | 'hasMany'
    name: string
    options: any
    model: ModelType
}

export interface BelongsToOptions {
    model?: string
}

export interface HasManyOptions {
    model?: string
}

export class ModelSetupCollector {
    relations: CollectedRelation[]
    fillable_fields: string[]
    model: ModelType
    validationCollector: ValidationCollector
    _getFromParamCallback: (id: any) => string

    constructor(model: ModelType) {
        this.relations = []
        this.fillable_fields = []
        this.model = model
        this._getFromParamCallback = id => model.findOne(id)

        this.validationCollector = new ValidationCollector()
    }

    belongsTo(name, options: BelongsToOptions = {}) {
        this.relations.push({
            type: 'belongsTo',
            name,
            options,
            model: this.model,
        })
    }

    fillable(fields) {
        this.fillable_fields = fields
    }

    getFromParam(callback) {
        this._getFromParamCallback = callback
    }

    hasMany(name, options: HasManyOptions = {}) {
        this.relations.push({
            type: 'hasMany',
            name,
            options,
            model: this.model,
        })
    }

    validate(callback: (validations: ValidationCollector) => void) {
        callback(this.validationCollector)
    }
}
