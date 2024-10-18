import { registerSerializer } from '../../db/serialization.js'

class DevLoggedRequestSerializer {
    async one(item, { add }) {
        add(
            'id',
            'path',
            'method',
            'requestdata',
            'responsedata',
            'statuscode',
            'parentLoggedRequestId',
            'debuginfo',
            'createdAt'
        )
    }
}

registerSerializer(DevLoggedRequestSerializer)
