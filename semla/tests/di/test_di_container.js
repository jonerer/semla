import {
    DiContainer,
    DiContainerBuilder,
    DiContainerItem,
} from '../../fw/di/container'
import { RequestContext } from '../../fw/web/context'
import { addToWebDi } from '../../fw/di/web_di'

let exampleItemConstructorRuns = 0

class ExampleItem {
    constructor() {
        exampleItemConstructorRuns++
    }
}
class UserService {}

test('di container auto naming', () => {
    const diItem = new DiContainerItem(ExampleItem)
    const name = diItem.getName()

    expect(name).toBe('exampleItem')
})

test('Building simple container', () => {
    const builder = new DiContainerBuilder()
    builder.add(ExampleItem)
    builder.add(UserService, {
        name: 'memberService',
    })
    builder.add(UserService, {
        scope: 'request',
    })

    const di = builder.build('single')
    const ex = di.exampleItem
    expect(ex.__proto__.constructor).toBe(ExampleItem)

    expect(() => {
        di.userService
    }).toThrow()

    const us = di.memberService
    expect(us.__proto__.constructor).toBe(UserService)
})

test('Building twice should preserve the same "single" scoped things, but make a new instance of request things', () => {
    const builder = new DiContainerBuilder()
    builder.add(ExampleItem)
    builder.add(UserService, {
        scope: 'request',
    })

    const di = builder.build('request')
    const ex11 = di.exampleItem
    const ex12 = di.exampleItem

    const us11 = di.userService
    const us12 = di.userService

    const di2 = builder.build('request')
    const ex21 = di2.exampleItem
    const ex22 = di2.exampleItem

    const us21 = di2.userService
    const us22 = di2.userService

    expect(ex11).toBe(ex12)
    expect(ex11).toBe(ex21)
    expect(ex11).toBe(ex22)

    expect(us11).toBe(us12)
    expect(us11).not.toBe(us21)
    expect(us21).toBe(us22)
})

test('The objects running in DI should have access to the DI container', () => {
    const builder = new DiContainerBuilder()
    builder.add(ExampleItem)

    const di = builder.build('single')

    expect(di.exampleItem.di).toBe(di)
})

class ConstructorSaver {
    constructor(...args) {
        this.args = args
    }
}

test('Should get DI in the constructor', () => {
    const builder = new DiContainerBuilder()
    builder.add(ConstructorSaver)

    const di = builder.build('single')

    const inst = di.constructorSaver

    expect(inst.args.length).toBe(1)
    expect(inst.args[0]).toBe(di)
})

test('The DI Container that singles get should not contain the request scoped things', () => {
    const builder = new DiContainerBuilder()
    builder.add(ExampleItem)
    builder.add(UserService, {
        scope: 'request',
    })

    const di = builder.build('request')

    expect(() => {
        di.userService.di.userService
        di.userService.di.exampleItem
        di.exampleItem.di.exampleItem
    }).not.toThrow()

    expect(() => {
        di.exampleItem.di.userService
    }).toThrow()
})

test('If the stuff in the DI Container gets added to the request context', () => {
    addToWebDi(ExampleItem)
    const req = {}
    const res = {}
    const ctx = new RequestContext(req, res)

    expect(ctx.di instanceof DiContainer).toBe(true)
    let numRunsBefore = exampleItemConstructorRuns
    expect(ctx.di.exampleItem instanceof ExampleItem).toBe(true)
    expect(exampleItemConstructorRuns).toBe(numRunsBefore + 1)
})
