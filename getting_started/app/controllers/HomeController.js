import { BaseController } from './BaseController'
import { registerController } from 'semla'

class HomeController extends BaseController {
    async home({ render }) {
        return render('home.home')
    }
}

registerController(HomeController)
