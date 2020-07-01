const addedGlobals = []

export function getGlobals() {
    return addedGlobals
}

export function addGlobal(item) {
    if (!item.description || !item.name || !item.global) {
        throw new Error(
            'Unable to register global: item lacks methodName, description or global'
        )
    }

    addedGlobals.push(item)

    global[item.name] = item.global
}
