import { registerController } from '../../fw'
import { getControllers } from '../../controllers/setup'
import * as axios from 'axios'
import { DEV_DEBUG_CSRF_SECRET } from '../../web/csrf'

class DevLoggedRequestsController {
    async index() {
        const reqs = await DevLoggedRequest.order([
            DevLoggedRequest.createdAt,
            'DESC',
        ]).query()

        return this.json(reqs)
    }

    async repeat({ devloggedrequest, params }) {
        const { method, path, requestdata } = devloggedrequest
        const json = JSON.parse(requestdata)
        const { headers, body } = json
        const { bypassCsrf } = params
        let req
        const fullpath = 'http://' + headers.host + path
        if (method === 'GET') {
            req = axios.get(fullpath)
        } else if (method === 'POST') {
            let mybody = { ...body }
            if (bypassCsrf) {
                mybody._csrfSecret = DEV_DEBUG_CSRF_SECRET
            }
            req = axios.post(fullpath, mybody)
        }
        try {
            await req
        } catch (e) {}
        return this.json({ success: true })
    }
}

registerController(DevLoggedRequestsController)
