import { registerController } from '../../fw'
import { GenerationService } from '../services/GenerationService'
import { existsSync, writeFileSync } from 'fs'

class DevGenerationController {
    create({ body }) {
        const { name, fullResource } = body
        if (!name || !fullResource) {
            throw new Error('Can only generate full resources so far.')
        }

        const resgen = new GenerationService()
        const generated = resgen.generate(body)
        return this.json(generated)
    }

    async apply({ params }) {
        const file = await DevFileChange.findOne(params.id)

        const targetPath = file.path

        const exists = existsSync(targetPath)
        if (exists) {
            this.status(400)

            return this.json({
                success: false,
                message: 'File already exists at location.',
            })
        } else {
            try {
                writeFileSync(targetPath, file.text)
            } catch (e) {
                return this.json({
                    success: false,
                    message: 'Error writing changes',
                })
            }
            file.applied = true
            await file.save()
            return this.json({
                success: true,
            })
        }
    }
}

registerController(DevGenerationController)
