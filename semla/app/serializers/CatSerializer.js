import { registerSerializer } from '../../fw/db/serialization'

class CatSerializer {
    async one(cat) {
        const obj = {
            id: cat.id,
        }
        return obj
    }
}

registerSerializer(CatSerializer)
