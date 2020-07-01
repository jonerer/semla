import { RouteCollector } from './collector'
import { RouteFlattener } from './flattener'

let routers = []

export function registerRoutes(routes) {
    routers.push(routes)
}

export function clearRoutes() {
    routers.length = 0
}

export function getRouters() {
    return routers
}

export function generateRoutes() {
    let collectors = []
    for (const router of routers) {
        const collector = new RouteCollector()
        router(collector)

        collectors.push(collector)
    }

    let toRet = []
    for (const collector of collectors) {
        const flattener = new RouteFlattener()
        const routes = flattener.getRoutes(collector)
        // routes is a list of GeneratedRoute objects
        toRet = toRet.concat(routes)
    }

    return toRet
}
