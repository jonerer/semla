import { registerSerializer } from '../../db/serialization'

class DevFileChangeSerializer {
    async one(item, { add }) {
        add('path', 'applied', 'text', 'applicable', 'id')
    }
}

registerSerializer(DevFileChangeSerializer)
