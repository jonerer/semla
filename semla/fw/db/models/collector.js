import { ValidationCollector } from '../validation/collection'

export class ModelSetupCollector {
    constructor(model) {
        this.relations = []
        this.fillable_fields = []
        this.model = model
        this._getFromParamCallback = null

        this.validationCollector = new ValidationCollector()
    }

    belongsTo(name, options = {}) {
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

    hasMany(name, options = {}) {
        this.relations.push({
            type: 'hasMany',
            name,
            options,
            model: this.model,
        })
    }

    validate(callback) {
        callback(this.validationCollector)
    }
}
