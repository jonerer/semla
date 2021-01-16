import { GeneratedRoute } from './flattenerUtils';
export declare const getDefaultOptions: () => {
    csrfProtection: any;
    session: any;
    meta: {};
};
export declare class RouteFlattener {
    constructor();
    path(myPath: any, recursePath: any): string;
    pathHelperName(name: any, action: any, recurse: any): string;
    numArgs(recursePath: any, addForMe: any): any;
    paramNameFor(item: any): any;
    handleResources(item: any, recursePath: any, parentOptions: any): GeneratedRoute[];
    getRoutes(collector: any, recursePath?: string[], parentOptions?: {
        csrfProtection: any;
        session: any;
        meta: {};
    }): GeneratedRoute[];
    handleSemiNestedResources(item: any, recursePath: any, parentOptions: any): GeneratedRoute[];
}
