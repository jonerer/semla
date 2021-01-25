import { ValidationCollector, ValidationOptions } from './collection'

export interface Validator {
    validate(instance, results: ResultsCollector): Promise<void>
}

export type ValidationModes = 'update' | 'create'

export class PresentValidator implements Validator {
    private fields: any[]
    private options: ValidationOptions

    constructor(_fieldNames, options) {
        if (!Array.isArray(_fieldNames)) {
            this.fields = [_fieldNames]
        } else {
            this.fields = _fieldNames
        }
        this.options = options
    }

    async validate(instance, results) {
        for (const fieldName of this.fields) {
            if (instance[fieldName] == null || instance[fieldName] === '') {
                results.fail(this, fieldName, 'needs to be present')
            }
        }
    }
}

export class CustomValidator implements Validator {
    private callback: any
    private options: any

    constructor(callback, options) {
        this.callback = callback
        this.options = options
    }

    async validate(instance, results) {
        await this.callback.call(instance, results)
    }
}

interface ValidationFailure {
    validator: Validator
    fieldName: string
    message: string
}

export class ResultsCollector {
    private fails: any[]

    constructor() {
        this.fails = []
    }

    fail(validator: Validator, fieldName: string, message: string) {
        this.fails.push({
            validator,
            fieldName,
            message,
        })
    }

    isValid() {
        return this.fails.length === 0
    }

    messages(): string[] {
        let toRet: string[] = []
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
    private instance: any
    private collector: ValidationCollector
    private mode: ValidationModes

    constructor(instance, collector, mode) {
        this.instance = instance
        this.collector = collector
        this.mode = mode // mode is either 'update' or 'create'
    }

    async validate() {
        const validators = this.collector.getForMode(this.mode)
        const results = new ResultsCollector()
        for (const validator of validators) {
            await validator.validate(this.instance, results)
        }
        return results
    }
}
