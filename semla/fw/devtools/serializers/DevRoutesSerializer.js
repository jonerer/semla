import { registerSerializer } from '../../db/serialization'

class DevRoutesSerializer {
    async one(item, { add }) {
        add('path', 'method', 'controllerName', 'action')
        add({
            methodName: item.pathHelper.methodName,
            meta: item.meta()
        })
    }
}

registerSerializer(DevRoutesSerializer)
