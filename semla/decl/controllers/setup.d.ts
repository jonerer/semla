export function registerController(controller: any): void;
export function getControllers(): {
    name: string;
    propertyNames: string[];
}[];
export class ControllerSetupCollector {
    constructor(controller: any);
    controller: any;
    middlewares: any[];
    before(actions: any, callback: any): void;
    getRelevantMiddleware(action: any): any[];
}
export function runMiddleware(controllerInst: any, action: any, ctx: any): Promise<void>;
export function getController(name: any): any;
