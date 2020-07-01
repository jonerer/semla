import { registerInitializer } from '../../fw/fw'

const initExtraDirs = i => {
    i.addDir(__dirname + '/../authenticators')
}

registerInitializer(initExtraDirs)
