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
    Message,
    Popup,
    Segment,
} from 'semantic-ui-react'
import Api from '../../utils/Api'
import moment from 'moment'
import { VariantSelector } from '../../utils/VariantSelector'

const availableFieldTypes = ['integer', 'text', 'timestamptz']

const availableFieldOptions = availableFieldTypes.map((x) => ({
    key: x,
    value: x,
    text: x,
}))

export const useModels = () => {
    const [loading, setLoading] = useState(true)
    const [models, setModels] = useState([])

    useEffect(() => {
        const doit = async () => {
            const mo = await Api.getModels()
            setModels(mo)
            setLoading(false)
        }

        doit()
    }, [])

    return [loading, models]
}

const CreateTableChange = ({ models, id, change, onTableChange, onDelete }) => {
    const { tableName } = change

    const warnAboutName = () => {
        if (tableName.length < 2) {
            return false
        }
        let notplural = !tableName.endsWith('s')
        let notLowercase = tableName.toLowerCase() !== tableName
        const exists = models.find((model) => model.tableName === tableName)
        return notplural || notLowercase || exists
    }

    return (
        <Form.Group inline>
            <Form.Field>
                <label>Table</label>
                <Input
                    placeholder="New table name"
                    compact
                    selection
                    value={tableName}
                    onChange={(e, { value }) => onTableChange(id, value)}
                />
            </Form.Field>
            {warnAboutName() && (
                <Popup trigger={<Icon name={'warning'} />}>
                    <Popup.Content>
                        The table name seems weird. It should:
                        <ul>
                            <li>Be pluralized</li>
                            <li>Be lowercased</li>
                            <li>Not already exist</li>
                        </ul>
                    </Popup.Content>
                </Popup>
            )}
            <Button basic negative size={'small'}>
                <Button.Content onClick={() => onDelete(id)}>
                    <Icon name={'close'} />
                    Remove
                </Button.Content>
            </Button>
        </Form.Group>
    )
}

const AlterTableChange = ({ models, id, change, onTableChange, onDelete }) => {
    const { tableName } = change

    const modelOptions = models.map((x) => ({
        key: x.tableName,
        value: x.tableName,
        text: x.tableName,
    }))

    return (
        <Form.Group inline>
            <Form.Field>
                <label>Table</label>
                <Dropdown
                    placeholder="Table"
                    compact
                    selection
                    options={modelOptions}
                    value={tableName}
                    onChange={(e, { value }) => onTableChange(id, value)}
                />
            </Form.Field>
            <Button basic negative size={'small'}>
                <Button.Content onClick={() => onDelete(id)}>
                    <Icon name={'close'} />
                    Remove
                </Button.Content>
            </Button>
        </Form.Group>
    )
}
/*

This is code from when alter column could do everything in the GUI

const AlterColumnChange = () => {
    const [loading, models] = useModels()
    const [modelName, setModelName] = useState('')
    const [selectedField, setSelectedField] = useState('')
    const [fieldOptions, setFieldOptions] = useState([])

    useEffect(() => {
        if (models.length !== 0 && modelName) {
            let fopts = models
                .find(x => x.name === modelName)
                .fields.map(x => ({
                    key: x.dbName,
                    value: x.dbName,
                    text: x.dbName,
                }))
            setFieldOptions(fopts)
            setSelectedField(fopts[0].value)
        }
    }, [modelName, models])

    if (loading) {
        return <div>loading</div>
    }

    const modelOptions = models.map(x => ({
        key: x.name,
        value: x.name,
        text: x.name,
    }))

    return (
        <>
            <Form.Group inline>
                <Form.Field>
                    <label>Alter table</label>
                    <Dropdown
                        placeholder="Table"
                        compact
                        selection
                        options={modelOptions}
                        value={modelName}
                        onChange={(e, { value }) => setModelName(value)}
                    />
                </Form.Field>
                {modelName !== '' && (
                    <>
                        <Form.Field>
                            <label>set column</label>
                            <Dropdown
                                placeholder="Select field"
                                compact
                                selection
                                options={fieldOptions}
                                value={selectedField}
                                onChange={(e, { value }) =>
                                    setSelectedField(value)
                                }
                            />
                        </Form.Field>
                        <Form.Field>
                            <label>to type</label>
                            <Dropdown
                                placeholder="Field type"
                                compact
                                selection
                                options={availableFieldOptions}
                            />
                        </Form.Field>
                    </>
                )}
            </Form.Group>
        </>
    )
}
*/

export default () => {
    const [type, setType] = useState('create')
    const [loading, setLoading] = useState(true)
    const [models, setModels] = useState({})

    const [changes, setChanges] = useState([])
    /*
    const [fieldOptions, setFieldOptions] = useState([])
    const [selectedField, setSelectedField] = useState('')
     */

    const [name, setName] = useState('')

    const [nextId, setNextId] = useState(0)

    const [nameSuggestion, setNameSuggestion] = useState('')
    const [timestr, setTimestr] = useState('')

    const [created, setCreated] = useState(false)
    const [creating, setCreating] = useState(false)
    const [error, setError] = useState(null)

    const [fileWritten, setFileWritten] = useState('')

    const [variantSelected, setVariantSelected] = useState('js')

    useEffect(() => {
        setTimestr(moment().format('YYYY-MM-DD_HH-mm_'))
    }, [])

    useEffect(() => {
        const doit = async () => {
            const mo = await Api.getModels()
            setModels(mo)

            /*
            let opts = []
            for (const field of mo[0].fields) {
                opts.push({
                    key: field.dbName,
                    value: field.dbName,
                    text: field.dbName,
                })
            }
            setFieldOptions(opts)
            setSelectedField(opts[0].value)
             */

            setLoading(false)
        }
        doit()
    }, [])

    const submit = async () => {
        const payload = {
            name: timestr + (name || nameSuggestion),
            changes: changes.map((change) => {
                return {
                    type: change.type,
                    tableName: change.tableName,
                }
            }),
            variant: variantSelected,
        }

        setCreating(true)
        try {
            const res = await Api.createMigration(payload)
            setCreating(false)
            setCreated(true)
            setFileWritten(res.fileWritten)
        } catch (e) {
            setCreating(false)
            setError(e.message)
        }
    }

    const canSubmit = () => {
        if (!name && !nameSuggestion) {
            return false
        }
        return true
    }

    useEffect(() => {
        let toRet = ''
        if (changes.length > 0 && changes[0].tableName.length > 2) {
            const firstChange = changes[0]
            const tab =
                firstChange.tableName.substr(0, 1).toUpperCase() +
                firstChange.tableName.substr(1)
            if (firstChange.type === 'alterTable') {
                toRet = 'ChangeTable' + tab
            } else if (firstChange.type === 'createTable') {
                toRet = 'CreateTable' + tab
            }
        }
        setNameSuggestion(toRet)
    }, [changes])

    const onTableChange = (id, newTable) => {
        const newChanges = changes.map((change) => {
            const newChange = {
                ...change,
            }
            if (newChange.id === id) {
                newChange.tableName = newTable
            }
            return newChange
        })
        setChanges(newChanges)
    }

    const onDeleteChange = (id) => {
        const newChanges = changes.filter((change) => {
            return change.id !== id
        })
        setChanges(newChanges)
    }

    const addAlterTable = () => {
        setChanges([
            ...changes,
            {
                id: nextId,
                type: 'alterTable',
                tableName: '',
            },
        ])
        setNextId(nextId + 1)
    }

    const addCreateTable = () => {
        setChanges([
            ...changes,
            {
                id: nextId,
                type: 'createTable',
                tableName: '',
            },
        ])
        setNextId(nextId + 1)
    }

    if (loading) {
        return <div>Loading...</div>
    }

    /*
                        <Form.Field>
                        <Checkbox
                            radio
                            label={'Create table'}
                            name={'type'}
                            value={'create'}
                            checked={type === 'create'}
                            onChange={(e, { value }) => setType(value)}
                        />
                    </Form.Field>
                    <Form.Field>
                        <Checkbox
                            radio
                            label={'Alter table'}
                            name={'type'}
                            value={'alter'}
                            checked={type === 'alter'}
                            onChange={(e, { value }) => setType(value)}
                        />
                    </Form.Field>
     */

    return (
        <div>
            <Container>
                <Form>
                    {created && (
                        <Segment color={'green'}>
                            <>
                                <Icon name={'check'} color={'green'} />
                                Success! File written: {fileWritten}
                            </>
                        </Segment>
                    )}
                    {error && (
                        <Segment color={'red'}>
                            <Icon name={'warning'}></Icon>
                            Error: {error}
                        </Segment>
                    )}
                    <Form.Group inline>
                        <Form.Field>
                            <Input
                                label={timestr}
                                value={name}
                                onChange={(e, { value }) => setName(value)}
                                placeholder={
                                    nameSuggestion || 'Name of migration'
                                }
                            ></Input>
                        </Form.Field>

                        <VariantSelector
                            value={variantSelected}
                            onChange={setVariantSelected}
                        />

                        <Button
                            primary
                            loading={creating}
                            onClick={submit}
                            disabled={!canSubmit()}
                        >
                            Create!
                        </Button>
                    </Form.Group>
                    {/*
                    <Divider />
                    (optional) Changes:{' '}
                    {changes.map((change) => {
                        if (change.type === 'alterTable') {
                            return (
                                <AlterTableChange
                                    key={change.id}
                                    id={change.id}
                                    models={models}
                                    change={change}
                                    onTableChange={onTableChange}
                                    onDelete={onDeleteChange}
                                />
                            )
                        } else if (change.type === 'createTable') {
                            return (
                                <CreateTableChange
                                    key={change.id}
                                    id={change.id}
                                    change={change}
                                    models={models}
                                    onTableChange={onTableChange}
                                    onDelete={onDeleteChange}
                                />
                            )
                        }
                    })}
                    <Button.Group basic size={'small'}>
                        <Button onClick={addCreateTable}>
                            <Icon color={'green'} name={'add'} /> create table
                        </Button>
                        <Button onClick={addAlterTable}>
                            <Icon color={'green'} name={'edit'} /> alter table
                        </Button>
                    </Button.Group>
                    */}
                </Form>
            </Container>
        </div>
    )
}
