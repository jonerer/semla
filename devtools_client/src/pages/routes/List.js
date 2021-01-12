import { Checkbox, Container, Icon, List, Table } from 'semantic-ui-react'
import React, { useState, useEffect } from 'react'
import Api from '../../utils/Api'

const ListItem = ({ route, controllers }) => {
    const getContr = (name) => {
        const contr = controllers.find((x) => x.name === name)
        return contr
    }

    const contr = getContr(route.controllerName)

    let actionExists = false
    if (contr) {
        actionExists = contr.propertyNames.find((name) => name === route.action)
    }

    console.log({route })

    return (
        <Table.Row>
            <Table.Cell>{route.method}</Table.Cell>
            <Table.Cell>
                <a href={route.path}>{route.path}</a>
            </Table.Cell>
            {/*
            <Table.Cell>{route.methodName}</Table.Cell>
            */}
            <Table.Cell>
                {route.controllerName} @ {route.action}
            </Table.Cell>
            <Table.Cell positive={actionExists} negative={!actionExists}>
                {actionExists ? (
                    <Icon name={'checkmark'} />
                ) : (
                    <Icon name={'close'} />
                )}
                {actionExists ? 'yes' : 'no'}
            </Table.Cell>
        </Table.Row>
    )
}

export default () => {
    const [loading, setLoading] = useState(true)
    const [routes, setRoutes] = useState([])
    const [controllers, setControllers] = useState([])
    const [hideDevRoutes, setHideDevRoutes] = useState(
        localStorage.getItem('devtoolsHideDevRoutes') === 'true' ||
        localStorage.getItem('devtoolsHideDevRoutes') === null
    )


    useEffect(() => {
        ;(async () => {
            setRoutes(await Api.getRoutes())
            setControllers(await Api.getControllers())
            setLoading(false)
        })()
    }, [])

    if (loading) {
        return <div>Loading</div>
    }

    const routesToShow = hideDevRoutes ? routes.filter(route => {
        return !(route?.meta?.builtinDevRoute)
    }) : routes

    return (
        <div>
            <Container>
                <h2>These are the active routes in your application</h2>
                <Checkbox toggle label={"Hide built-in development routes"} checked={hideDevRoutes}
                onClick={() => {
                    const newVal = !hideDevRoutes
                    localStorage.setItem('devtoolsHideDevRoutes', newVal === true ? 'true' : 'false')
                    setHideDevRoutes(newVal)
                }}/>
                <Table celled>
                    <Table.Header>
                        <Table.Row>
                            <Table.HeaderCell>Method</Table.HeaderCell>
                            <Table.HeaderCell>Path</Table.HeaderCell>
                            {/*
                            <Table.HeaderCell>
                                Path helper function name
                            </Table.HeaderCell>
                            */}
                            <Table.HeaderCell>
                                Controller action
                            </Table.HeaderCell>
                            <Table.HeaderCell>Action exists?</Table.HeaderCell>
                        </Table.Row>
                    </Table.Header>

                    <Table.Body>
                        {routesToShow.map((route) => {
                            return (
                                <ListItem
                                    key={route.method + route.path}
                                    route={route}
                                    controllers={controllers}
                                />
                            )
                        })}
                    </Table.Body>
                </Table>
            </Container>
        </div>
    )
}
