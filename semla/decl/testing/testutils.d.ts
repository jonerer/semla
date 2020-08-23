export function post(url: any, cont: any, conf: any): Promise<any>;
export function postRaw(url: any, cont: any, conf: any): Promise<any>;
export function doDelete(url: any, conf: any): Promise<any>;
export function startup({ port }: {
    port: any;
}): Promise<void>;
export function finish(): Promise<any>;
export function get$(url: any): Promise<any>;
export function setHeaders(h: any): void;
export function getRaw(url: any, conf?: {}): any;
export function get(url: any, conf?: {}): Promise<any>;
