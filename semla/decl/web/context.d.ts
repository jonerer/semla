/// <reference types="express-session" />
import { Flasher } from './flasher';
import express from 'express';
import { DiContainer } from '../di/container';
interface Request extends express.Request {
}
interface Response extends express.Response {
}
interface ParamsThing {
    allow(...args: any[]): object;
    [s: string]: any;
}
type UserPrincipal = {};
export declare class RequestContext {
    flasher: Flasher;
    req: Request;
    res: Response;
    hasResponded: boolean;
    _currentUser?: UserPrincipal;
    _logLines: any[];
    _requestLogger: (...args: any[]) => void;
    di: DiContainer;
    constructor(req: any, res: any);
    flashes(): {
        type: any;
        text: any;
    }[];
    flash(type: any, text: any): void;
    respond(responder: any): Promise<any>;
    get json(): (hej: any, desiredSerializer: any) => Promise<void>;
    redirect(target: any): void;
    status(number: any): void;
    get render(): (name: any, locals?: {}) => Promise<void>;
    get params(): ParamsThing;
    get rawJson(): (item: any) => Promise<void>;
    get session(): Express.Session | undefined;
    get body(): any;
    set body(val: any);
    get log(): (...args: any[]) => void;
    get currentUser(): UserPrincipal | undefined;
    set currentUser(val: UserPrincipal | undefined);
    mount(controllerInstance: any): void;
}
export {};
