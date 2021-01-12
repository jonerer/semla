export declare const registerSerializer: (serializer: any) => void;
export declare class SerializerCollector<T> {
    fieldsToResolve: string[];
    objsGiven: {};
    fieldsToStringify: string[];
    constructor();
    add(...args: object[] | (keyof T)[]): void;
    addString(obj: keyof T | (keyof T)[]): void;
}
export declare const serialize: (hej: any, desiredSerializer?: string | undefined) => Promise<any>;
