export class RouteCollector {
    items: any[];
    validateOptions(opts: any): void;
    get(path: any, action: any, options?: {}): void;
    post(path: any, action: any, options?: {}): void;
    delete(path: any, action: any, options?: {}): void;
    resources(path: any, callback_or_options: any, options?: {}): void;
    semiNestedResources(path: any, callback_or_options: any, options?: {}): void;
    prefix(path: any, callback_or_options: any, options?: {}): void;
}
