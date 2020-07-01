import {
    Container,
    Icon,
    List,
    Table,
    Segment,
    Button,
    Checkbox,
} from 'semantic-ui-react'
import React, { useState, useEffect } from 'react'
import Api from '../utils/Api'
import styled from 'styled-components'
import moment from 'moment'
import Code from '../shared/Code'

const RequestItemRequest = ({ request }) => {
    const reqObj = JSON.parse(request.requestdata)
    const { headers, body, query } = reqObj
    return (
        <div>
            {body && (
                <div>
                    <strong>Body:</strong>
                    <Code
                        lang={'json'}
                        content={JSON.stringify(body, null, 2)}
                        folded={true}
                    />
                </div>
            )}
            {query && (
                <div>
                    <strong>Query params:</strong>
                    <Code
                        lang={'json'}
                        content={JSON.stringify(query, null, 2)}
                        folded={true}
                    />
                </div>
            )}
            <strong>Headers:</strong>
            <Code
                lang={'json'}
                content={JSON.stringify(headers, null, 2)}
                folded={true}
            ></Code>
        </div>
    )
}

const RequestItemDebuginfo = ({ request }) => {
    const debuginfo = request.debuginfo ? JSON.parse(request.debuginfo) : {}

    const hasLogs = debuginfo.logs

    return (
        <div>
            <div>
                <strong>Logs: </strong>
                {hasLogs ? (
                    <Code
                        lang={'plaintext'}
                        folded={true}
                        content={JSON.stringify(debuginfo.logs, null, 2)}
                    ></Code>
                ) : (
                    <em>Nothing logged</em>
                )}
            </div>
        </div>
    )
}

const RequestItemResponse = ({ responseData, request }) => {
    const js = JSON.parse(responseData)
    const { stack } = js

    const isJson = js.type === 'json'
    const isHtml = js.type === 'html'
    console.log(js)

    const statusCode = request.statuscode

    return (
        <div>
            <div>
                <strong>Status: </strong>
                {statusCode} {js.statusMessage}
            </div>

            {stack && (
                <div>
                    <strong>Stacktrace:</strong>
                    <Code lang={'plaintext'} content={stack} folded={true} />
                </div>
            )}

            {isJson && js.content && (
                <div>
                    <strong>JSON response:</strong>
                    <Code
                        lang={'json'}
                        content={JSON.stringify(js.content, null, 2)}
                        folded={true}
                    />
                </div>
            )}
            {isHtml && (
                <div>
                    <strong>HTML response:</strong>
                    <Code lang={'html'} content={js.content} folded={true} />
                </div>
            )}
        </div>
    )
}

const OpenedRequestItem = ({ request }) => {
    const { path, method, responsedata } = request
    const [loading, setLoading] = useState(false)
    const [done, setDone] = useState(false)
    const [overrideCsrf, setOverrideCsrf] = useState(true)

    const hasResponse = !!responsedata

    const hasBody =
        method === 'POST' ||
        method === 'PATCH' ||
        method === 'PUT' ||
        method === 'DELETE'

    const repeat = async (e) => {
        e.preventDefault()
        setDone(false)
        setLoading(true)
        await Api.repeatRequest(request.id, overrideCsrf)
        setLoading(false)
        setDone(true)
    }

    return (
        <div>
            <div>
                <Button onClick={repeat} loading={loading}>
                    Repeat {done && <Icon name={'check'} color={'green'} />}
                </Button>
                {hasBody && (
                    <Checkbox
                        label={'Bypass CSRF'}
                        checked={overrideCsrf}
                        onClick={() => setOverrideCsrf(!overrideCsrf)}
                    />
                )}
            </div>
            <div>
                <h3>Request</h3>
                <RequestItemRequest request={request} />
            </div>
            <div>
                <h3>Debuginfo</h3>
                <RequestItemDebuginfo request={request} />
            </div>
            <div>
                <h3>Response</h3>
                {hasResponse && (
                    <RequestItemResponse
                        request={request}
                        responseData={responsedata}
                    />
                )}
            </div>
        </div>
    )
}

const ClosedRequestLine = styled.div`
    display: flex;
    margin: 0 -5px;
    font-weight: ${(props) => (props.opened ? 600 : 400)};
`

const ClosedRequestColumn = styled.div`
    padding: 0 5px;
    width: 50px;
`

const RequestsListItem = ({ request }) => {
    const { path, method, responsedata, statuscode, createdAt } = request

    const [opened, setOpened] = useState(false)

    const responseType = responsedata ? JSON.parse(responsedata).type : ''

    const time = moment(createdAt).format('HH:mm:ss')

    return (
        <div>
            <ClosedRequestLine
                onClick={() => setOpened(!opened)}
                style={{ cursor: 'pointer' }}
                opened={opened}
            >
                <ClosedRequestColumn
                    style={{
                        width: '60px',
                        color: 'lightgrey',
                    }}
                >
                    {time}
                </ClosedRequestColumn>
                <ClosedRequestColumn>{method}</ClosedRequestColumn>
                <ClosedRequestColumn style={{ width: '300px' }}>
                    {path}
                </ClosedRequestColumn>
                <ClosedRequestColumn>
                    {statuscode ? statuscode : '-'}
                </ClosedRequestColumn>
                <ClosedRequestColumn>{responseType}</ClosedRequestColumn>
            </ClosedRequestLine>
            {opened && <OpenedRequestItem request={request} />}
        </div>
    )
}

export default () => {
    const [loading, setLoading] = useState(true)
    const [requests, setRequests] = useState([])

    useEffect(() => {
        ;(async () => {
            setRequests(await Api.getRequests())
            setLoading(false)
        })()
    }, [])

    useEffect(() => {
        const poll = setInterval(async () => {
            const reqs = await Api.getRequests()
            setRequests(reqs)
        }, 5000)
        return () => {
            clearInterval(poll)
        }
    }, [])

    if (loading) {
        return <div>Loading</div>
    }

    return (
        <div>
            <Container>
                <h2>Requests logged in your application</h2>

                <Segment>
                    {requests.length === 0 ? (
                        <em>No requests logged yet</em>
                    ) : (
                        requests.map((request) => {
                            return (
                                <RequestsListItem
                                    key={request.id}
                                    request={request}
                                />
                            )
                        })
                    )}
                </Segment>
            </Container>
        </div>
    )
}
