import { serialize } from '../db/serialization'
import { Renderer } from '../view/render'
import { envShortName } from '../config/config'
import { isNonProd } from '../appinfo'
import { addDebugInfo, finishRequestLogging } from '../devtools/requestdebug'
import { injectLiveReload } from '../devtools/livereload'
import get from '../config/config'
import { Flasher } from './flasher'
import { getRequestDiContainer } from '../di/web_di'

const allow = (params, ...args) => {
    let fieldNames
    if (Array.isArray(args[0])) {
        fieldNames = args[0]
    } else {
        fieldNames = args
    }

    let toRet = {}
    for (const fieldName of fieldNames) {
        if (params[fieldName] !== undefined) {
            toRet[fieldName] = params[fieldName]
        }
    }
    return toRet
}

const acceptsType = req => {
    const contentType = req.headers['content-type']
    if (contentType === 'application/json') {
        return 'json'
    }
    // todo xml?
    return 'html'
}

class RespondCollector {
    constructor() {
        this.responseJson = null
        this.responseHtml = null

        this.json = this.json.bind(this)
        this.html = this.html.bind(this)
    }

    json(callback) {
        this.responseJson = callback
    }

    html(callback) {
        this.responseHtml = callback
    }

    responderFor(type) {
        if (type === 'json' && this.responseJson) {
            return this.responseJson
        } else if (type === 'html' && this.responseHtml) {
            return this.responseHtml
        }

        if (this.responseHtml) {
            return this.responseHtml
        } else {
            return this.responseJson
        }
    }
}

export class RequestContext {
    constructor(req, res) {
        this.req = req
        this.res = res

        this.hasResponded = false

        this.redirect = this.redirect.bind(this)
        this.flash = this.flash.bind(this)

        this._logLines = []

        this._currentUser = null

        this._requestLogger = async (...args) => {
            console.log(...args)

            if (isNonProd()) {
                let toSave = []
                for (const part of args) {
                    if (part == null) {
                        toSave.push(part)
                    } else if (
                        part.toString &&
                        part.toString() === '[object Object]'
                    ) {
                        try {
                            const stringified = JSON.stringify(part)
                            toSave.push(stringified)
                        } catch (e) {
                            toSave.push(part)
                        }
                    } else {
                        toSave.push(part)
                    }
                }

                await addDebugInfo(this.req, 'log', toSave)
                this._logLines.push(toSave)
            }
        }

        this.di = getRequestDiContainer()

        this.flasher = new Flasher(req.session)
    }

    flashes() {
        return this.flasher.flashes()
    }

    flash(type, text) {
        this.flasher.flash(type, text)
    }

    async respond(responder) {
        // responder is a callback that looks like this:
        /*
        return this.respond(r => {
            r.json(() =>
                this.json({
                    success: true,
                })
            )
            r.html(() => this.render(''))
        })
         */

        const resCollector = new RespondCollector()
        responder(resCollector)

        const accType = acceptsType(this.req)
        const resp = resCollector.responderFor(accType)
        return resp()
    }

    get json() {
        const wrappedJsonIzer = async (hej, desiredSerializer) => {
            const retval = await serialize(hej, desiredSerializer)
            this.hasResponded = true

            this.res.json(retval)

            finishRequestLogging(this.req, {
                type: 'json',
                content: retval,
            })
        }
        return wrappedJsonIzer
    }

    redirect(target) {
        this.hasResponded = true
        return this.res.redirect(target)
    }

    status(number) {
        this.res.status(number)
    }

    get render() {
        const renderer = async (name, locals = {}) => {
            const renderer = new Renderer()

            const result = await renderer.render(name, locals, {
                ctx: this,
                isToplevel: true,
            })
            let unboxed = result.valueOf()

            this.hasResponded = true

            if (get('livereload.enabled')) {
                unboxed = injectLiveReload(unboxed)
            }

            this.res.send(unboxed)

            finishRequestLogging(this.req, {
                type: 'html',
                content: unboxed,
            })
        }
        return renderer
    }

    get params() {
        let toRet = {}
        if (this.req.params) {
            toRet = { ...toRet, ...this.req.params }
        }
        if (this.req.query) {
            toRet = { ...toRet, ...this.req.query }
        }
        if (this.body) {
            toRet = { ...toRet, ...this.body }
        }
        toRet.allow = allow.bind(null, toRet)
        return toRet
    }

    get rawJson() {
        const renderer = async item => {
            this.hasResponded = true
            this.res.send(item)
        }
        return renderer
    }

    get session() {
        return this.req.session
    }

    get body() {
        return this.req.body
    }

    set body(val) {
        this.req.body = val
    }

    get log() {
        return this._requestLogger
    }

    get currentUser() {
        return this._currentUser
    }

    set currentUser(val) {
        this._currentUser = val
    }

    mount(controllerInstance) {
        controllerInstance.req = this.req
        controllerInstance.res = this.res
        controllerInstance.json = this.json
        controllerInstance.render = this.render
        controllerInstance.respond = this.respond
        controllerInstance.status = this.status
        controllerInstance.redirect = this.redirect
        controllerInstance.log = this.log
    }
}
