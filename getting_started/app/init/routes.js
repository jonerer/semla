import { registerRoutes } from 'semla'

export function routes(r) {
    r.get('', 'home@home')
}

registerRoutes(routes)
