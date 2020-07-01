import { BaseController } from './BaseController'
import { registerController } from '../../fw/fw'

class ParamsTesterController extends BaseController {
    async test({ params }) {
        let allowed = params.allow('paramOne', 'queryOne', 'bodyOne')
        return this.json({
            all: params,
            allowed,
        })
    }
}

registerController(ParamsTesterController)
