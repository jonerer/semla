import { BaseController } from './BaseController.js'
import { registerController } from '../../fw/fw.js'
import { jsifyBody } from '../../fw/middlewares'

class ApiUsersController extends BaseController {
    showMiddle() {
        // console.log('beep beep erro')
    }

    requireAuth() {
        console.log('requirar auth för req')
    }

    static setup(m) {
        m.before(jsifyBody)
        m.before(this.checkAuth)
        m.before(['me'], this.requireAuth)
        m.before(['show'], this.showMiddle)
    }

    async show({ user, res, json }) {
        console.log('yo. user:', user)

        user.name = 'newname'

        await user.save()

        return json({
            msg: 'hej',
            user,
        })
    }

    async create({ req, json, params }) {
        const u = new User()
        u.fill(params)

        await u.save()

        return json(u)
    }

    async update({ json, user, req, params }) {
        user.fill(params)
        await user.save()
        return json(user)
    }

    async delete({ user }) {
        await user.delete()
        return this.json({
            success: true,
        })
    }

    async index() {
        const allaUsers = await User.find()
        return this.json(allaUsers)

        /*
        const coolaNyaUsers = await User.find([User.name, 'mittnyacoolanamn'])
        const users = await User.find()

        const nyUser = new User()
        nyUser.cat = await Cat.findOne(6)
        await nyUser.save()
         */

        /*
        const us = new User()
        us.name = "mittnyacoolanamn"
        await us.save()

        json([us, us, us])
         */
    }

    me() {
        // console.log('kör me!')
        // console.log(User.find())
    }
}

registerController(ApiUsersController)
