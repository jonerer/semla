import { BaseController } from './BaseController.js'
import { registerController } from '../../fw/fw.js'

class CatsController extends BaseController {
    static setup() {}

    async create({ params }) {
        const c = new Cat()
        c.fill(params)
        await c.save()

        await this.json(c)
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

registerController(CatsController)
