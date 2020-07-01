import { registerRoutes } from 'genast'

export function routes(r) {
    r.get('', 'home@home')
}

registerRoutes(routes)
