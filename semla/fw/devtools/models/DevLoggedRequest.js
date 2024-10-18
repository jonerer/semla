import { registerModel } from '../../db/models.js'
import { DevBaseModel } from './DevBaseModel'

export class DevLoggedRequest extends DevBaseModel {
    static setup(m) {
        m.validate(v => {
            v.present('method')
            v.present('path')
            v.present('requestdata')
        })
    }
}

registerModel(DevLoggedRequest)
