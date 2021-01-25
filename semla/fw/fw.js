import express from 'express'
import { prepareModels } from './db/models'
import { registerModelsAsQueryParams } from './db/models'
import * as bodyParser from 'body-parser'
import { close } from './db/db'
import { isNonProd, isNonTest } from './appinfo'
import { runMigrations } from './db/migrations/migration'
import { load as loadSessions } from './web/sessions'

export { registerController } from './controllers/setup'
export { registerModel } from './db/models'
export { registerRoutes } from './routes/routes'
export { setAppBasedir as setBasedir } from './appinfo'
export { requireParams } from './middlewares'
import * as dotenv from 'dotenv'
export { registerInitializer } from './initialize/startup'
export { registerSerializer } from './db/serialization'

export { ModelSetupCollector } from './db/models/collector'
export { MigrationCollector } from './db/migrations/collector'

export { add, get } from './config/config'

import { loadAllFiles, addAbsoluteImportDir } from './loader'
import cors from 'cors'
import { addMigrationFileDir } from './db/migrations/migration'
import config, { envShortName } from './config/config'
import { afterLoad, initialize as initInitializers } from './initialize/startup'
import { web, fallbacks } from './web/web'
import { prepareRouteHelpers } from './routes/routeHelpers'
import { startDevMode } from './spas'

import { initDevBundler } from './client/devbundler'
import { hostStatic } from './static.js'
import { initLiveReload } from './devtools/livereload'
import { applyDefaultConfig } from './config/defaults'
import { generateTypes } from './db/typegen'
import { generateDescriptions } from './db/descriptiongen'

import debug from 'debug'

const dbg = debug('semla:fw')

const log = console.log.bind(console)
global.log = log

dotenv.config()

const setupEnv = () => {
    dbg('setting up env')
    if (!process.env.NODE_ENV) {
        process.env.NODE_ENV = 'development'
    }

    if (envShortName() === 'dev') {
        initDevBundler()
    }

    if (isNonProd()) {
        if (isNonTest()) {
            // console.log('Running in development mode, importing devtools')
        }
        addAbsoluteImportDir(__dirname + '/devtools/controllers')
        addAbsoluteImportDir(__dirname + '/devtools/serializers')
        addAbsoluteImportDir(__dirname + '/devtools/models')
        addAbsoluteImportDir(__dirname + '/devtools/init')
        addMigrationFileDir(__dirname + '/devtools/db/migrations')

        if (config('devtools.enabled')) {
            addAbsoluteImportDir(__dirname + '/devtools/spas')
        }
    }

    applyDefaultConfig()
}

const setupApp = app => {
    if (isNonProd()) {
        app.use(cors()) // todo fine-tune
    }
}

export async function load() {
    setupEnv()

    if (isNonTest()) {
        // console.log(envShortName())
        // console.log('Loading files...')
    }
    await loadAllFiles()
    if (isNonTest()) {
        console.log('Initializing...')
    }

    initInitializers()

    loadSessions() // this is just to add the sessions migration
    await prepareModels()
}

export async function runMigrationsCli() {
    await load()
    return runMigrations()
}

export async function start() {
    try {
        dbg('loading')
        await load()
        await afterLoad()

        dbg('prepare route helpers')
        await prepareRouteHelpers()

        const app = express()
        setupApp(app)
        await registerModelsAsQueryParams(app)

        dbg('generate types and descriptions')
        await generateTypes()
        await generateDescriptions()

        app.use(bodyParser.json())
        app.use(bodyParser.urlencoded({ extended: true }))

        startDevMode(app)
        initLiveReload()

        await web(app)

        hostStatic(app)

        fallbacks(app)

        return new Promise((resolve, reject) => {
            const port = config('port')
            dbg('starting to listen')
            const server = app.listen(port, () => {
                if (isNonTest()) {
                    console.log('Running on port', port + ', have fun!')
                }
            })

            resolve({
                shutdown: () => {
                    return new Promise(resolve => {
                        close()
                        server.close(() => {
                            resolve()
                        })
                    })
                },
            })
        })
    } catch (e) {
        console.log(e.stack)
        throw new Error(
            'Server failed to start! ' + e.message + '. Stack: \n' + e.stack
        )
    }
}
