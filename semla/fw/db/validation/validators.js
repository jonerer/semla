import { ValidationCollector, ValidationOptions } from './collection'

/** @typedef {Object} ValidationOptions
 * @property {boolean} updating
 * @property {boolean} creation
 */

/** @typedef {Function} ValidationCallback
 * @param {any} instance
 * @param {ResultsCollector} results
 * @returns {Promise<void>}
 */

/** @typedef {Object} Validator
 * @property {ValidationCallback} validate
 * @property {ValidationOptions} options
 */

/** typedef {'update' | 'create'} ValidationModes */

/** Validate that a field, or list of fields, is present
 * @implements {Validator}
 * @param {string | string[]} _fieldNames
 * @param {ValidationOptions} options
 * @returns {Validator}
 */
export class PresentValidator {
    /** @type {any[]} */
    #fields
    /** @type {ValidationOptions} */
    #options

    constructor(_fieldNames, options) {
        if (!Array.isArray(_fieldNames)) {
            this.#fields = [_fieldNames]
        } else {
            this.#fields = _fieldNames
        }
        this.#options = options
    }

    async validate(instance, results) {
        for (const fieldName of this.#fields) {
            if (instance[fieldName] == null || instance[fieldName] === '') {
                results.fail(this, fieldName, 'needs to be present')
            }
        }
    }
}

/** Add a custom validation method
 * @implements {Validator}
 * @param {ValidationCallback} callback
 * @param {ValidationOptions} options
 */
export class CustomValidator {
    /** @type {ValidationCallback} */
    #callback
    /** @type {ValidationOptions} */
    #options

    constructor(callback, options) {
        this.#callback = callback
        this.#options = options
    }

    async validate(instance, results) {
        await this.#callback.call(instance, results)
    }
}

/** @typedef {Object} ValidationFailure
 * @property {Validator} validator
 * @property {string} fieldName
 * @property {string} message
 */

export class ResultsCollector {
    /** @type {ValidationFailure[]} */
    #fails

    constructor() {
        this.fails = []
    }

    /** @param {Validator} validator
     * @param {string} fieldName
     * @param {string} message
     */
    fail(validator, fieldName, message) {
        this.fails.push({
            validator,
            fieldName,
            message,
        })
    }

    isValid() {
        return this.fails.length === 0
    }

    /** @returns {string[]} */
    messages() {
        /** @type {string[]} */
        let toRet = []
        for (const fail of this.fails) {
            if (fail.fieldName) {
                toRet.push(fail.fieldName + ': ' + fail.message)
            } else {
                toRet.push(fail.message)
            }
        }
        return toRet
    }
}

export class ValidationRunner {
    /** @type {any} */
    #instance
    /** @type {ValidationCollector} */
    #collector
    /** @type {ValidationModes} */
    #mode

    constructor(instance, collector, mode) {
        this.#instance = instance
        this.#collector = collector
        this.#mode = mode // mode is either 'update' or 'create'
    }

    async validate() {
        const validators = this.#collector.getForMode(this.#mode)
        const results = new ResultsCollector()
        for (const validator of validators) {
            await validator.validate(this.#instance, results)
        }
        return results
    }
}
