import { registerController } from '../../controllers/setup'
import { getLoadedDirs, getLoadedFiles } from '../../loader'

class DevLoaderController {
    index() {
        return this.json({
            loadedDirs: getLoadedDirs(),
            loadedFiles: getLoadedFiles(),
        })
    }
}

registerController(DevLoaderController)
