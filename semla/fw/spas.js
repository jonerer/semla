import execa from 'execa'
import path from 'path'
import get from './config/config'
import { isNonProd, isNonTest } from './appinfo'
import express from 'express'

const spas = {}
let fwSpa = null

export function getFwSpa() {
    return fwSpa
}

const spaCwd = spa => {
    return path.resolve(spa.path())
}

export function registerSpa(cls) {
    const name = cls.name.split('Spa')[0]

    const obj = new cls()
    if (name === 'Devtools') {
        // special case for the devtools spa
        fwSpa = obj
    }
    console.log(fwSpa)

    spas[name] = obj
    obj._name = name
}

function startDevSpa(obj) {
    if (!get('spas.start_dev')) {
        return
    }

    const devCommand = obj.devCommand()
    const name = obj._name
    //const proc = execa(obj.devCommand(), {
    const cwd = spaCwd(obj)
    console.log(
        'Starting SPA ' +
            name +
            ' by running command ' +
            devCommand +
            ' in folder ' +
            cwd
    )

    const proc = execa.command(devCommand.command, {
        cwd,
    })

    proc.stdout.on('data', d => {
        const s = new String(d, 'utf-8').trim()
        console.log('[' + name + ']' + s)
    })

    proc.stderr.on('data', d => {
        const s = new String(d, 'utf-8').trim()
        console.error('[' + name + '-error]' + s)
    })
}

export function startDevMode(app) {
    // register the user's dev spas
    for (const spaName of Object.keys(spas)) {
        const spa = spas[spaName]

        startDevSpa(spa)
    }

    // register the dev tools spa to be hosted
    if (isNonProd() && get('devtools.enabled') && !get('fw.develop.devtools')) {
        // at this point, this file will be in genast/lib/ and the built devtools in genast/lib/semdoc_build
        const ppath = path.join(__dirname, 'devtools_client_build')
        // log(ppath)
        app.use('/devtools', express.static(ppath))
        app.get('/devtools/*', (req, res) => {
            res.sendFile(path.resolve(ppath, 'index.html'))
        })
        if (isNonTest()) {
            console.log('Starting devtools at /devtools')
        }
    }
}

export function buildSpa(spa) {
    const buildCmd = spa.buildCommand()
    const cwd = spaCwd(spa)
    const name = spa._name

    console.log(
        'Building SPa ' +
            name +
            ' by running command ' +
            buildCmd.command +
            ' in folder ' +
            cwd
    )

    const proc = execa.commandSync(buildCmd.command, {
        cwd,
    })
    console.log('done')

    proc.stdout.on('data', d => {
        const s = new String(d, 'utf-8').trim()
        console.log('[' + name + ']' + s)
    })

    proc.stderr.on('data', d => {
        const s = new String(d, 'utf-8').trim()
        console.error('[' + name + '-error]' + s)
    })
}
