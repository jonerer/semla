import { generateRoutes } from '../routes/routes'
import { getController, runMiddleware, getControllers } from '../controllers/setup'
import { Renderer } from '../view/render'
import { getFwBasedir, isNonProd } from '../appinfo'
import { getAuthenticatorForRoute } from '../authentication/authenticators'
import { initSessionManagement, addSessionToRoute } from './sessions'
import { RequestContext } from './context'
import { handleCsrf } from './csrf'
import {
    finishRequestLogging,
    initRequestLogger,
    loggedRequestRouted,
} from '../devtools/requestdebug'
import get from '../config/config'
import cookieParser from 'cookie-parser'

function add404Handler(app) {
    app.use(function(req, res, next) {
        console.log('404 not found: ', req.method, '-', req.path)
        res.status(404).send('Http 404 not found')
    })
}

async function handleError(err, req) {
    const ctx = req.ctx || {}
    let res = req.res
    console.log(`Error from controller on path (${req.path}):`, err)
    const errorRenderer = new Renderer()
    errorRenderer.setViewsDirectory(getFwBasedir() + '/debug_views')
    const statusCode = 500
    res.status(statusCode)
    if (isNonProd()) {
        const result = await errorRenderer.render(
            'fw_dev_err',
            {
                err,
            },
            { ctx }
        )
        const unboxed = result.valueOf()
        finishRequestLogging(req, {
            type: 'html',
            content: unboxed,
            error: err,
        })
        res.send(unboxed)
    } else {
        const result = await errorRenderer.render(
            'fw_production_err',
            {
                err,
            },
            { ctx }
        )
        res.send(result.valueOf())
    }
}

function addErrorCatcher(app) {
    app.use((err, req, res, next) => {
        handleError(err, req)
    })
}

export function fallbacks(app) {
    add404Handler(app)
    addErrorCatcher(app)
}

function initCookieParser(app) {
    if (get('cookies.active')) {
        let secret = get('session.key')
        if (!secret) {
            throw new Error(
                "You're using cookies, but haven't set a session.key."
            )
        }
        app.use(cookieParser(secret))
    }
}

export async function web(app) {
    initCookieParser(app)
    await initSessionManagement(app)
    initRequestLogger(app)

    const generatedRoutes = await generateRoutes()
    // console.log('All routes:', generatedRoutes)
    for (const route of generatedRoutes) {
        // log(route.path)

        if (route.useSession()) {
            addSessionToRoute(app, route)
        }

        handleCsrf(app, route)

        app[route.method].call(app, route.path, async (req, res) => {
            // console.log(route)
            const ctx = new RequestContext(req, res)
            req.ctx = ctx
            // await loggedRequestRouted(req)
            try {
                const { controllerName, action: actionName } = route

                const controllerClass = getController(controllerName)

                if (!controllerClass) {
                    const controllerNames = getControllers().map(x => {
                        return x.name
                    }).join(',')
                    throw new Error(
                        'No controller called ' +
                            controllerName +
                            ' registered. There should be one for URL ' +
                            route.path + '. Available controllers: ' + controllerNames
                    )
                    return
                }

                const auth = getAuthenticatorForRoute(route)

                /*
                if (route.options.csrfProtection) {
                    await doCsrfProtection(route)
                }
                */

                const controllerInstance = new controllerClass()

                ctx.mount(controllerInstance)

                await runMiddleware(controllerInstance, actionName, ctx)

                if (req.matchedParams) {
                    Object.keys(req.matchedParams).forEach(key => {
                        ctx[key] = req.matchedParams[key]
                    })
                }

                const action = controllerInstance[actionName]
                if (!action) {
                    throw new Error(
                        `No such action ${controllerName}@${route.action}!`
                    ) // todo: should 404
                } else {
                    await action.call(controllerInstance, ctx)
                }
                const hasResponded = ctx.hasResponded
                if (!hasResponded) {
                    throw new Error(
                        `The controller action ${controllerName}@${actionName} didn't send a response. ` +
                            "It's likely that you forgot to await or return " +
                            'the render() or json() call.'
                    )
                }
            } catch (err) {
                await handleError(err, req)
            }
        })
    }
}
