export class PathHelper {
    constructor(methodName: any, numRequiredParams: any, path: any);
    methodName: any;
    numRequiredParams: any;
    path: any;
    callback(...args: any[]): any;
    getGlobal(): {
        description: string;
        name: any;
        global: (...args: any[]) => any;
    };
}
export class GeneratedRoute {
    constructor(path: any, method: any, controllerName: any, action: any, options: any);
    path: any;
    method: any;
    controllerName: any;
    action: any;
    options: any;
    addPathHelper(helper: any): void;
    pathHelper: any;
    useSession(): any;
    csrfProtected(): any;
}
