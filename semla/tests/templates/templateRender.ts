import { TemplateCompiler } from '../../fw/view/compiler'
import fs from 'fs'
import { v4 as uuid } from 'uuid'
import { Renderer } from '../../fw/view/render'
import { getFwBasedir } from '../../fw/appinfo'
import { add } from '../../fw/fw'

beforeAll(() => {
    add('semla.selftest_template_pathing', true)
})

const rendered = async (input, locals) => {
    const tempName = 'test-temp-' + uuid()

    const testDir = './cache/'
    let path = testDir + tempName + '.tmp'
    fs.writeFileSync(path, input, 'utf-8')

    const errorRenderer = new Renderer()
    errorRenderer.setViewsDirectory(testDir)
    const result = await errorRenderer.render(tempName, locals, {})
    return result.valueOf()
}

test('should be able to output a string', async () => {
    const input = `Hello {{l.world}}`

    const output = await rendered(input, { world: 'earth' })
    const expected = `Hello earth`
    expect(output).toBe(expected)
})

test('should be able to output some numbers', async () => {
    const input = `I can count from {{ l.highNum }} allll the way down to {{ l.zero }}.`

    const output = await rendered(input, { highNum: 99, zero: 0 })
    const expected = `I can count from 99 allll the way down to 0.`
    expect(output).toBe(expected)
})

test('should await a promise', async () => {
    const input = `I can write an immediate {{ l.immVal }} or a promise {{ l.prom }}`

    const output = await rendered(input, {
        immVal: 'imm',
        prom: new Promise(resolve => {
            setTimeout(() => {
                resolve('prom')
            }, 100)
        }),
    })
    const expected = `I can write an immediate imm or a promise prom`
    expect(output).toBe(expected)
})
