import path from 'path'
import fs from 'fs'
import { getAppBasedir } from '../../appinfo'
import { prettierify } from './Prettierify'

class MigrationFile {
    constructor(name) {
        this.name = name
    }

    setContents(conts) {
        this.contents = conts
    }
}

export class MigrationCreationService {
    constructor() {
        this.name = ''
        this.changes = []
    }
    input(json) {
        this.name = json.name
        this.changes = json.changes
    }
    classify(name) {
        // make name class-friendly
        return name.split('-').join('')
    }

    write() {
        const basePath = getAppBasedir()
        const targetDir = basePath + '/app/db/migrations'

        const file = this.generateMigrationFile()
        let filePath = path.join(targetDir, file.name + '.js')
        fs.writeFileSync(filePath, file.contents, 'utf-8')
    }

    generateMigrationFile() {
        /*
        json should look like this:

    let input = {
        name: '2020-02-20_10-20_CreateTableAsdf',
        changes: [
            { type: 'createTable', tableName: 'CreateTable' },
            { type: 'alterTable', tableName: 'Cat' },
        ],
    }
         */
        const m = new MigrationFile(this.name)

        let conts = ''
        conts += `export default class Migration_${this.classify(
            // class names can't start with numbers, and can't contain -
            this.name
        )} {\n`
        conts += `    change(m) {\n`

        let i = 0
        for (const change of this.changes) {
            if (change.type === 'createTable') {
                conts += `        m.addTable(\'${change.tableName}\', t => {\n`
                conts += `            // add your columns here...\n`
                conts += `            t.timestamps()\n`
                conts += `        })\n`
            }
            if (change.type === 'alterTable') {
                conts += `        m.alterTable(\'${change.tableName.toLowerCase()}\', t => {\n`
                conts += `            // make your changes here...\n`
                conts += `        })\n`
            }
            // viktigt :p
            if (i !== this.changes.length - 1) {
                conts += '\n'
            }
            i++
        }

        conts += `    }\n`
        conts += `}\n`

        m.setContents(prettierify(conts))

        return m
    }
}
