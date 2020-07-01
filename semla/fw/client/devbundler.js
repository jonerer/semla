import path from 'path'
import fs, { promises as fsPromises } from 'fs'
import { getAppBasedir } from '../appinfo'
import Bundler from 'parcel-bundler'

let loadAppVueDir = ['app/client/components']

async function walk(dir) {
    let files = await fsPromises.readdir(dir)
    files = await Promise.all(
        files.map(async file => {
            const filePath = path.join(dir, file)
            const stats = await fsPromises.stat(filePath)
            if (stats.isDirectory()) return walk(filePath)
            else if (stats.isFile()) return filePath
        })
    )

    return files.reduce((all, folderContents) => all.concat(folderContents), [])
}

const hasComponentsDir = () => {
    let has = false
    for (const item of loadAppVueDir) {
        has = has || fs.existsSync(getAppBasedir() + item)
    }
    return has
}

const listAllComponents = async () => {
    let all = []
    for (const dir of loadAppVueDir) {
        const allItems = (await walk(dir)).filter(x => x.endsWith('vue'))
        for (const item of allItems) {
            all.push(item)
        }
    }
    return all
}

export const initDevBundler = async () => {
    return // this doesn't work well yet.
    if (!hasComponentsDir) {
        return
    }

    const entryFiles = await listAllComponents()

    const opts = {
        watch: true,
    }

    const bundler = new Bundler(
        //getAppBasedir + '/app/client/components/*.vue',
        entryFiles,
        opts
    )

    // const bundle = await bundler.bundle()

    // console.log('done bundling!', bundle)
}
