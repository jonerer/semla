import { BaseController } from './BaseController'
import { registerController } from '../../fw/fw'

class AuthTesterController extends BaseController {
    static setup(m) {
        m.before(this.requireAuth)
    }

    requireAuth({ req }) {
        if (!req.isAuthed) {
            throw new Error('not authed!')
        }
    }

    async testAuth() {
        return this.json({
            success: true,
        })
    }
}

registerController(AuthTesterController)
