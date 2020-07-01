import { jsifyBody, requireParams } from '../../fw/middlewares'
import { RequestContext } from '../../fw/web/context'

test('should jsify field names', () => {
    const ctx = {
        req: {
            body: {
                name: 'hej',
                email: 'svej',
                cat_id: '39',
            },
        },
    }
    jsifyBody(ctx)

    const after = ctx.req.body
    expect(after.catId).toBe('39')
})

test('should be able to require params with requireParams', async () => {
    const mockReq = {
        body: {
            category: 'js',
        },
    }
    const mockRes = {}

    const mockContext = new RequestContext(mockReq, mockRes)
    const generated = requireParams('category')

    await generated(mockContext) // should not throw

    const mockReqWithoutCategory = {
        body: {
            elephant: 'pink',
        },
    }

    const mockContextWithout = new RequestContext(
        mockReqWithoutCategory,
        mockRes
    )
    expect(() => {
        generated(mockContextWithout)
    }).toThrow(Error)
})
