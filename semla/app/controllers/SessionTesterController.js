import { BaseController } from './BaseController'
import { registerController } from '../../fw/fw'

class SessionTesterController extends BaseController {
    async set({ params, session }) {
        const toSet = params.toSet
        session.value = toSet

        return this.json(session)
    }

    async get({ session }) {
        return this.json(session)
    }
}

registerController(SessionTesterController)
