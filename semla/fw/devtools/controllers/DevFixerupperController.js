import { registerController } from '../../fw'
import { getControllers } from '../../controllers/setup'
import { getAppBasedir } from '../../appinfo'
import { staticServeDir, staticServePath } from '../../static'
import { join } from 'path'
import * as fs from 'fs'

export class DevFixerupperController {
    _cssFileForHref(href) {
        const ur = new URL(href)
        const path = ur.pathname

        // if path is /static/styles.css
        // and staticServePath is /static, then find "/styles.css"

        const relativePath = path.substr(staticServePath().length)

        // if we now have "/styles.css", then we trim away the '/'
        const shavedRelativePath = relativePath.startsWith('/')
            ? relativePath.substr(1)
            : relativePath

        // we can now join it with the staticServeDir
        // meaning we can do /home/user/dir/app/static + / + styles.css
        const finalPath = join(staticServeDir(), shavedRelativePath)
        return finalPath
    }

    firstEndAfter(contents, location) {
        for (let i = location; i < contents.length; i++) {
            if (contents.charAt(i) === '}') {
                return i
            }
        }
        return -1
    }

    patchedContents(contentsBefore, myChanges) {
        let changedConts = contentsBefore

        for (const change of myChanges) {
            // find start of block
            const start = changedConts.indexOf(change.selector)
            if (start !== -1) {
                const end = this.firstEndAfter(changedConts, start)
                if (end !== -1) {
                    changedConts =
                        changedConts.substr(0, start) +
                        change.css +
                        changedConts.substr(end + 1)
                }
            }
        }
        return changedConts
    }

    post({ params }) {
        const { cssText, cssHref, cssSelector, backTo } = params

        // The inputs are arrays like
        /*
          cssText: [
        '.outercontainer {\r\n width: 810px;\r\n margin: auto;\r\n }',
        '.headercontainer {\r\n height: 70px;\r\n margin-left: 202px;\r\n }',

         cssHref: [
        'http://localhost:8000/styles.css',
        'http://localhost:8000/styles.css',

         */
        const zipped = cssText.map((x, i) => {
            return {
                css: cssText[i],
                href: cssHref[i],
                selector: cssSelector[i],
            }
        })

        const uniqueHrefs = [...new Set(zipped.map(x => x.href))]

        for (const ref of uniqueHrefs) {
            console.log("what's the file for", ref, '?')
            const myChanges = zipped.filter(x => x.href === ref)
            const path = this._cssFileForHref(ref)
            const contentsBefore = fs.readFileSync(path, 'utf-8')
            const transformedContents = this.patchedContents(
                contentsBefore,
                myChanges
            )
            console.log('Writing changes to ', path)
            fs.writeFileSync(path, transformedContents, 'utf-8')
        }
        return this.redirect(backTo)
        // return this.json(controllers, 'devcontrollers')
    }
}

registerController(DevFixerupperController)
