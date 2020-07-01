import _ from 'lodash'
import { applyDefaultConfig } from './defaults'

let conf = {}
let defaults = {}

const getItem = (object, path) => {
    const splitted = path.split('.')
    if (splitted.length === 1) {
        // yay we reached final depth of path. but what about content?
        if (path === '') {
            return object
        } else {
            return object[splitted]
        }
    } else {
        const shifted = path.split('.')
        shifted.shift()
        if (object[splitted[0]] === undefined) {
            return undefined
        } else {
            return getItem(object[splitted[0]], shifted.join('.'))
        }
    }
    return object
}

export default function get(path, _default) {
    const res = getItem(conf, path)
    const def = getItem(defaults, path)

    /*
    So we find if we have a value set, and if we have a default set.
    If they are both objects, then merge them.

    If res is a primitive, just return that

    If there is no res, but there is a default, return that

    If there is nothing, then return the user-supplied default
     */
    let toRet = def
    if (res !== undefined) {
        if (typeof res === 'object') {
            if (typeof toRet === 'object') {
                return _.merge(def, res)
            } else {
                return res
            }
        } else {
            return res
        }
    }

    if (toRet !== undefined) {
        return toRet
    } else {
        return _default
    }
}

export function add(path, value) {
    if (value === undefined) {
        value = path
        path = ''
    }
    addItemToObject(conf, path, value)
}

export function addDefault(path, value) {
    if (value === undefined) {
        value = path
        path = ''
    }
    addItemToObject(defaults, path, value)
}

export function envShortName() {
    if (
        process.env.NODE_ENV === 'development' ||
        process.env.NODE_ENV === 'dev'
    ) {
        return 'dev'
    } else if (process.env.NODE_ENV === 'test') {
        return 'test'
    } else {
        return 'prod'
    }
}

/*
addItemToObject will merge deeply (and mutatively)

const o = {}
addItem(o, 'database', {
        dev: {
            host: 'localhost',
        },
    })

addItem(o, 'database.dev', {
        host: 'inte localhost',
    }
})

will lead to o.database.dev.host to be 'inte localhost'
 */
export function addItemToObject(object, path, content) {
    const splitted = path.split('.')
    if (splitted.length === 1) {
        // yay we reached final depth of path. but what about content?
        if (path === '') {
            _.merge(object, content)
        } else {
            if (object[path] === undefined) {
                object[path] = {}
            }
            if (typeof content === 'object') {
                _.merge(object[path], content)
            } else {
                object[path] = content
            }
        }
    } else {
        const shifted = path.split('.')
        shifted.shift()
        if (object[splitted[0]] === undefined) {
            object[splitted[0]] = {}
        }
        return addItemToObject(object[splitted[0]], shifted.join('.'), content)
    }
    return object
}

export function getLeaves(obj, path = '', collector = {}) {
    // do a depth-first search of the passed object
    const thisObj = getItem(obj, path)
    if (typeof thisObj === 'object') {
        for (const key of Object.keys(thisObj)) {
            // const value = thisObj[key]
            const newPath = path === '' ? key : path + '.' + key
            getLeaves(obj, newPath, collector)
        }
    } else {
        collector[path] = thisObj
    }
    return collector
}

export function fullConf() {
    return conf
}

export function fullDefaults() {
    return defaults
}

export function setConf(_conf) {
    // just used for testing
    conf = _conf
}

export function setDefaults(_defaults) {
    defaults = _defaults
}

export function allWithResolution() {
    // create three objects: one with every leaf in conf
    // one with every leaf in defaults
    // and a merged one, with all resolved values
    const confLeaves = getLeaves(conf)
    const defaultLeaves = getLeaves(defaults)

    let allKeys = Object.keys(confLeaves)
    for (const key of Object.keys(defaultLeaves)) {
        if (allKeys.indexOf(key) === -1) {
            allKeys.push(key)
        }
    }

    const allResolutions = {}
    for (const key of allKeys) {
        allResolutions[key] = get(key)
    }

    return {
        conf: confLeaves,
        defaults: defaultLeaves,
        resolved: allResolutions,
    }
}
