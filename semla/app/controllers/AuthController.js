import { BaseController } from './BaseController.js'
import { registerController } from '../../fw/fw.js'

class AuthController extends BaseController {
    async login() {
        return this.render('auth.login')
    }

    async register() {
        return this.render('auth.login')
    }

    async dologin({ params }) {
        return this.render('auth.login')
    }

    async doregister({ params }) {
        return this.render('auth.login')
    }

    async update({ cat, params }) {
        cat.fill(params)
        await cat.save()

        return this.json(cat)
    }

    async show({ cat }) {
        return this.json(cat, 'CatExtended')
    }

    async index() {
        const cols = await Cat.find()

        const col = new Cat()
        col.name = 'color #' + (cols.length + 1)
        col.color = 'gray'
        await col.save()
        return this.json(col)
    }
}

registerController(AuthController)
