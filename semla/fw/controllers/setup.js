export class ControllerSetupCollector {
    constructor(controller) {
        this.controller = controller
        this.middlewares = [] // middlewares is an object that looks like this:
        /*
        {
        actions: [] // either a list of action names, or the string '*']
        callback: Function
         */
    }

    /*
    Register middleware
    Actions is either a list of action names like ['list', 'destroy'],
    or a single action, like 'get' or
    or it's omitted, meaning the callback should be run for all actions
     */

    before(actions, callback) {
        if (actions instanceof Function) {
            callback = actions
            actions = '*'
        }

        if (!(callback instanceof Function)) {
            throw new Error('You need to provide a callback for middlewares')
        }

        if (!Array.isArray(actions)) {
            if (actions !== '*') {
                actions = [actions]
            }
        }

        this.middlewares.push({
            actions,
            callback,
        })
    }

    getRelevantMiddleware(action) {
        let toRet = []
        for (const mid of this.middlewares) {
            if (mid.actions === '*' || mid.actions.indexOf(action) !== -1) {
                toRet.push(mid)
            }
        }
        return toRet
    }
}

const controllers = {}
export function registerController(controller) {
    let name = controller.name
    let strippedName = name.toLowerCase()

    const endswith = name.endsWith('Controller')
    if (endswith) {
        strippedName = strippedName.substr(0, name.length - 'Controller'.length)
    }

    controllers[strippedName] = controller

    const collector = new ControllerSetupCollector(controller)
    if (!controller.setup && controller.prototype.setup) {
        console.log(
            'FYI you have a setup() method on the controller',
            strippedName + '. You probably meant to set it as "static".'
        )
    }
    if (controller.setup) {
        controller.setup.call(controller.prototype, collector)
        // im setting the prototype to "this", to be able to have a static
        // method in which you can do "this.beforeAll".
        // only because of ergonomics.

        // I just want setup to be static. But I don't want to force people to do
        // m.before('get', this.prototype.beforeGet)

        // It might be something I have to revisit; the semantics are a bit weird
    }
    controller._setupCollector = collector
}

export const runMiddleware = async (controllerInst, action, ctx) => {
    const mids = controllerInst.constructor._setupCollector.getRelevantMiddleware(
        action
    )
    for (const middle of mids) {
        await middle.callback.call(controllerInst, ctx)
    }
}

export const getController = name => {
    return controllers[name]
}

export function getControllers() {
    let toRet = []
    for (const key of Object.keys(controllers)) {
        const cls = controllers[key]
        const propertyNames = Object.getOwnPropertyNames(cls.prototype)
        toRet.push({
            name: key,
            propertyNames,
        })
    }
    return toRet
}
