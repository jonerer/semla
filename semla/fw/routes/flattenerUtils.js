export class PathHelper {
    constructor(methodName, numRequiredParams, path) {
        this.methodName = methodName
        this.numRequiredParams = numRequiredParams
        this.path = path

        this.callback = this.callback.bind(this) // needed for when it's called from global
    }

    getGlobal() {
        return {
            description: 'Path helper for ' + this.path, // for the "globals description"
            name: this.methodName, // name of the global
            global: this.callback, // the global
        }
    }

    callback(...args) {
        let newPath = this.path
        for (let i = 0; i < args.length; i++) {
            const thisArg = args[i]

            const id = typeof thisArg === 'object' ? thisArg.id : thisArg
            if (id == null) {
                throw new Error(
                    "Error in path generation. Argument isn't id:able: " +
                        thisArg
                )
            }

            // replace the first :param with this value
            const sp = newPath.split('/')
            for (let part = 0; part < sp.length; part++) {
                const thisPart = sp[part]
                if (thisPart.indexOf(':') === 0) {
                    sp[part] = id
                    break
                }
            }
            newPath = sp.join('/')
        }
        return newPath
    }
}

export class GeneratedRoute {
    constructor(path, method, controllerName, action, options) {
        this.path = path
        this.method = method
        this.controllerName = controllerName
        this.action = action
        this.options = options
    }

    addPathHelper(helper) {
        this.pathHelper = helper
    }

    useSession() {
        return this.options.session
    }

    csrfProtected() {
        return this.options.csrfProtection
    }
}
