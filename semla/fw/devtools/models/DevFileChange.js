import { registerModel } from '../../db/models'
import { DevBaseModel } from './DevBaseModel'

export class DevFileChange extends DevBaseModel {
    static setup(m) {
        m.fillable(['text', 'path', 'applied'])
        m.validate(v => {
            v.present('text')
            v.present('path')
            v.present('applied')
        })
    }
}

registerModel(DevFileChange)
