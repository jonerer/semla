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
} from 'semantic-ui-react'
import Api from '../utils/Api'
import { useModels } from './migrations/Create'
import styled from 'styled-components'
import Code from '../shared/Code'

const ItemHeaderLeft = styled.div`
    cursor: pointer;
    height: 20px;
    flex: 1;
`

const ItemHeader = styled.div`
    width: 100%;
    display: flex;
    align-items: center;
`

const ApplyMigrationListItem = ({ item, onApply }) => {
    const [open, setOpen] = useState(false)
    let checkIcon = 'circle outline'
    let checkColor = 'grey'
    if (item.failed) {
        checkColor = 'red'
        checkIcon = 'close icon'
    }
    if (item.applied) {
        checkColor = 'green'
        checkIcon = 'check circle outline'
    }
    return (
        <div>
            <ItemHeader>
                <ItemHeaderLeft onClick={() => setOpen(!open)}>
                    <Icon color={checkColor} name={checkIcon} />
                    {item.path}
                </ItemHeaderLeft>

                <Icon
                    name={open ? 'chevron left' : 'chevron down'}
                    onClick={() => setOpen(!open)}
                    style={{ marginRight: 10, cursor: 'pointer' }}
                />
                <Button
                    primary
                    disabled={item.applied}
                    onClick={() => onApply(item)}
                >
                    Apply!
                </Button>
            </ItemHeader>

            {open && <Code content={item.text} />}
        </div>
    )
}

const ApplyMigrationsPage = ({ fileChanges }) => {
    const [items, setItems] = useState(fileChanges)

    const applyOne = async (item) => {
        setItems(await updateOne(item, items))
    }

    const updateOne = async (item, items) => {
        let newItem = { ...item }
        try {
            const res = await Api.applyGeneratedFile(item.id)
            newItem.applied = true
        } catch (e) {
            newItem.failed = true
        }
        return items.map((x) => {
            if (x.id !== item.id) {
                return { ...x }
            } else {
                return newItem
            }
        })
    }

    const applyAll = async () => {
        let it = items
        for (const f of fileChanges) {
            if (!f.applied) {
                it = await updateOne(f, it)
            }
        }
        setItems(it)
    }

    return (
        <div>
            <Container>
                <Segment color={'green'}>
                    <>
                        These file changes were generated:{' '}
                        <Button primary onClick={applyAll}>
                            Apply all
                        </Button>
                        {items.map((fileChange) => {
                            return (
                                <ApplyMigrationListItem
                                    item={fileChange}
                                    onApply={applyOne}
                                />
                            )
                        })}
                    </>
                </Segment>
            </Container>
        </div>
    )
}

const GeneratePage = () => {
    const [name, setName] = useState('')
    const [fullResource, setFullResource] = useState(true)
    const [nestingParent, setNestingParent] = useState('')
    const [requiresAuth, setRequiresAuth] = useState(false)

    const [variantSelected, setVariantSelected] = useState('js')

    const [created, setCreated] = useState(false)
    const [creating, setCreating] = useState(false)
    const [error, setError] = useState(null)

    const [creationResponse, setCreationResponse] = useState('')

    const [loading, models] = useModels()

    const warnAboutName = () => {
        if (name.length < 3) {
            return false
        }
        const firstChar = name.charAt(0)
        if (firstChar.toUpperCase() !== firstChar) {
            return true
        }
        if (name.indexOf('_') !== -1) {
            return true
        }
        if (name.indexOf('-') !== -1) {
            return true
        }
        if (name.endsWith('s')) {
            return true
        }
    }

    const variantOptions = ['js', 'ts'].map(name => {
        return {
            key: name,
            value: name,
            text: name
        }
    })
    /*
    const modelOptions = models.map((x) => ({
        key: x.name,
        value: x.name,
        text: x.name,
    }))
     */

    const submit = async () => {
        const payload = {
            name,
            fullResource,
            nestingParent,
            requiresAuth,
            variant: variantSelected
        }

        setCreating(true)
        try {
            const res = await Api.generate(payload)
            setCreationResponse(res)
            setCreating(false)
            setCreated(true)
        } catch (e) {
            setCreating(false)
            setError(e.message)
        }
    }

    const canSubmit = () => {
        if (!name) {
            return false
        }
        return true
    }

    if (creationResponse) {
        return <ApplyMigrationsPage fileChanges={creationResponse} />
    }

    return (
        <div>
            <Container>
                <strong>
                    Warning: this isn't quite done yet. Use at your own risk.
                </strong>
                Generate things for your resources!
                {error && (
                    <Segment color={'red'}>
                        <Icon name={'warning'}></Icon>
                        Error: {error}
                    </Segment>
                )}
                <Form>
                    <Segment>
                        <Form.Group inline>
                            <label>
                                What's the model name of your resource?
                            </label>
                            <Form.Field>
                                <Input
                                    placeholder={'User'}
                                    value={name}
                                    onChange={(e, { value }) => setName(value)}
                                ></Input>
                                {warnAboutName() && (
                                    <Popup trigger={<Icon name={'warning'} />}>
                                        <Popup.Content>
                                            The model name seems weird. It
                                            should:
                                            <ul>
                                                <li>Be Capitalized</li>
                                                <li>
                                                    BeCamelCased, no underscores
                                                </li>
                                                <li>
                                                    Be a valid class name, no -
                                                </li>
                                                <li>Be singularized</li>
                                            </ul>
                                        </Popup.Content>
                                    </Popup>
                                )}
                            </Form.Field>
                            <Button
                                primary
                                loading={creating}
                                onClick={submit}
                                disabled={!canSubmit()}
                            >
                                Create!
                            </Button>
                        </Form.Group>
                        <Form.Group inline>
                            <Form.Field>
                                <label>
                                    Variant
                                </label>
                                <Dropdown
                                    compact
                                    selection
                                    options={variantOptions}
                                    value={variantSelected}
                                    onChange={(e, { value }) =>
                                        setVariantSelected(value)
                                    }
                                />
                            </Form.Field>
                        </Form.Group>
                        {/*
                        <Form.Group inline>
                            <Form.Field>
                                <label>
                                    If nested, which is the parent resource?
                                </label>
                                <Dropdown
                                    compact
                                    selection
                                    clearable
                                    options={modelOptions}
                                    value={nestingParent}
                                    onChange={(e, { value }) =>
                                        setNestingParent(value)
                                    }
                                />
                            </Form.Field>
                        </Form.Group>
                        */}
                        <Form.Group>
                            <Form.Field>
                                <Checkbox
                                    label={
                                        'This resource requires authentication to access'
                                    }
                                    checked={requiresAuth}
                                    onChange={() =>
                                        setRequiresAuth(!requiresAuth)
                                    }
                                />
                            </Form.Field>
                        </Form.Group>
                        <Divider />
                        <Form.Group>
                            <Form.Field>
                                <Checkbox
                                    label={'Generate full resource'}
                                    checked={fullResource}
                                    onChange={() =>
                                        setFullResource(!fullResource)
                                    }
                                />
                                <Popup trigger={<Icon name={'question'} />}>
                                    <Popup.Content>
                                        This includes a controller,{' '}
                                        <span style="text-decoration: line-through;">
                                            routes
                                        </span>
                                        , a model, a migration and a test shell
                                    </Popup.Content>
                                </Popup>
                            </Form.Field>
                            <Form.Field>
                                <Checkbox
                                    label={'This is a JSON resource'}
                                    checked={fullResource}
                                    onChange={() =>
                                        setFullResource(!fullResource)
                                    }
                                />
                            </Form.Field>
                        </Form.Group>
                    </Segment>
                </Form>
            </Container>
        </div>
    )
}

export default GeneratePage
