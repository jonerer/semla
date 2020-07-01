import { registerController } from '../../fw'
import { getControllers } from '../../controllers/setup'
import { getAppBasedir } from '../../appinfo'
import { staticServeDir, staticServePath } from '../../static'
import { join } from 'path'
import * as fs from 'fs'
import { query } from '../../db/db'

export class DevDbController {
    async query({ params }) {
        const { text } = params

        let result = null
        try {
            result = await query(text, [])
        } catch (e) {
            // if it errors out, only one result is returned
            result = {
                text,
                results: null,
                error: e.message,
            }
        }

        // multiple queries causes an array to be returned. Otherwise it's an object-style object. like "select 1; select 2"
        // so let's normalize everything to an array or arrays ("results", with rows in them)
        const resultObj = {
            text,
        }
        if (Array.isArray(result)) {
            resultObj.results = result.map(x => x.rows)
        } else if (!result.error) {
            resultObj.results = [result.rows]
        }

        return this.json(resultObj)
    }
}

registerController(DevDbController)
