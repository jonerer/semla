export default function get(path: any, _default: any): any;
export function add(path: any, value: any): void;
export function addDefault(path: any, value: any): void;
export function envShortName(): "dev" | "test" | "prod";
export function addItemToObject(object: any, path: any, content: any): any;
export function getLeaves(obj: any, path?: string, collector?: {}): {};
export function fullConf(): {};
export function fullDefaults(): {};
export function setConf(_conf: any): void;
export function setDefaults(_defaults: any): void;
export function allWithResolution(): {
    conf: {};
    defaults: {};
    resolved: {};
};
