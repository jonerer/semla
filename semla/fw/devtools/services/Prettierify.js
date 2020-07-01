import { getFwBasedir, getFwPackageDir } from '../../appinfo'
import { readFileSync } from 'fs'
import * as prettier from 'prettier'

let prettierrc
export const prettierify = text => {
    if (!prettierrc) {
        let prettierrcPath = getFwPackageDir() + '/.prettierrc'
        const prc = readFileSync(prettierrcPath, 'utf-8')
        const js = JSON.parse(prc)
        prettierrc = js
    }

    const prettiered = prettier.format(text, { ...prettierrc, parser: 'babel' })
    return prettiered
}
