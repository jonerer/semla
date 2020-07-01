import { CustomValidator, PresentValidator } from './validators'

export class ValidationCollector {
    constructor() {
        this.validators = []
    }

    present(fields, _options) {
        const options = _options || {}
        if (typeof options !== 'object') {
            throw new Error(
                'Invalid present() usage. The second argument should be an options object. Put an array as the first argument to validate multiple fields.'
            )
        }
        this.validators.push(new PresentValidator(fields, options))
    }

    custom(callback, _options) {
        if (!callback) {
            throw new Error(
                'Tried to add custom method as validation, but method was null or undefined'
            )
        }
        const options = _options || {}
        this.validators.push(new CustomValidator(callback, options))
    }

    getForMode(mode) {
        // either 'update' or 'create'
        let toRet = []
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
