import { Moment } from 'moment'


// This file was automatically generated by the Semla framework.
// DO NOT make any changes in this file; they will be overwritten anyway.
// DO make sure to add this to source control; it will not be regenerated in test or production environments



    export interface RelatedField<T> extends Promise<T> {
    id: number
    }
    
    interface QueryField {}
    
    interface RenderOptions {
        layout?: string | null
    }
    
export class SemlaController {
    // implementations are provided by the framework at runtime
    render(view: string, locals?: object | undefined, options?: RenderOptions) {}
    redirect(path: string) {}
    json(serializable: object) {}
}
    


interface ParamsObject {
    allowed(...args): any
    [s: string]: any
}

type ValueType = 'number' | 'string' | 'boolean'

export type flashTypes = 'info' | 'error' | 'warn'

interface Flash {
    type: flashTypes,
    text: string
}

export interface RequestContext {
    params: ParamsObject
    req: any // express req
    res: any // express res
    session: any
    
    render(view: string, locals?: object | undefined)
    redirect(path: string)
    json(serializable: object)
    flash(type: flashTypes, text: string)
    flashes(): Flash[]
    di: any
}
    

