import { BaseController } from './BaseController.js'
import { registerController } from '../../fw/fw.js'
import { jsifyBody } from '../../fw/middlewares'

class UsersController extends BaseController {
    async show({ user, render }) {
        return render('users.show', {
            user,
        })
    }
}

registerController(UsersController)
