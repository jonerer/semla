import { registerSerializer } from '../../db/serialization.js'

class DevMigrationSerializer {
    one(item) {
        return {
            name: item.name,
            fullpath: item.fullpath,
            hasRun: item.hasRun,
            generated: item.generated,
            generationError: item.generationError,
        }
    }
}

registerSerializer(DevMigrationSerializer)
