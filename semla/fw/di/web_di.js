import { DiContainerBuilder } from './container'

let webDiBuilder = new DiContainerBuilder()

export const addToWebDi = (thing, options) => {
    webDiBuilder.add(thing, options)
}

export const getRequestDiBuilder = () => {
    return webDiBuilder
}

export const getRequestDiContainer = () => {
    const inst = webDiBuilder.build('request')
    return inst
}
