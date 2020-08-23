export class TemplateCompiler {
    accumulator: string;
    result: string;
    index: number;
    state: any;
    expressionStart: string;
    expressionEnd: string;
    statementStart: string;
    statementEnd: string;
    blockStatementStart: string;
    blockStatementEnd: string;
    escapeChar: string;
    inExpressionOpenedBraces: number;
    load(path: any): void;
    path: any;
    originalText: any;
    loadString(str: any): void;
    jsFileDefaults(): void;
    intro(): string;
    outro(): string;
    compileToString(): string;
    next(step?: number, length?: number): any;
    step(step: any): void;
    previous(): any;
    endStatement(marker: any): void;
    applyStatementTransformations(input: any): string;
    main(): string;
}
