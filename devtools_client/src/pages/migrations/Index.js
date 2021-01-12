import Api from '../../utils/Api'
import React, { useState, useEffect } from 'react'
import {
    Button,
    Container,
    Dropdown,
    Form,
    Icon,
    List,
    Popup,
    Segment,
} from 'semantic-ui-react'
import Code from '../../shared/Code'
import { ErrorSegment } from '../../shared/ErrorSegment'

const MigrationListItem = ({ migration }) => {
    const [open, setOpen] = useState(false)

    const isErrored = !!migration.generationError

    return (
        <List.Item onClick={() => setOpen(!open)} style={{ cursor: 'pointer' }}>
            <Popup
                trigger={
                    <Icon
                        avatar
                        name={migration.hasRun ? 'check' : 'close'}
                        color={migration.hasRun ? 'green' : 'red'}
                    />
                }
            >
                Migration has {migration.hasRun ? '' : <strong>not</strong>} run
            </Popup>
            <List.Content>
                {migration.name}
                {isErrored && (
                    <span style={{ color: 'red', fontWeight: 'bold', marginLeft: '100' }}
                          title={migration.generationError}>ERROR</span>
                )}
                {open && (
                    <div>
                        {isErrored ? (
                            <Code content={migration.generationError} lang={'sql'}/>
                        ) : (
                            <Code content={migration.generated} lang={'sql'}/>
                        )}
                    </div>
                )}
            </List.Content>
        </List.Item>
    )
}

const MigrationStarter = ({ env }) => {
    const [loading, setLoading] = useState(true)
    const [numOutstanding, setNumOutstanding] = useState(0)
    const [error, setError] = useState(null)
    const [migrations, setMigrations] = useState([])
    const [success, setSuccess] = useState(false)
    const [numSuccessful, setNumSuccessful] = useState(0)

    useEffect(() => {
        const doit = async () => {
            let newVar = await Api.getMigrations(env)
            setLoading(false)
            if (newVar.success === false) {
                setError(newVar.message)
            } else {
                setMigrations(newVar)
                setNumOutstanding(newVar.filter((x) => x.hasRun === false).length)
            }
        }
        doit()
    }, [env])

    const doit = async () => {
        setLoading(true)
        setError('')
        try {
            const result = await Api.runMigrations(env)
            setLoading(false)
            setSuccess(result.success)
            setNumSuccessful(result.numSuccessful)
            if (!result.success) {
                setError(result.message)
            }
        } catch (e) {
            setError(e.message)
        }
    }

    if (error) {
        return <Segment loading={loading}>
            {error && (
                <Segment color={'red'}>
                    <Icon name={'warning'}></Icon>
                    Error: {error}
                </Segment>
            )}
        </Segment>
    }

    return (
        <Segment loading={loading}>
            {numSuccessful > 0 && (
                <Segment color={'red'}>
                    <Icon name={'warning'}></Icon>
                    <p>Success! {numSuccessful} migration(s) succeded.</p>

                    <p>
                        Now the server will shut down. You need to start it back
                        up. This is to make sure the models are in sync with the
                        database
                    </p>
                </Segment>
            )}
            {numOutstanding > 0 ? (
                <div>
                    You have {numOutstanding} migrations pending.{' '}
                    <Button onClick={doit}>Run them</Button>
                </div>
            ) : (
                <div>You have no migrations pending.</div>
            )}
        </Segment>
    )
}

const MigrationListing = ({ env }) => {
    const [loading, setLoading] = useState(true)
    const [migrations, setMigrations] = useState([])
    const [error, setError] = useState('')

    useEffect(() => {
        const doit = async () => {
            let newVar = await Api.getMigrations(env)
            if (newVar.success === false) {
                setError(newVar.message)
            } else {
                setMigrations(newVar)
            }
        }
        doit()
    }, [env])

    if (error) {
        return <ErrorSegment error={error} />
    }

    return (
        <List divided vertialAlign={'middle'}>
            {migrations.map((migration) => {
                return (
                    <MigrationListItem
                        key={migration.name}
                        migration={migration}
                    />
                )
            })}
        </List>
    )
}

const IndexPage = () => {
    const [info, setInfo] = useState({})
    const [loading, setLoading] = useState(true)
    const [chosenEnv, setChosenEnv] = useState('')
    const [error, setError] = useState('')

    const envs = ['dev', 'test']

    const modelOptions = envs.map((e) => {
        return {
            key: e,
            value: e,
            text: e,
        }
    })

    useEffect(() => {
        const doit = async () => {
            let info = await Api.getServerInfo()
            if (info.success === false) {
                setError(info.message)
            } else {
                setInfo(info)
                setChosenEnv(info.envShortName)
                setLoading(false)
            }
        }
        doit()
    }, [])

    if (loading) {
        return <div>Loading...</div>
    }

    if (error) {
        return <ErrorSegment error={error} />
    }

    return (
        <div>
            <Container>
                <Form>
                    <Form.Group inline>
                        <Form.Field>
                            <label>Environment: </label>
                            <Dropdown
                                placeholder="dev"
                                compact
                                selection
                                options={modelOptions}
                                value={chosenEnv}
                                onChange={(e, { value }) => setChosenEnv(value)}
                            />
                        </Form.Field>
                    </Form.Group>
                </Form>

                <MigrationStarter env={chosenEnv}/>
                <MigrationListing env={chosenEnv}/>
            </Container>
        </div>
    )
}
export default IndexPage
