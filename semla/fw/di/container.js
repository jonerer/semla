import { jsFieldName } from '../utils'

export class DiContainerItem {
    constructor(thing, options = {}) {
        this.thing = thing
        this.options = options

        this.instance = null
        this.hasInstanced = false

        this.isClass = false
        try {
            const cls = this.thing.prototype.constructor.toString()
            this.isClass = cls.startsWith('class')
        } catch (e) {}

        this.diContainer = undefined
    }

    setDiContainer(di) {
        this.diContainer = di
    }

    getName() {
        if (this.options.name) {
            return this.options.name
        } else {
            return jsFieldName(this.thing.name) // works for classes
        }
    }

    _actuallyCreateClassInstance() {
        const i = new this.thing(this.diContainer)
        i.di = this.diContainer
        return i
    }

    _createInstance() {
        if (this.isClass) {
            if (this.getScope() === 'single') {
                // check if someone else has put an instance in our container's bag
                let singleInstanceBag = this.diContainer.singleInstanceBag
                if (!singleInstanceBag.has(this.getName())) {
                    singleInstanceBag.set(
                        this.getName(),
                        this._actuallyCreateClassInstance()
                    )
                }

                return singleInstanceBag.get(this.getName())
            } else {
                return this._actuallyCreateClassInstance()
            }
        } else {
            return this.thing
        }
    }

    getInstance() {
        if (this.hasInstanced) {
            return this.instance
        } else {
            this.instance = this._createInstance()
            this.hasInstanced = true
        }
        return this.instance
    }

    getScope() {
        return this.options.scope || 'single'
    }
}

class DiInstanceBag {
    constructor() {
        this.instances = {}
    }
    has(name) {
        return this.instances[name] !== undefined
    }
    get(name) {
        return this.instances[name]
    }
    set(name, inst) {
        this.instances[name] = inst
    }
}

export class DiContainer {
    constructor() {
        this.singleInstanceBag = {}
    }

    setSingleInstanceBag(diInstanceBag) {
        this.singleInstanceBag = diInstanceBag
    }
}

export class DiContainerBuilder {
    constructor() {
        this.items = [] // contains arrays of [thing, options]
        this.scopeHierarchy = ['single', 'request']

        this.singleInstanceBag = new DiInstanceBag() // makes sure the "single" things are singletons *for this builder*, not neccesarily globally
    }

    add(thing, options) {
        this.items.push([thing, options]) //
    }

    // we want to add single items to the request container
    // but we don't want the item to consider that a "home" container.
    addItem(diContainer, item, shouldSetAsHomeContainer) {
        if (shouldSetAsHomeContainer) {
            item.setDiContainer(diContainer)
        }
        Object.defineProperty(diContainer, item.getName(), {
            get: () => {
                return item.getInstance()
            },
            enumerable: true,
        })
    }

    addThrowingDummy(diContainer, item) {
        Object.defineProperty(diContainer, item.getName(), {
            get: () => {
                throw new Error(
                    item.getName() +
                        ' in the DI container is not available in the scope single ' +
                        ' since it was added with the scope request' +
                        '.'
                )
            },
            enumerable: false,
        })
    }

    build(scope = 'single') {
        // we actually have to build two di containers
        // one scoped to 'single' and one scoped to 'request'
        // (but only if the scope should be request)

        let diItems = []
        for (const item of this.items) {
            const [thing, options] = item
            diItems.push(new DiContainerItem(thing, options))
        }

        const shouldCreateRequestContainer = scope === 'request'

        const singleItems = diItems.filter(x => x.getScope() === 'single')
        const requestItems = diItems.filter(x => x.getScope() === 'request')

        const shouldCreateSingleContainer = singleItems.length > 0

        let requestDiContainer
        if (shouldCreateRequestContainer) {
            requestDiContainer = new DiContainer()
        }

        // first, construct the singlecontainer
        // we always need one of these, as long as we have *at least* one singleItem
        let singleDiContainer

        if (shouldCreateSingleContainer) {
            singleDiContainer = new DiContainer()
            singleDiContainer.setSingleInstanceBag(this.singleInstanceBag)
        }

        if (shouldCreateSingleContainer) {
            for (const item of singleItems) {
                this.addItem(singleDiContainer, item, true)
            }
            for (const item of requestItems) {
                this.addThrowingDummy(singleDiContainer, item)
            }
        }

        if (shouldCreateRequestContainer) {
            for (const item of singleItems) {
                this.addItem(requestDiContainer, item, false)
            }
            for (const item of requestItems) {
                this.addItem(requestDiContainer, item, true)
            }
        }

        if (shouldCreateRequestContainer) {
            return requestDiContainer // return the best container we have
        } else {
            return singleDiContainer
        }
    }
}
