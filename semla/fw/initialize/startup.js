import { addItemToObject, add } from '../config/config'
import { addAppDir } from '../loader'
import { addToWebDi } from '../di/web_di'

class InitCollector {
    constructor() {
        this.afterLoadCallbacks = []
        this.settings = []
        this.extraDirs = []
        this.addedDiThings = []
    }
    addSettings(path, vars) {
        // todo maybe improve
        this.settings.push({
            path,
            vars,
        })
    }
    addDir(dir) {
        this.extraDirs.push(dir)
    }

    afterLoad(callback) {
        this.afterLoadCallbacks.push(callback)
    }

    addDi(thing, options) {
        this.addedDiThings.push([thing, options])
    }
}

export function collect() {
    const collector = new InitCollector()
    for (const init of initializers) {
        init(collector)
    }
    return collector
}

export function mergeSettings(collector) {
    const merged = {}

    for (const setting of collector.settings) {
        const { path, vars } = setting
        addItemToObject(merged, path, vars)
    }
    return merged
}

let collector

export function initialize() {
    collector = collect()

    const settings = mergeSettings(collector)
    add(settings)

    for (const extraDir of collector.extraDirs) {
        addAppDir(extraDir)
    }

    for (const webDiThing of collector.addedDiThings) {
        addToWebDi(webDiThing[0], webDiThing[1])
    }
}

export async function afterLoad() {
    for (const callback of collector.afterLoadCallbacks) {
        await callback()
    }
}

const initializers = []

export function registerInitializer(callback) {
    initializers.push(callback)
}

export function clearInitializers() {
    initializers.length = 0
}
