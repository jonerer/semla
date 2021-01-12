import { CustomValidator, PresentValidator, ResultsCollector, ValidationModes, Validator } from './validators'

export class ValidationCollector {
    private validators: any[]

    constructor() {
        this.validators = []
    }

    present(fields: string[] | string, _options) {
        const options = _options || {}
        if (typeof options !== 'object') {
            throw new Error(
                'Invalid present() usage. The second argument should be an options object. The first argument should be a string (a field name) or an array of strings.'
            )
        }
        this.validators.push(new PresentValidator(fields, options))
    }

    custom(callback: (instance: any, results: ResultsCollector) => Promise<void>, _options) {
        if (!callback) {
            throw new Error(
                'Tried to add custom method as validation, but method was null or undefined'
            )
        }
        const options = _options || {}
        this.validators.push(new CustomValidator(callback, options))
    }

    getForMode(mode: ValidationModes): Validator[] {
        // either 'update' or 'create'
        let toRet: Validator[] = []
        for (const val of this.validators) {
            if (mode == 'update' && val.options.updating !== false) {
                toRet.push(val)
            }
            if (mode === 'create' && val.options.creation !== false) {
                toRet.push(val)
            }
        }
        return toRet
    }
}
