import * as express from 'express'
import { getAppBasedir } from './appinfo'
import fs from 'fs'
import path from 'path'

export const staticServeDir = () => {
    const staticDir = path.join(getAppBasedir(), '/app/static')
    return staticDir
}

export const staticServePath = () => {
    return '/'
}

export const hostStatic = app => {
    const staticDir = staticServeDir()
    const path = staticServePath()
    // log('weo', staticDir)
    if (fs.existsSync(staticDir)) {
        log('hosting static!')
        app.use(path, express.static(staticDir))
    }
}
