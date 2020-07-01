import get, { envShortName } from '../config/config'
import { v4 as uuid } from 'uuid'
import * as crypto from 'crypto'
import { isNonProd } from '../appinfo'

export const DEV_DEBUG_CSRF_SECRET = 'DEV_DEBUG_CSRF_SECRET'
export function handleCsrf(app, route) {
    if (route.csrfProtected()) {
        checkCsrf(app, route)
    }
    addCsrfToRequest(app, route)
}

function addExpressMiddleware(app, route, middleware) {
    app.use(route.path, (req, res, next) => {
        if (route.method !== req.method.toLowerCase()) {
            // we're not on the route we care about. just same path
            return next()
        }

        middleware(req, res, next)
    })
}

function addCsrfToRequest(app, route) {
    addExpressMiddleware(app, route, (req, res, next) => {
        // todo: fall back to cookies if sessions are off?
        if (get('session.active')) {
            if (req.session.csrfSecret) {
                return next()
            }

            req.session.csrfSecret = uuid()
        }
        next()
    })
}

function checkCsrf(app, route) {
    addExpressMiddleware(app, route, (req, res, next) => {
        if (route.method === 'get') {
            next()
        } else {
            // try to get token from req.session
            const correctSource = req.session.csrfSecret
                ? req.session.csrfSecret
                : ''
            let suppliedSource = req.body._csrfSecret
                ? req.body._csrfSecret
                : ''

            if (envShortName() === 'dev') {
                if (suppliedSource === DEV_DEBUG_CSRF_SECRET) {
                    return next()
                }
            }

            const invalidMsg =
                'Invalid CSRF token. Did you forget to add CSRF tag to a form? You can do this with {{ h.csrfTag() }}'

            if (correctSource.length !== suppliedSource.length) {
                return next(new Error(invalidMsg))
            }

            const correct = Buffer.from(correctSource)
            const supplied = Buffer.from(suppliedSource)

            if (!req.session || !req.session.csrfSecret) {
                next(
                    new Error(
                        'No CSRF Secret set in session. If sessions are off (via session.active), then you also need to turn off CSRF protection (via routes.defaults.csrfProtection)'
                    )
                )
            } else {
                const isCorrect = crypto.timingSafeEqual(correct, supplied)
                if (!isCorrect) {
                    next(new Error(invalidMsg))
                } else {
                    next()
                }
            }
        }
    })
}
