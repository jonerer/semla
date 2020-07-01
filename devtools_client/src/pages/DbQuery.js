import React, { useState, useEffect } from 'react'
import {
    Button,
    Checkbox,
    Container,
    Divider,
    Dropdown,
    Form,
    Icon,
    Input,
    Popup,
    Segment,
    TextArea,
} from 'semantic-ui-react'
import Api from '../utils/Api'
import { useModels } from './migrations/Create'
import styled from 'styled-components'
import Code from '../shared/Code'

const ErrorLine = styled.span`
    color: red;
`

const ResultLine = ({ line }) => {
    return (
        <div>
            <em>{line.text}</em>
            <br />
            {line.error && <ErrorLine>{line.error}</ErrorLine>}
            {line.results &&
                line.results.map((result, resultid) => {
                    return result.map((row, idx) => {
                        return (
                            <Code
                                key={resultid + '_' + idx}
                                content={JSON.stringify(row, null, 2)}
                                lang={'json'}
                            />
                        )
                    })
                })}
        </div>
    )
}

const ResultsView = ({ lines }) => {
    const numLines = lines.length
    return (
        <div>
            {lines.map((line, idx) => {
                // somenow turn a line into text yo
                // const s = JSON.stringify(line)
                return (
                    <ResultLine key={numLines - idx} line={line}></ResultLine>
                )
            })}
        </div>
    )
}
export const DbQueryPage = () => {
    const [lines, setLines] = useState([])
    const [loading, setLoading] = useState(false)
    const [editQuery, setEditQuery] = useState('')
    const [error, setError] = useState('')

    const submit = async (e) => {
        e.preventDefault()
        setLoading(true)
        try {
            const res = await Api.runDbQuery(editQuery)
            setLines([res, ...lines])
            setEditQuery('')
        } catch (e) {
            setError(e)
        }
        setLoading(false)
    }

    return (
        <div>
            <Container>
                Run queries on the active database
                {error && (
                    <Segment color={'red'}>
                        <Icon name={'warning'}></Icon>
                        Error: {error}
                    </Segment>
                )}
                <ResultsView lines={lines} />
                <Form onSubmit={submit}>
                    <Form.Group inline>
                        <Form.Field>
                            <label>SQL to run</label>
                            <TextArea
                                value={editQuery}
                                onChange={(e) => setEditQuery(e.target.value)}
                            />
                        </Form.Field>
                        <Form.Field>
                            <Button primary onClick={submit}>
                                Run!
                            </Button>
                        </Form.Field>
                    </Form.Group>
                </Form>
            </Container>
        </div>
    )
}

export default DbQueryPage
