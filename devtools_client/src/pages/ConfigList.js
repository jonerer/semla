import { Container, Icon, List, Table } from 'semantic-ui-react'
import React, { useState, useEffect } from 'react'
import Api from '../utils/Api'

const ListItem = ({ configs, thisItemKey }) => {
    const outputText = (value) => {
        if (typeof value === 'string') {
            return '"' + value + '"'
        }
        if (typeof value === 'object') {
            return JSON.stringify(value)
        }
        if (typeof value === 'boolean') {
            return value ? 'true' : 'false'
        }
        return value
    }

    return (
        <Table.Row>
            <Table.Cell>{thisItemKey}</Table.Cell>
            <Table.Cell>{outputText(configs.conf[thisItemKey])}</Table.Cell>
            <Table.Cell>{outputText(configs.defaults[thisItemKey])}</Table.Cell>
            <Table.Cell>{outputText(configs.resolved[thisItemKey])}</Table.Cell>
        </Table.Row>
    )
}

export default () => {
    const [loading, setLoading] = useState(true)
    const [configs, setConfigs] = useState([])

    useEffect(() => {
        ;(async () => {
            setConfigs(await Api.getConfigs())
            setLoading(false)
        })()
    }, [])

    if (loading) {
        return <div>Loading</div>
    }

    return (
        <div>
            <Container>
                <h2>This is the config in your application</h2>
                <Table celled>
                    <Table.Header>
                        <Table.Row>
                            <Table.HeaderCell>Path</Table.HeaderCell>
                            <Table.HeaderCell>
                                Configured value
                            </Table.HeaderCell>
                            <Table.HeaderCell>Default value</Table.HeaderCell>
                            <Table.HeaderCell>Resolved value</Table.HeaderCell>
                        </Table.Row>
                    </Table.Header>

                    <Table.Body>
                        {Object.keys(configs.resolved).map((key) => {
                            return (
                                <ListItem
                                    key={key}
                                    configs={configs}
                                    thisItemKey={key}
                                />
                            )
                        })}
                    </Table.Body>
                </Table>
            </Container>
        </div>
    )
}
