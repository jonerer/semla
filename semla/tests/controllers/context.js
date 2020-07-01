import { RequestContext } from '../../fw/web/context'

class ExampleController {
    js() {
        return this.json({
            success: true,
        })
    }

    html() {
        return 'htmlRender'
    }

    both() {
        return this.respond(r => {
            r.json(() =>
                this.json({
                    success: false,
                })
            )
            r.html(() => 'htmlRenderBoth')
        })
    }
}

test('Se if we can do the respond() thingy', async () => {
    const respondedJson = []
    const req = {
        headers: {
            'content-type': 'application/json',
        },
    }
    const res = {
        json: retval => {
            respondedJson.push(retval)
        },
    }

    const ctx = new RequestContext(req, res)

    const inst = new ExampleController()
    ctx.mount(inst)

    // render html?
    const htR = await inst.html()

    expect(htR).toBe('htmlRender')

    // render js?
    await inst.js()
    expect(respondedJson[0]).toEqual({
        success: true,
    })

    // now with the respnder. first json
    await inst.both()
    expect(respondedJson[1]).toEqual({
        success: false,
    })

    // then html
    delete req.headers['content-type']
    const ht2 = await inst.both()
    expect(ht2).toBe('htmlRenderBoth')
})
