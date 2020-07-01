import { registerController } from '../../controllers/setup'

class DevHomeController {
    home() {
        return this.json({
            hej: 'san',
        })
    }
}

registerController(DevHomeController)
