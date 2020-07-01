import { Container, Icon, List, Table } from 'semantic-ui-react'
import React, { useState, useEffect } from 'react'
import Api from '../utils/Api'

const ListItem = ({ global }) => {
    return (
        <Table.Row>
            <Table.Cell>{global.name}</Table.Cell>
            <Table.Cell>{global.description}</Table.Cell>
        </Table.Row>
    )
}

export default () => {
    const [loading, setLoading] = useState(true)
    const [globals, setGlobals] = useState([])

    useEffect(() => {
        ;(async () => {
            setGlobals(await Api.getGlobals())
            setLoading(false)
        })()
    }, [])

    if (loading) {
        return <div>Loading</div>
    }

    return (
        <div>
            <Container>
                <h2>
                    These are the things added into global scope in your
                    application
                </h2>
                <Table celled>
                    <Table.Header>
                        <Table.Row>
                            <Table.HeaderCell>Name</Table.HeaderCell>
                            <Table.HeaderCell>Description</Table.HeaderCell>
                        </Table.Row>
                    </Table.Header>

                    <Table.Body>
                        {globals.map((global) => {
                            return (
                                <ListItem key={global.name} global={global} />
                            )
                        })}
                    </Table.Body>
                </Table>
            </Container>
        </div>
    )
}
