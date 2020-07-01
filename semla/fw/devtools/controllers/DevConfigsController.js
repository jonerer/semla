import { registerController } from '../../fw'
import { allWithResolution } from '../../config/config'

class DevConfigsController {
    async index() {
        const allR = allWithResolution()

        const wash = part => {
            for (const key of Object.keys(allR[part])) {
                const value = allR[part][key]
                if (value && key.indexOf('password') !== -1) {
                    allR[part][key] = '******'
                }
            }
        }

        // wash out the passwords
        wash('conf')
        wash('defaults')
        wash('resolved')

        this.json(allR)
    }
}

registerController(DevConfigsController)
