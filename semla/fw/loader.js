import path from 'path'
import fs from 'fs'
import { getRelativeImport } from './appinfo'

const loadInitDirs = ['app/init']

let loadAppDirs = ['app/controllers', 'app/models', 'app/serializers']
const absoluteImportDirs = []

export const addAppImportDir = dir => {
    loadAppDirs.push(dir)
}

const loadedFiles = []
const loadedDirs = []

export function getLoadedFiles() {
    return loadedFiles
}

export function getLoadedDirs() {
    return loadedDirs
}

export const setAppImportDirs = dirs => {
    loadAppDirs = dirs
}

export const addAbsoluteImportDir = dir => {
    absoluteImportDirs.push(dir)
}

export function addAppDir(dir) {
    loadAppDirs.push(dir)
}

const initFilesToImport = async () => {
    const dirs = loadInitDirs
    const rel = getRelativeImport(__dirname)
    let toRet = []

    // app-relative imports
    for (const dir of dirs) {
        const relDir = path.join(rel, dir)
        // console.log(path.resolve(relDir))
        const conts = fs.readdirSync(path.resolve(__dirname, relDir)) // relative to cwd somehow?
        for (const file of conts) {
            const fullpath = path.join(relDir, file) // the path relative to this file
            toRet.push(fullpath)
        }
        loadedDirs.push(dir)
    }
    return toRet
}

const allFilesToImport = async () => {
    const dirs = loadAppDirs
    const rel = getRelativeImport(__dirname)
    let toRet = []

    // app-relative imports
    for (const dir of dirs) {
        const relDir = path.join(rel, dir)
        // console.log(path.resolve(relDir))
        const conts = fs.readdirSync(path.resolve(__dirname, relDir)) // relative to cwd somehow?
        for (const file of conts) {
            const fullpath = path.join(relDir, file) // the path relative to this file
            toRet.push(fullpath)
        }
        loadedDirs.push(dir)
    }

    // absolute imports
    for (const dir of absoluteImportDirs) {
        const conts = fs.readdirSync(dir)
        for (const file of conts) {
            toRet.push(path.join(dir, file))
        }
        loadedDirs.push(dir)
    }

    return toRet
}

export const loadAllFiles = async () => {
    const initFiles = await initFilesToImport()
    // log('Loading init file', initFiles)
    await Promise.all(
        initFiles.map(file => {
            loadedFiles.push(file)
            return import(file)
        })
    )
    const files = await allFilesToImport()
    await Promise.all(
        files.map(file => {
            //const rel = getRelativeImport(__dirname)
            const toImp = file // path.join(file, file)
            // console.log('importing ', toImp)
            loadedFiles.push(toImp)
            return import(toImp)
        })
    )
}
