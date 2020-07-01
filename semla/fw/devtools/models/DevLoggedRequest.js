import { registerModel } from '../../db/models'
import { DevBaseModel } from './DevBaseModel'

class DevLoggedRequest extends DevBaseModel {
    static setup(m) {
        m.validate(v => {
            v.present('method')
            v.present('path')
            v.present('requestdata')
        })
    }
}

registerModel(DevLoggedRequest)
