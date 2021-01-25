import path from 'path'
import get, { envShortName } from './config/config'
let appBasedir = __dirname
let relativeBasedir = '..'
let fwBaseDir = __dirname

export function setAppBasedir(dir) {
    appBasedir = dir
    relativeBasedir = path.relative(__dirname, dir)
}

export function getFwPackageDir() {
    return path.join(__dirname, '..')
}

export function getFwBasedir() {
    return fwBaseDir
}

export function getRelativeImport(from) {
    let relative = path.relative(from, appBasedir)
    // this is needed to make template loading work in jest env. But only when testing in the "semla" project, not when in user projects.
    if (
        get('semla.selftest_template_pathing') &&
        process.env.NODE_ENV === 'test'
    ) {
        return '../' + relative
        // todo: clean this up when the root cause has been found
    }
    return relative
}

export function getAppBasedir() {
    return appBasedir
}

export function getAppMigrationsDir() {
    return appBasedir + '/app/db/migrations'
}

export function isNonProd() {
    return envShortName() === 'dev' || process.env.NODE_ENV === 'test'
}

export function isNonTest() {
    return envShortName() !== 'test'
}
