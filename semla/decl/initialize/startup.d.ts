export function collect(): InitCollector;
export function mergeSettings(collector: any): {};
export function initialize(): void;
export function afterLoad(): Promise<void>;
export function registerInitializer(callback: any): void;
export function clearInitializers(): void;
declare class InitCollector {
    afterLoadCallbacks: any[];
    settings: any[];
    extraDirs: any[];
    addedDiThings: any[];
    addSettings(path: any, vars: any): void;
    addDir(dir: any): void;
    afterLoad(callback: any): void;
    addDi(thing: any, options: any): void;
}
export {};
