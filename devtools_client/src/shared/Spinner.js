
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

export const Spinner = () => {
    return <Segment loading={true} />
}