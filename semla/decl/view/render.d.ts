export class Renderer {
    constructor(opts?: {});
    options: {};
    viewsDirectory: string;
    compile(targetFilePath: any, targetCachedFile: any): Promise<any>;
    setViewsDirectory(viewsDir: any): void;
    getTemplateFunction(name: any): Promise<any>;
    layoutToUse(input: any): Promise<any>;
    render(name: any, locals: any, options?: {}): Promise<String>;
}
