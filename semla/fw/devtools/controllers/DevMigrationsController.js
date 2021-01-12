import { getAppMigrationsDir } from '../../appinfo'
import { MigrationCreationService } from '../services/MigrationCreationService'
import { registerController } from '../../fw'
import fs from 'fs'
import path from 'path'
import { getMigrations, runMigrations } from '../../db/migrations/migration'

class DevMigrationsController {
    async index({ req }) {
        const envParam = req.query.env

        try {
            const migrations = await getMigrations(envParam)
            return this.json(migrations, 'devmigration')
        } catch (e) {
            return this.json({
                success: false,
                message:
                    'Unable to load relevant migrations. Perhaps your DB connection is not set up correctly.' +
                    e.message,
            })
        }
    }

    create({ body }) {
        const s = new MigrationCreationService()
        s.input(body)
        s.write()

        return this.json({
            success: true,
            // fileWritten: filePath,
        })
    }

    async run({ req }) {
        const envParam = req.query.env

        // const env = envShortName()
        const run = await runMigrations(envParam)
        if (run.numSuccessful) {
            setTimeout(() => {
                console.log(
                    'Migrations have been run. Stopping the server you can restart it (or models would be out of sync with database)'
                )

                process.exit(0)
            }, 1000)
        }

        return this.json(run)
    }
}

registerController(DevMigrationsController)
