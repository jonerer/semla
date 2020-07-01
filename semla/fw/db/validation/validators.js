export class PresentValidator {
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

export class CustomValidator {
    constructor(callback, options) {
        this.callback = callback
        this.options = options
    }

    async validate(instance, results) {
        await this.callback.call(instance, results)
    }
}

class ResultsCollector {
    constructor() {
        this.fails = []
    }

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

    messages() {
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
