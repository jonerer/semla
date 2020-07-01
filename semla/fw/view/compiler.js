import fs from 'fs'
import * as esprima from 'esprima'

const TEXT = 1
const EXPRESSION = 2
const STATEMENT = 3
const BLOCK_STATEMENT = 4
const ESCAPED_TEXT = 5

export class TemplateCompiler {
    constructor() {
        this.accumulator = ''
        this.result = ''
        this.index = 0
        this.state = TEXT

        this.expressionStart = '{{'
        this.expressionEnd = '}}'

        this.statementStart = '@'
        this.statementEnd = '\n'

        this.blockStatementStart = '/@'
        this.blockStatementEnd = '@/'

        this.escapeChar = '\\'

        this.inExpressionOpenedBraces = 0 // keeps track of {  } inside an expression
    }

    load(path) {
        this.path = path
        const originalText = fs.readFileSync(path, 'utf-8')
        this.originalText = originalText.split('\r').join('')
        //console.log('loaded', this.originalText)
    }

    loadString(str) {
        this.originalText = str.split('\r').join('')
    }

    jsFileDefaults() {
        this.expressionStart = '<%='
        this.expressionEnd = '%>'

        this.statementStart = '<%'
        this.statementEnd = '%>'
    }

    intro() {
        const exposedHelpers = ['output', 'include']
        const exposedHelpersText = exposedHelpers.join(',')
        let k = `export default async function template(locals, support, ctx) {\n`
        k += `const { ${exposedHelpersText} } = support\nconst h = support\n`
        k += `const l = locals\n`
        /*
        https://github.com/yyx990803/buble/tree/f5996c9cdb2e61cb7dddf0f6c6f25d0f3f600055
        Sadly we can't use "with" in strict mode. Which *really* sucks.
        So we have to implement a template compiler that understands the AST and
        modifies the code.

        But that's a problem for a different day. For now, we just require the user to put "ctx"
        in front of every variable sent from the controller.
        k += '    with (ctx) {'

         */
        return k
    }

    outro() {
        return '    return result\n}\n'
    }

    compileToString() {
        const intro = this.intro()
        const main = this.main()
        const footer = this.outro()

        return intro + main + footer
    }

    next(step = 1, length = 1) {
        return this.originalText.substr(this.index + step, length)
    }

    step(step) {
        this.index += step
    }

    previous() {
        return this.originalText.substr(this.index - 1, 1)
    }

    endStatement(marker) {
        this.state = TEXT
        this.result +=
            this.applyStatementTransformations(this.accumulator) + '\n'
        this.accumulator = '    result += `'
        this.index += marker.length - 1
    }

    applyStatementTransformations(input) {
        input = input.trim()
        if (input === 'end') {
            return '}'
        } else if (input === 'else') {
            return '} else {'
        } else {
            /* this is to turn something like
            if (hejsan)
            into 
            if (hejsan) {
            So basically I want to insert opening brackets for some sugar
            */

            /* But first, see if we start with "else" */

            let output = ''
            if (input.startsWith('else')) {
                input = input.substr(4).trim()
                output = '} else '
            }

            const tokens = esprima.tokenize(input)

            const interestingKeywords = ['if', 'for']
            const opensWithKeyword = tokens[0].type === 'Keyword'
            const isInteresting =
                interestingKeywords.indexOf(tokens[0].value) !== -1
            if (opensWithKeyword && isInteresting) {
                const numOpeners = tokens.filter(
                    x => x.type === 'Punctuator' && x.value === '{'
                ).length
                if (numOpeners === 0) {
                    return output + input + ' {'
                } else {
                    return output + input
                }
            } else {
                return output + input
            }
        }
    }

    main() {
        this.accumulator = '\n    let result = `'

        const originalText = this.originalText
        for (; this.index < originalText.length; this.index++) {
            const curChar = originalText.charAt(this.index)

            if (this.state === TEXT) {
                const isEscapeChar = curChar === this.escapeChar

                if (isEscapeChar) {
                    this.state = ESCAPED_TEXT
                } else {
                    let isStatementStart =
                        this.next(0, this.statementStart.length) ===
                        this.statementStart

                    let isBlockStatementStart =
                        this.next(0, this.blockStatementStart.length) ===
                        this.blockStatementStart

                    let isExpressionStart =
                        this.next(0, this.expressionStart.length) ===
                        this.expressionStart

                    // if is block statement start, then it always takes precedence
                    if (isBlockStatementStart) {
                        isExpressionStart = false
                        isStatementStart = false
                    }

                    // if matches both statement start and expression start,
                    // then choose the longest one (aka most precise match)
                    if (isStatementStart && isExpressionStart) {
                        const statementMatchLength = this.statementStart.length
                        const expressionMatchLength = this.expressionStart
                            .length
                        if (statementMatchLength > expressionMatchLength) {
                            isExpressionStart = false
                        } else {
                            isStatementStart = false
                        }
                    }

                    if (isBlockStatementStart) {
                        // block statements and normal statements are similar, just different start and end markers
                        this.state = BLOCK_STATEMENT
                        this.result += this.accumulator + '`\n'
                        this.accumulator = ''
                        this.index += this.blockStatementStart.length - 1
                    } else if (isStatementStart) {
                        this.state = STATEMENT
                        this.result += this.accumulator + '`\n'
                        this.accumulator = ''
                        this.index += this.statementStart.length - 1
                        this.inExpressionOpenedBraces = 0
                    } else if (isExpressionStart) {
                        this.state = EXPRESSION
                        this.result += this.accumulator + '`\n'
                        this.accumulator = '    result += await output(' // todo: deal with "ctx."
                        this.index += this.expressionStart.length - 1
                    } else {
                        if (curChar === ' ' && this.next() === '\n') {
                            continue
                        }
                        this.accumulator += curChar
                    }
                }
            } else if (this.state === EXPRESSION) {
                // keeps track of { } inside expressions.
                // So you can open braces even though expressionEnd === '}'
                const isBraceOpener = curChar === '{'
                if (isBraceOpener) {
                    this.inExpressionOpenedBraces++
                }

                const isExpressionEnd =
                    this.next(0, this.expressionEnd.length) ===
                    this.expressionEnd
                if (this.inExpressionOpenedBraces === 0 && isExpressionEnd) {
                    this.state = TEXT
                    this.result += this.accumulator + ')\n'
                    this.accumulator = '    result += `'
                    this.index += this.expressionEnd.length - 1
                } else {
                    if (curChar === ' ' && this.next() === '%') {
                        continue
                    }
                    this.accumulator += curChar

                    const isBraceCloser = curChar === '}'
                    if (isBraceCloser) {
                        this.inExpressionOpenedBraces--
                    }
                }
            } else if (
                this.state === STATEMENT ||
                this.state === BLOCK_STATEMENT
            ) {
                const endMarker =
                    this.state === STATEMENT
                        ? this.statementEnd
                        : this.blockStatementEnd

                const isStatementEnd =
                    this.next(0, endMarker.length) === endMarker

                if (isStatementEnd) {
                    this.endStatement(endMarker)
                } else {
                    this.accumulator += curChar
                }
            } else if (this.state === ESCAPED_TEXT) {
                this.accumulator += curChar
                this.state = TEXT
            }
        }

        if (this.state === EXPRESSION || this.state === STATEMENT) {
            throw new Error(
                `Compiling ${this.path} Ending a template on an expression or a statement is invalid`
            )
        }

        this.result += this.accumulator
        this.result += '`\n'

        return this.result
    }
}
