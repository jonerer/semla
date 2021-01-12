import { getDefaultOptions } from './flattener'

class RouteItem {
    constructor() {
        this.type = ''

        this.path = ''
        this.method = ''
        this.actionstring = ''

        this.collector = null // for sub-routes like "resources" and "prefix"

        this.options = {}

        this.meta = {}
    }
}

export class RouteCollector {
    constructor() {
        this.items = []
    }

    validateOptions(opts) {
        const defaultOptions = getDefaultOptions()
        for (const key in opts) {
            if (defaultOptions[key] === undefined) {
                throw new Error('Route error: unknown option ' + key)
            }
        }
    }

    get(path, action, options = {}) {
        this.validateOptions(options)

        const i = new RouteItem()
        i.method = 'get'
        i.type = 'route'
        i.path = path
        i.actionstring = action
        i.options = options
        i.meta = options.meta || {}
        this.items.push(i)
    }

    post(path, action, options = {}) {
        this.validateOptions(options)

        const i = new RouteItem()
        i.method = 'post'
        i.type = 'route'
        i.path = path
        i.actionstring = action
        i.options = options
        i.meta = options.meta || {}
        this.items.push(i)
    }

    delete(path, action, options = {}) {
        this.validateOptions(options)

        const i = new RouteItem()
        i.method = 'delete'
        i.type = 'route'
        i.path = path
        i.actionstring = action
        i.meta = options.meta || {}
        this.items.push(i)
    }

    resources(path, callback_or_options, options = {}) {
        this.validateOptions(options)

        const subCollector = new RouteCollector()

        const i = new RouteItem()
        i.type = 'resources'
        i.path = path
        i.collector = subCollector
        i.options = options
        i.meta = options.meta || {}
        this.items.push(i)

        let callback
        if (typeof callback_or_options === 'function') {
            callback = callback_or_options
        } else if (typeof callback_or_options === 'object') {
            i.options = callback_or_options
        }

        if (callback) {
            callback(subCollector)
        }
    }

    semiNestedResources(path, callback_or_options, options = {}) {
        this.validateOptions(options)

        const subCollector = new RouteCollector()

        const i = new RouteItem()
        i.type = 'semiNestedResources'
        i.path = path
        i.collector = subCollector
        i.options = options
        i.meta = options.meta || {}
        this.items.push(i)

        let callback
        if (typeof callback_or_options === 'function') {
            callback = callback_or_options
        } else if (typeof callback_or_options === 'object') {
            i.options = callback_or_options
        }

        if (callback) {
            callback(subCollector)
        }
    }

    prefix(path, callback_or_options, options = {}) {
        this.validateOptions(options)

        const subCollector = new RouteCollector()

        const i = new RouteItem()
        i.type = 'prefix'
        i.path = path
        i.collector = subCollector
        i.options = options
        i.meta = options.meta || {}
        this.items.push(i)

        let callback
        if (typeof callback_or_options === 'function') {
            callback = callback_or_options
        } else if (typeof callback_or_options === 'object') {
            i.options = callback_or_options
        }

        if (callback) {
            callback(subCollector)
        }
    }
}
