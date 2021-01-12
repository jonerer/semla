export function getDefaultOptions(): {
    csrfProtection: any;
    session: any;
    meta: {};
};
export class RouteFlattener {
    path(myPath: any, recursePath: any): string;
    pathHelperName(name: any, action: any, recurse: any): string;
    numArgs(recursePath: any, addForMe: any): any;
    paramNameFor(item: any): any;
    handleResources(item: any, recursePath: any, parentOptions: any): any;
    getRoutes(collector: any, recursePath?: any[], parentOptions?: {
        csrfProtection: any;
        session: any;
        meta: {};
    }): any;
    handleSemiNestedResources(item: any, recursePath: any, parentOptions: any): any;
}
