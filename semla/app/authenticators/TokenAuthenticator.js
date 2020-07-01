import { registerAuthenticator } from '../../fw/authentication/authenticators'

class TokenAuthenticator {
    getUser(ctx) {
        const headers = ctx.req.headers()
        console.log(headers)
    }
}

registerAuthenticator(TokenAuthenticator)
