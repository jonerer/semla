import { registerSpa } from '../../spas'

// this file is not in use
class DevtoolsSpa {
    path() {
        return __dirname + '/../../../../semdoc4'
    }

    devCommand() {
        return {
            command: 'yarn start',
        }
    }

    buildCommand() {
        return {
            command: 'yarn build',
        }
    }

    buildOutputPath() {
        return this.path() + '/dist'
    }
}

//registerSpa(DevtoolsSpa)
