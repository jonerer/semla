import { Container, Icon, List, Table, Segment } from 'semantic-ui-react'
import React, { useState, useEffect } from 'react'
import Api from '../utils/Api'
import styled from 'styled-components'
import InlineCode from '../shared/InlineCode'

const ItemHeaderLeft = styled.div`
    cursor: pointer;
    height: 20px;
    flex: 1;
`

const ItemHeader = styled.div`
    width: 100%;
    display: flex;
    align-items: center;

    margin-bottom: 7px;
    font-weight: 600;
    font-size: 17px;
    border-bottom: #d6d6d663 1px solid;
`

const ModelListItem = ({ model }) => {
    const [open, setOpen] = useState(false)

    return (
        <div style={{ marginBottom: 13 }}>
            <ItemHeader>
                <ItemHeaderLeft onClick={() => setOpen(!open)}>
                    {model.name}
                </ItemHeaderLeft>

                <Icon
                    name={open ? 'chevron left' : 'chevron down'}
                    onClick={() => setOpen(!open)}
                    style={{ marginRight: 10, cursor: 'pointer' }}
                />
            </ItemHeader>

            {open && (
                <div>
                    <div>
                        Available in routes by the parameter name{' '}
                        <InlineCode content={':' + model.routeParamName} />{' '}
                    </div>
                    Fields
                    <Table celled>
                        <Table.Header>
                            <Table.Row>
                                <Table.HeaderCell>jsName</Table.HeaderCell>
                                <Table.HeaderCell>db_name</Table.HeaderCell>
                                <Table.HeaderCell>type</Table.HeaderCell>
                            </Table.Row>
                        </Table.Header>

                        <Table.Body>
                            {model.fields.map((field) => {
                                return (
                                    <Table.Row>
                                        <Table.Cell>{field.jsName}</Table.Cell>
                                        <Table.Cell>{field.dbName}</Table.Cell>
                                        <Table.Cell>{field.type}</Table.Cell>
                                    </Table.Row>
                                )
                            })}
                        </Table.Body>
                    </Table>
                </div>
            )}
        </div>
    )
}

export default () => {
    const [loading, setLoading] = useState(true)
    const [models, setModels] = useState([])

    useEffect(() => {
        ;(async () => {
            setModels(await Api.getModels())
            setLoading(false)
        })()
    }, [])

    if (loading) {
        return <div>Loading</div>
    }

    return (
        <div>
            <Container>
                <h2>These are the models in your application</h2>

                <Segment>
                    {models.map((model) => {
                        return <ModelListItem model={model} />
                    })}
                </Segment>
            </Container>
        </div>
    )
}
