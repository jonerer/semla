import { registerSerializer } from '../../db/serialization.js'

class DevGlobalsSerializer {
    async one(item, { add }) {
        add('name', 'description')
    }
}

registerSerializer(DevGlobalsSerializer)
