export class TemplateSupport {
    constructor(ctx: any);
    exportables: any[];
    helpers: {};
    ctx: any;
    addExportable(name: any, callback: any): void;
    exportableNames(): any[];
    addHelper(name: any, callback: any): void;
}
export function output(value: any): Promise<any>;
export function url_for(modelInstance: any): Promise<string>;
export function addHelpers(support: any): void;
