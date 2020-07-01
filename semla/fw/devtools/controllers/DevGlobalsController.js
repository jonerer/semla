import { registerController } from '../../fw'
import { getModels } from '../../db/models'
import { getGlobals } from '../../globals'

class DevGlobalsController {
    index() {
        const globals = getGlobals()

        return this.json(globals, 'devglobals')
    }
}

registerController(DevGlobalsController)
