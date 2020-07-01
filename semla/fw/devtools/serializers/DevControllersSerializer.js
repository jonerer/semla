import { registerSerializer } from '../../db/serialization'

class DevControllersSerializer {
    async one(item, { add }) {
        add('name', 'propertyNames')
    }
}

registerSerializer(DevControllersSerializer)
