import { registerSerializer } from '../../fw/db/serialization.js'

class CatExtendedSerializer {
    async one(cat) {
        const obj = {
            id: cat.id,
        }
        obj.users = await this.json(cat.users)
        return obj
    }
}

registerSerializer(CatExtendedSerializer)
