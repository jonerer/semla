export class DbError extends Error {
    constructor(message: any);
    meta: {};
    setMeta(meta: any): void;
}
