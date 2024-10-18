import { BaseModel } from './BaseModel.js'
import { registerModel } from '../../fw/db/models.js'

class Cat extends BaseModel {
    static setup(m) {
        m.hasMany('users')
        m.fillable(['name', 'color'])

        m.validate(v => {
            v.present(['name', 'color'])
            v.custom(this.maxTwoOwners, {
                creation: false,
            })
        })
    }

    async maxTwoOwners() {
        const owners = await this.users
        return owners.length <= 2
    }
}

registerModel(Cat)
