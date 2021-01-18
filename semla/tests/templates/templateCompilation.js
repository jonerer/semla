import { TemplateCompiler } from '../../fw/view/compiler'
import fs from 'fs'

export const withoutWhitespace = input => {
    return input
        .split(' ')
        .join('')
        .split('\n')
        .join('')
}

test('Should be able to put in a little if statement', () => {
    const inputText = `hejsan
    @if (hejsan === 'weo') {
    ja, hejsan är weo
    @ } else {
    ellers
    @ }
    `

    const compiler = new TemplateCompiler()
    compiler.loadString(inputText)

    const compiled = compiler.main()
    const result = `let result = \`hejsan\`
    if (hejsan === 'weo') {
    result += \`ja, hejsan är weo\`
    } else {
    result += \`ellers\`
    }
    result += \`\`
    `
        .split('\r')
        .join('')

    expect(withoutWhitespace(compiled)).toBe(withoutWhitespace(result))
})

test('Should be able to put in a little if statement with js defaults', () => {
    const inputText = `hejsan
    <% if (hejsan === 'weo') { %>
    ja, hejsan är weo
    <% } else { %>
    ellers
    <% } %>
    `

    const compiler = new TemplateCompiler()
    compiler.loadString(inputText)
    compiler.jsFileDefaults()

    const compiled = compiler.main()
    const result = `let result = \`hejsan\`
    if (hejsan === 'weo') {
    result += \`ja, hejsan är weo\`
    } else {
    result += \`ellers\`
    }
    result += \`\`
    `
        .split('\r')
        .join('')

    expect(withoutWhitespace(compiled)).toBe(withoutWhitespace(result))
})

test('Should be able to deal with an expression', () => {
    const inputText = `hejsan
    {{ctx.kek}}
    weo
    `

    const compiler = new TemplateCompiler()
    compiler.loadString(inputText)

    const compiled = compiler.main()
    const result = `let result = \`hejsan\`
    result += await output(ctx.kek)
    result += \`weo\`
    `
        .split('\r')
        .join('')

    expect(withoutWhitespace(compiled)).toBe(withoutWhitespace(result))
})

test('Should be able to deal with an expression', () => {
    const inputText = `hejsan
    <%= ctx.kek %>
    weo
    `

    const compiler = new TemplateCompiler()
    compiler.loadString(inputText)
    compiler.jsFileDefaults()

    const compiled = compiler.main()
    const result = `let result = \`hejsan\`
    result += await output(ctx.kek)
    result += \`weo\`
    `
        .split('\r')
        .join('')

    expect(withoutWhitespace(compiled)).toBe(withoutWhitespace(result))
})

test('Should be able to compile block statements', () => {
    const inputText = `hejsan

    /@

    function fibonacci(num) {
        if (num <= 1) return 1;
      
        return fibonacci(num - 1) + fibonacci(num - 2);
    }

    @/


    weo. Fibbo 5: {{fibonacci(5)}}
    `

    const compiler = new TemplateCompiler()
    compiler.loadString(inputText)

    const compiled = compiler.main()
    const result = `
    letresult=\`hejsan\`
    function fibonacci(num){if(num<=1)return1;
        returnfibonacci(num-1)+fibonacci(num-2);
    }
    result+=\`weo.Fibbo5:\`result+=awaitoutput(fibonacci(5))result+=\`\`
    `
        .split('\r')
        .join('')

    expect(withoutWhitespace(compiled)).toBe(withoutWhitespace(result))
})

const compiled = input => {
    const compiler = new TemplateCompiler()
    compiler.loadString(input)

    const compiled = compiler.main()
    return compiled
}

test('Should be able to auto insert braces for if, else, end', () => {
    const inputVanilla = `
    @if (thing === '{') {
        Yup!
    @} else {
        Nope!
    @}
    `

    const vanillaCompiled = compiled(inputVanilla)

    const inputAutomated = `
    @if (thing === '{')
        Yup!
    @ else
        Nope!
    @end
    `

    const automatedCompiled = compiled(inputAutomated)

    expect(automatedCompiled).toBe(vanillaCompiled)
})

test('Should be able to auto insert braces for else if', () => {
    const inputVanilla = `
    @if (thing === '{') {
        Yup!
    @} else if (other_thing === 'weo') {
        Nope!
    @}
    `

    const vanillaCompiled = compiled(inputVanilla)

    const inputAutomated = `
    @if (thing === '{')
        Yup!
    @ else if (other_thing === 'weo')
        Nope!
    @end
    `

    const automatedCompiled = compiled(inputAutomated)

    expect(automatedCompiled).toBe(vanillaCompiled)
})

test('should handle brackets in expressions', () => {
    const input = `
        {{ callHej({ thing: 'yes' }) }}
    `

    const output = compiled(input)

    const exp = `
    let result = \`
    \`
result += await output( callHej({ thing: 'yes' }) )
result += \`
\`
    `

    expect(withoutWhitespace(output)).toBe(withoutWhitespace(exp))
})

test('should handle two expressions ', () => {
    const input = `
        {{ callHej() }}
        {{ callHejAgain() }}
    `

    const output = compiled(input)

    const exp = `
    let result = \`
    \`
result += await output( callHej() )
result += \`\`
result += await output( callHejAgain() )
result += \`
\`
    `

    expect(withoutWhitespace(output)).toBe(withoutWhitespace(exp))
})

test('should be able to escape a block opener', () => {
    const input = `Something \\@ escaped`

    const expected = `
    let result = \`Something @ escaped\`
`
    const output = compiled(input)
    expect(output).toBe(expected)
})
