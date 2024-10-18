import { registerController } from '../../fw'
import { getModels } from '../../db/models.js'
import { generateRoutes } from '../../routes/routes'

class DevRoutesController {
    index() {
        const routes = generateRoutes()

        return this.json(routes, 'devroutes')
    }
}

registerController(DevRoutesController)
