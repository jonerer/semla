import { BaseModel } from './BaseModel.js'
import { registerModel } from '../../fw/db/models'

class User extends BaseModel {
    static setup(m) {
        m.belongsTo('cat')
        m.fillable(['name', 'email', 'catId'])

        m.validate(v => {
            v.present('name')
        })
    }
}

registerModel(User)
