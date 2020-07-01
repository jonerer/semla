import React, { useState } from 'react'
import SyntaxHighlighter from 'react-syntax-highlighter'
import { docco } from 'react-syntax-highlighter/dist/esm/styles/hljs'

export default ({ lang, content, folded }) => {
    const [unfolded, setUnfolded] = useState(false)
    if (!lang) {
        lang = 'javascript'
    }

    let startFolded = folded
    if (folded === undefined) {
        startFolded = false
    }

    const currentFoldState = startFolded && !unfolded

    const myStyle = {
        overflow: currentFoldState ? 'hidden' : 'auto',
        maxHeight: currentFoldState ? '180px' : '',
        cursor: currentFoldState ? 'pointer' : '',
    }

    const unfoldClick = (e) => {
        e.stopPropagation()

        if (!unfolded) {
            setUnfolded(true)
        }
    }

    return (
        <div style={myStyle} onClick={unfoldClick}>
            <SyntaxHighlighter language={lang} style={docco}>
                {content}
            </SyntaxHighlighter>
        </div>
    )
}
