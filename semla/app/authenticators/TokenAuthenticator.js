import { registerAuthenticator } from '../../fw/authentication/authenticators'

// TODO: remove or flesh out this concept
class TokenAuthenticator {
    getUser(ctx) {
        const headers = ctx.req.headers()
        console.log(headers)
    }
}

registerAuthenticator(TokenAuthenticator)
