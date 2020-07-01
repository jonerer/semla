import { registerController } from '../../fw'
import { getControllers } from '../../controllers/setup'

class DevControllersController {
    index() {
        const controllers = getControllers()

        return this.json(controllers, 'devcontrollers')
    }
}

registerController(DevControllersController)
