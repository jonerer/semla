import { registerSerializer } from '../../fw/db/serialization.js'

class UserSerializer {
    /*
    async one(user) {
        const obj = {
            id: '' + user.id,
            name: user.name,
            email: user.email ? user.email : ' - no email supplied - ',
        }

        if (user.cat) {
            obj.cat = await this.json(user.cat)
        }

        return obj
    }

     */

    async one(user, { add, addString }) {
        add(['name', 'cat'])
        addString('id')
        add({
            email: user.email ? user.email : ' - no email supplied - ',
        })
    }
}

registerSerializer(UserSerializer)
