import { BaseController } from './BaseController'
import { registerController } from '../../fw/fw'

class HomeController extends BaseController {
    async home({ render }) {
        const allUsers = await User.find()
        return render('home', {
            variabel: 'hej',
            allUsers,
        })
    }

    async templateTester() {
        function promiser(toRet) {
            return new Promise(resolve => {
                // for fun, return something from the params
                resolve(toRet)
            })
        }

        return this.render('home.templateTester', {
            promval: promiser(100),
        })
    }
}

registerController(HomeController)
