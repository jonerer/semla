import { isNonProd } from '../../appinfo'
import get from '../../config/config'

class CtxDebugInfo {
    constructor(req) {
        this.req = req
        this.loggedRequest = null
        this.ctx = null
    }

    async persist() {
        if (this.loggedRequest) {
            // update it
        } else {
            const r = new DevLoggedRequest()
            r.path = this.req.path
            r.method = this.req.method
            r.debuginfo = JSON.stringify({})
            r.requestdata = JSON.stringify({
                headers: this.req.headers,
                body: this.req.body,
                query: this.req.query,
                params: this.req.params,
            })
            try {
            await r.save()
            } catch(e) {
                console.warn('Unable to log request. Error was: ' + e.toString())
            }
            this.loggedRequest = r
        }
    }

    async addDebugInfo(type, info) {
        if (type === 'log') {
            let r = this.loggedRequest
            const parsedDebugInfo = JSON.parse(r.debuginfo)
            parsedDebugInfo.logs = parsedDebugInfo.logs || []
            parsedDebugInfo.logs.push(info)
            r.debuginfo = JSON.stringify(parsedDebugInfo)
            await r.save()
        }
    }

    async addResponse({ type, content, error }) {
        // since the ctx should be initialized by now, we can add the "params" thingy
        let responseObj = {
            type,
            content,
            statusMessage: this.req.res.statusMessage,
        }
        if (error) {
            responseObj.stack = error.stack
        }
        const responsedata = JSON.stringify(responseObj)

        const r = this.loggedRequest
        r.statuscode = this.req.res.statusCode
        r.responsedata = responsedata
        await r.save()
    }
}

const shouldLog = req => {
    const logDevRequests = get('fw.requestlog.log_devrequests')
    const isDevRequest =
        req.path.startsWith('/devtools/') || req.path.startsWith('/api/dev/')
    // todo maybe this is a bit too hardcoded
    return !isDevRequest || (isDevRequest && logDevRequests)
}

export function finishRequestLogging(req, response) {
    if (isRequestDebugging() && shouldLog(req)) {
        const cdi = req.ctxDebugInfo
        return cdi.addResponse(response)
    }
}

export function isRequestDebugging() {
    return isNonProd() && DevLoggedRequest.loaded()
}

export async function addDebugInfo(req, type, info) {
    if (isRequestDebugging() && shouldLog(req)) {
        const cdi = req.ctxDebugInfo
        await cdi.addDebugInfo(type, info)
    }
}

/*
export async function loggedRequestRouted(req) {
    if (isRequestDebugging()) {
        const cdi = req.ctxDebugInfo
        await cdi.routed()
    }
}
 */

export function initRequestLogger(app) {
    if (isRequestDebugging()) {
        app.use(async (req, res, next) => {
            if (shouldLog(req)) {
                const cdi = new CtxDebugInfo(req)
                await cdi.persist()
                req.ctxDebugInfo = cdi
            }
            next()
        })
    }
}
