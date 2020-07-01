import React from 'react'
import InlineCode from './InlineCode'

export default ({ name, example, children }) => {
    let exContent = ''
    if (example) {
        if (typeof example === 'function') {
            exContent = example()
        } else {
            exContent = example
        }
    }

    return (
        <div>
            <InlineCode>{name}</InlineCode>
            {exContent}
            <div>{[...children]}</div>
        </div>
    )
}
