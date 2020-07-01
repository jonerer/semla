import { registerController } from '../../controllers/setup'
import fs from 'fs'
import * as path from 'path'

// Read the docs on server startup. Part performance,
// part directory traversal avoidance

/*
not in use ATM.

const dirname = __dirname + '/../../../docs'
const dir = fs.readdirSync(dirname)
const docPages = {}

for (const file of dir) {
    docPages[file] = fs.readFileSync(path.join(dirname, file), 'utf-8')
}
console.log('loaded docs:', docPages)

class DevDocsController {
    docPage({ params }) {
        const page = params.docPage
        const pageFileName = page + '.md'

        if (Object.keys(docPages).indexOf(pageFileName) === -1) {
            return this.json({
                success: false,
            })
        } else {
            return this.json({
                success: true,
                content: docPages[pageFileName],
            })
        }
    }
}

registerController(DevDocsController)
*/
