import { BaseController } from './BaseController'
import { registerController } from '../../fw/fw'

class CsrfTesterController extends BaseController {
    async show() {
        return this.render('csrf.show')
    }

    async post() {
        return this.render('csrf.show')
    }
}

registerController(CsrfTesterController)
