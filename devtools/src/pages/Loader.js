import { Container, Icon, List, Segment, Table } from 'semantic-ui-react'
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
    const [loader, setLoader] = useState([])

    useEffect(() => {
        ;(async () => {
            setLoader(await Api.getLoaderIndex())
            setLoading(false)
        })()
    }, [])

    if (loading) {
        return <div>Loading</div>
    }

    return (
        <div>
            <Container>
                <Segment>
                    <h2>
                        These are the things the autoloader loaded into your app
                    </h2>
                    <p>This doesn't include templates</p>
                    Auto loaded directories
                    <List>
                        {loader.loadedDirs.map((dir) => {
                            return (
                                <List.Item key={dir}>
                                    <List.Icon name={'folder'} />
                                    <List.Content>
                                        <List.Description>
                                            {dir}
                                        </List.Description>
                                    </List.Content>
                                </List.Item>
                            )
                        })}
                    </List>
                    Auto loaded files
                    <List>
                        {loader.loadedFiles.map((dir) => {
                            return (
                                <List.Item key={dir}>
                                    <List.Icon name={'file'} />
                                    <List.Content>
                                        <List.Description>
                                            {dir}
                                        </List.Description>
                                    </List.Content>
                                </List.Item>
                            )
                        })}
                    </List>
                </Segment>
            </Container>
        </div>
    )
}
