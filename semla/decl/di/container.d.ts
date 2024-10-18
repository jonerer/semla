interface DiContainerItemOptions {
    name?: string;
    scope?: 'single' | 'request';
}
export declare class DiContainerItem {
    private thing;
    private options;
    private instance;
    private hasInstanced;
    private isClass;
    private diContainer?;
    constructor(thing: any, options?: DiContainerItemOptions);
    setDiContainer(di: any): void;
    getName(): any;
    _actuallyCreateClassInstance(): any;
    _createInstance(): any;
    getInstance(): null;
    getScope(): "request" | "single";
}
declare class DiInstanceBag {
    private instances;
    constructor();
    has(name: any): boolean;
    get(name: any): any;
    set(name: any, inst: any): void;
}
export declare class DiContainer {
    singleInstanceBag?: DiInstanceBag;
    setSingleInstanceBag(diInstanceBag: any): void;
}
export declare class DiContainerBuilder {
    private items;
    private scopeHierarchy;
    private singleInstanceBag;
    constructor();
    add(thing: any, options: DiContainerItemOptions): void;
    addItem(diContainer: any, item: any, shouldSetAsHomeContainer: any): void;
    addThrowingDummy(diContainer: any, item: any): void;
    build(scope?: string): DiContainer;
}
export {};
