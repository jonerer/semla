import { registerSerializer } from '../../db/serialization'

class DevGlobalsSerializer {
    async one(item, { add }) {
        add('name', 'description')
    }
}

registerSerializer(DevGlobalsSerializer)
