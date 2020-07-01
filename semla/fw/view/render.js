import fs from 'fs'
import path from 'path'
import { TemplateCompiler } from './compiler'
import { output, TemplateSupport, url_for, addHelpers } from './templateSupport'
import { getRelativeImport } from '../appinfo'
import chokidar from 'chokidar'
import url from 'url'
import { reload } from '../devtools/livereload'

class RenderCache {
    static init() {
        if (!RenderCache.templates) {
            RenderCache.templates = {}
        }
    }

    static addTemplate(name, callback) {
        RenderCache.templates[name] = callback
    }

    static getTemplate(name) {
        return RenderCache.templates[name]
    }
}

export class Renderer {
    constructor(opts = {}) {
        RenderCache.init() // todo: don't do this as often
        this.options = opts

        this.viewsDirectory = './app/views'
    }

    async compile(targetFilePath, targetCachedFile) {
        const compiler = new TemplateCompiler()
        if (this.options.jsDefaults) {
            compiler.jsFileDefaults()
        }
        compiler.load(targetFilePath)

        // log('Compiling', targetFilePath, '. content: ', compiler.originalText)

        const compiled = compiler.compileToString()
        fs.writeFileSync(targetCachedFile, compiled, 'utf-8')

        //const loadedTemplate = await import('../../' + targetCachedFile)
        const abs = path.resolve(
            targetCachedFile
            //join(getRelativeImport(__dirname), targetCachedFile)
        )

        //console.log('abs:', abs)
        //const u = url.pathToFileURL(abs).href //.href.split('.')[0] // + '?cachebust=' + Math.random()
        //await import(u)
        // await import('file:///C:/prog/node/gapp/cache/views/home.js')

        const rel = path.join(getRelativeImport(__dirname), targetCachedFile)
        //console.log('rel:', abs)
        const u2 = rel // + '?cachebust=' + Math.random()

        //console.log('loading ', u2)
        /*
        Note that we're deleting from the require cache, even though we're using "import" to import stuff.
        This is because babel transpiles stuff into a CJS module, and turns our import into a "require".
        Which is actually lucky, because ES Module imports don't actually support clearing import cache. What?

        However, this transpilation is also the reason why we can't use a
        url.pathToFileURL(abs).href + ?cachebust= Math.random() thingy.
        Because "require" doesn't allow you to import file:// urls. But import *requires* you to use file urls.
        ** ONLY ON WINDOWS **.

        Because actually importing an actual file from an absolute path doesn't work with import() *on windows*.
        Apparently it works "accidentally" on mac/linux, but not on windows. All according to spec -_--
        https://github.com/nodejs/node/issues/31710
         */

        delete require.cache[abs]
        const loadedTemplate = await import(u2)
        return loadedTemplate.default
    }

    setViewsDirectory(viewsDir) {
        this.viewsDirectory = viewsDir
    }

    async getTemplateFunction(name) {
        if (RenderCache.getTemplate(name)) {
            return RenderCache.getTemplate(name)
        }

        /* todo: handle subdirs */
        const splittedName = name.split('.')
        splittedName.pop()
        const subdirs = splittedName.join('/')
        const basenameSplit = name.split('.')
        const basename = basenameSplit[basenameSplit.length - 1]

        const viewDirectory = this.viewsDirectory + '/' + subdirs
        const viewCacheDirectory = './cache/views'

        const rawViewFilename = basename + '.tmp'
        const cacheDir = fs.readdirSync(viewCacheDirectory)

        const cachedFilename = name + '.js'
        const targetCachedFile = path.join(viewCacheDirectory, cachedFilename)

        const targetTemplateDir = viewDirectory
        const targetFilePath = path.join(targetTemplateDir, rawViewFilename)

        const viewDirConts = fs.readdirSync(targetTemplateDir)

        const fileExists = viewDirConts.find(x => x === rawViewFilename)

        if (!fileExists) {
            throw new Error(
                'Tried to find a template called ' +
                    rawViewFilename +
                    " but it didn't exist in " +
                    targetTemplateDir
            )
        }

        chokidar.watch(targetFilePath).on('change', async path => {
            // Just wait a little bit. Seems to make Windows work smoother
            setTimeout(async () => {
                try {
                    const result = await this.compile(
                        targetFilePath,
                        targetCachedFile
                    )
                    console.log('Recompiled template', name, 'from path', path)
                    RenderCache.addTemplate(name, result)

                    reload()
                } catch (e) {
                    console.log('Recompile failed:', e)
                }
            }, 100)
        })

        const compiled = await this.compile(targetFilePath, targetCachedFile)
        //console.log('Compiled template', name)
        RenderCache.addTemplate(name, compiled)
        return compiled
    }

    async layoutToUse(input) {
        // if input is not null, then use what the user wants
        // otherwise, fall back to "layouts/layout.tmp" if it exists
        // it it doesn't then no layout
        if (input) {
            return await this.getTemplateFunction(input)
        }
        try {
            const inst = await this.getTemplateFunction('layouts.layout')
            return inst
        } catch (e) {}
    }

    async render(name, locals, options = {}) {
        const { ctx, isToplevel } = options
        let { layout } = options
        if (isToplevel) {
            layout = await this.layoutToUse(layout)
        }
        // this is the function getting called from the controller

        if (typeof locals === 'object') {
            for (const key of Object.keys(locals)) {
                const value = locals[key]
                if (value && value.then && typeof value.then === 'function') {
                    // resolve all the promises
                    locals[key] = await value
                }
            }
        }
        const inst = await this.getTemplateFunction(name)

        // todo: come up with a strategy for this stuff. Add stuff on the fly for renderings?
        // should this be baked into the rendered template? (to avoid h.blah)
        // meaning should this be expanded like const { ${support.getExportables()}.join(',') } = support ?
        // if so, when the exportables vary, then we need to recompile.
        // so the compilation will have to have a tag or something to signify what set of exportables it supports.
        // like the filename could be home-j987j90j879j90.js where j98j989 is a hash of the exportable names

        const support = new TemplateSupport(ctx)

        addHelpers(support)

        support.output = output
        support.url_for = url_for
        support.include = async (name, localLocals) => {
            let localsToUse = { ...localLocals }
            if (typeof localLocals === 'object') {
                localsToUse = { ...localsToUse, ...localLocals }
            }
            const subOptions = {
                ...options,
                isToplevel: false,
            }
            const subTemplate = await this.render(name, localsToUse, subOptions)
            // result should be a string
            subTemplate.unsafeRawOutput = true
            return subTemplate
        }

        const results = new String(await inst.call(null, locals, support, ctx))
        // this is to allow us to add "unsafeRawOutput".
        // You can't do that on a string primitive, but on a boxed string you can.
        if (layout) {
            results.unsafeRawOutput = true
            const content = () => {
                return results
            }
            const supportWithContent = {
                content,
                ...support,
            }
            const renderedLayout = await layout.call(
                null,
                locals,
                supportWithContent,
                ctx
            )
            return new String(renderedLayout)
        } else {
            return results
        }
    }
}
