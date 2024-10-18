import {
    CustomValidator,
    PresentValidator,
    ResultsCollector,
    ValidationModes,
    Validator,
} from './validators.js'

/** @typedef {Object} ValidationOptions
 * @property {boolean} updating
 * @property {boolean} creation
 */

/** Collects validation methods to be used in the model
 *
 */
export class ValidationCollector {
    /** @type {Validator[]} */
    #validators = []

    constructor() {}

    /** Validate that a field, or list of fields, is present
     * @param {string | string[]} fields
     * @param {ValidationOptions?} _options
     */
    present(fields, _options) {
        const options = _options || {}
        if (typeof options !== 'object') {
            throw new Error(
                'Invalid present() usage. The second argument should be an options object. The first argument should be a string (a field name) or an array of strings.'
            )
        }
        this.#validators.push(new PresentValidator(fields, options))
    }

    /** @typedef {Function} CustomValidationCallback
     * @param {any} instance
     * @param {ResultsCollector} results
     *
     * @returns {Promise<void>}
     */

    /** Add a custom validation method
     * @param {CustomValidationCallback} callback
     * @param {ValidationOptions?} _options
     */
    custom(callback, _options) {
        if (!callback) {
            throw new Error(
                'Tried to add custom method as validation, but method was null or undefined'
            )
        }
        const options = _options || {}
        this.#validators.push(new CustomValidator(callback, options))
    }

    /**
     * @param {ValidationModes} mode
     * @returns {Validator[]}
     * */
    getForMode(mode) {
        /** @type {Validator[]} */
        let toRet = []
        for (const val of this.#validators) {
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
