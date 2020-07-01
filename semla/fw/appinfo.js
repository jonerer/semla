import path from 'path'
import { envShortName } from './config/config'
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
    return path.relative(from, appBasedir)
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
