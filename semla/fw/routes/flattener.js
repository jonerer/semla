import { singularize } from '../utils'
import { jsifyFieldName } from '../db/querying/fields'
import { GeneratedRoute, PathHelper } from './flattenerUtils'
import get from '../config/config'

export const getDefaultOptions = () => {
    return {
        csrfProtection: get('routes.defaults.csrfProtection'),
        session: get('session.active'),
        meta: {}
    }
}

export class RouteFlattener {
    constructor() {}

    path(myPath, recursePath) {
        const pathsd = recursePath.join('/') + '/' + myPath
        // shave off any double slashes.
        // I know this is an ugly hack, but it'll have to do for now.
        let shaved = pathsd.split('//').join('/')
        // also remove the last char, if it's a /
        if (shaved.endsWith('/')) {
            shaved = shaved.substr(0, shaved.length - 1)
        }
        if (!shaved) {
            shaved = '/'
        }
        return shaved
    }

    pathHelperName(name, action, recurse) {
        /*
         recurse is an array like
         [0] = '/api' // a prefix
         [1] = '/teams/:team'
         name is the controller/resource name, like 'items'
         action is action name like 'show'

         From those we want to create "apiTeamItemShow"
         */
        const prev_parts = recurse
            .map(part => {
                const thisPart = part.split('/')[1] // remove '/'
                return singularize(thisPart)
            })
            .join('_')
        let underscoredString = ''
        if (prev_parts) {
            underscoredString += prev_parts + '_'
        }
        underscoredString += singularize(name) + '_' + action
        return jsifyFieldName(underscoredString) // underscores gets turned into capitalized by jsifyFieldName. ugly effect.
    }

    numArgs(recursePath, addForMe) {
        // recurse is an array like
        // [0] = '/api' // a prefix
        // [1] = '/teams/:team'

        // we expect one parameter per previous ":" param
        const fromPrevious = recursePath.filter(x => x.indexOf(':') !== -1)
            .length
        // and then possibly for me
        let numForMe = 0
        if (typeof addForMe === 'number') {
            numForMe += addForMe
        }
        if (typeof addForMe === 'boolean') {
            numForMe += addForMe ? 1 : 0
        }
        return fromPrevious + numForMe
    }

    paramNameFor(item) {
        if (item.options.parameterName) {
            return item.options.parameterName
        } else {
            return singularize(item.path)
        }
    }

    handleResources(item, recursePath, parentOptions) {
        let routes = []
        const resourceName = item.path
        const controllerName = item.options.controller || item.path
        const paramName = this.paramNameFor(item)
        const options = { ...parentOptions, ...item.options }

        let indexPath = this.path(resourceName + '/', recursePath)
        const index = new GeneratedRoute(
            indexPath,
            'get',
            controllerName,
            'index',
            options
        )

        index.addPathHelper(
            new PathHelper(
                this.pathHelperName(resourceName, 'index', recursePath),
                this.numArgs(recursePath, false),
                indexPath
            )
        )
        routes.push(index)

        const create = new GeneratedRoute(
            this.path(resourceName + '/', recursePath),
            'post',
            controllerName,
            'create',
            options
        )

        create.addPathHelper(
            new PathHelper(
                this.pathHelperName(resourceName, 'create', recursePath),
                this.numArgs(recursePath, false),
                indexPath
            )
        )

        routes.push(create)

        let specificItemPath = this.path(
            resourceName + '/:' + paramName,
            recursePath
        )
        const show = new GeneratedRoute(
            specificItemPath,
            'get',
            controllerName,
            'show',
            options
        )

        show.addPathHelper(
            new PathHelper(
                this.pathHelperName(resourceName, 'show', recursePath),
                this.numArgs(recursePath, true),
                specificItemPath
            )
        )
        routes.push(show)

        const update = new GeneratedRoute(
            specificItemPath,
            'post',
            controllerName,
            'update',
            options
        )

        update.addPathHelper(
            new PathHelper(
                this.pathHelperName(resourceName, 'update', recursePath),
                this.numArgs(recursePath, true),
                specificItemPath
            )
        )
        routes.push(update)

        const del = new GeneratedRoute(
            specificItemPath,
            'delete',
            controllerName,
            'delete',
            options
        )

        del.addPathHelper(
            new PathHelper(
                this.pathHelperName(resourceName, 'delete', recursePath),
                this.numArgs(recursePath, true),
                specificItemPath
            )
        )

        routes.push(del)

        if (item.collector) {
            const subroutes = this.getRoutes(
                item.collector,
                recursePath.concat('/' + item.path + '/:' + paramName),
                options
            )
            routes = routes.concat(subroutes)
        }
        return routes
    }

    /*
    recursePath is a list of strings of the parent paths.
     */
    getRoutes(
        collector,
        recursePath = [],
        parentOptions = getDefaultOptions()
    ) {
        let items = collector.items
        let routes = []

        for (const item of items) {
            if (item.type === 'route') {
                const splittedAc = item.actionstring.split('@')

                let controllerName = splittedAc[0]
                let actionName = splittedAc[1]
                let oneItemPath = this.path(item.path, recursePath)
                const r = new GeneratedRoute(
                    oneItemPath,
                    item.method,
                    controllerName,
                    actionName,
                    { ...parentOptions, ...item.options }
                )
                const p = new PathHelper(
                    this.pathHelperName(
                        controllerName,
                        actionName,
                        recursePath
                    ), //dbIfyJsName(controllerName) + '_' + dbIfyJsName(actionName)
                    this.numArgs(recursePath, item.path.split(':').length),
                    oneItemPath
                )
                r.addPathHelper(p)

                routes.push(r)
            }

            if (item.type === 'resources') {
                routes = routes.concat(
                    this.handleResources(item, recursePath, parentOptions)
                )
            }

            if (item.type === 'semiNestedResources') {
                routes = routes.concat(
                    this.handleSemiNestedResources(
                        item,
                        recursePath,
                        parentOptions
                    )
                )
            }

            if (item.type === 'prefix') {
                const subroutes = this.getRoutes(
                    item.collector,
                    recursePath.concat('/' + item.path),
                    { ...parentOptions, ...item.options }
                )
                routes = routes.concat(subroutes)
            }
        }

        return routes
    }

    handleSemiNestedResources(item, recursePath, parentOptions) {
        // very similar to 'resources', except the get/update/delete paths aren't nested.
        let routes = []

        const resourceName = item.path
        const controllerName = item.options.controller || item.path
        const paramName = this.paramNameFor(item)
        const options = { ...parentOptions, ...item.options }

        let indexPath = this.path(resourceName + '/', recursePath)
        const index = new GeneratedRoute(
            indexPath,
            'get',
            controllerName,
            'index',
            options
        )

        index.addPathHelper(
            new PathHelper(
                this.pathHelperName(resourceName, 'index', recursePath),
                this.numArgs(recursePath, false),
                indexPath
            )
        )

        routes.push(index)

        const create = new GeneratedRoute(
            indexPath,
            'post',
            controllerName,
            'create',
            options
        )

        create.addPathHelper(
            new PathHelper(
                this.pathHelperName(resourceName, 'create', recursePath),
                this.numArgs(recursePath, false),
                indexPath
            )
        )

        routes.push(create)

        const withoutParent = [...recursePath]
        withoutParent.pop()

        let specificItemPath = this.path(
            resourceName + '/:' + paramName,
            withoutParent
        )
        const recurseWithoutLast = [...recursePath]
        recurseWithoutLast.pop()

        const show = new GeneratedRoute(
            specificItemPath,
            'get',
            controllerName,
            'show',
            options
        )
        show.addPathHelper(
            new PathHelper(
                this.pathHelperName(resourceName, 'show', recurseWithoutLast),
                this.numArgs(recurseWithoutLast, true),
                specificItemPath
            )
        )
        routes.push(show)

        const update = new GeneratedRoute(
            specificItemPath,
            'post',
            controllerName,
            'update',
            options
        )
        update.addPathHelper(
            new PathHelper(
                this.pathHelperName(resourceName, 'update', recurseWithoutLast),
                this.numArgs(recurseWithoutLast, true),
                specificItemPath
            )
        )
        routes.push(update)

        const del = new GeneratedRoute(
            specificItemPath,
            'delete',
            controllerName,
            'delete',
            options
        )
        del.addPathHelper(
            new PathHelper(
                this.pathHelperName(resourceName, 'delete', recurseWithoutLast),
                this.numArgs(recurseWithoutLast, true),
                specificItemPath
            )
        )

        routes.push(del)

        if (item.collector) {
            const subroutes = this.getRoutes(
                item.collector,
                recursePath.concat('/' + item.path + '/:' + paramName),
                options
            )
            routes = routes.concat(subroutes)
        }
        return routes
    }
}
