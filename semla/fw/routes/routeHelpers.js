import { generateRoutes } from './routes'
import { addGlobal } from '../globals'

export function prepareRouteHelpers() {
    const routes = generateRoutes()

    const helpers = routes.map(r => r.pathHelper)

    for (const helper of helpers) {
        addGlobal(helper.getGlobal()) // get the global from the path helper
    }
}
