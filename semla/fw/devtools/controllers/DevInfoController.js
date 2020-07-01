import { registerController } from '../../controllers/setup'
import { envShortName } from '../../config/config'

class DevInfoController {
    index() {
        return this.json({
            envShortName: envShortName(),
        })
    }
}

registerController(DevInfoController)
