import { Icon, Segment } from 'semantic-ui-react'
import React from 'react'


export const ErrorSegment = ({ error }) => {
    return <Segment>
        <Segment color={'red'}>
            <Icon name={'warning'}></Icon>
            Error: {error}
        </Segment>
    </Segment>
}
