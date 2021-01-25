export declare const setHeaders: (h: any) => void;
export declare const getRaw: (url: any, conf?: {}) => Promise<import("axios").AxiosResponse<any>>;
export declare const get: (url: any, conf?: {}) => Promise<any>;
export declare function post(url: any, cont: any, conf: any): Promise<any>;
export declare function postRaw(url: any, cont: any, conf: any): Promise<import("axios").AxiosResponse<any>>;
export declare function doDelete(url: any, conf: any): Promise<any>;
export declare function startup(_config: any): Promise<void>;
export declare function finish(): Promise<any>;
export declare function get$(url: any): Promise<any>;
