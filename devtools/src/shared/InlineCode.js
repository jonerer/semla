import React from 'react'
import SyntaxHighlighter from 'react-syntax-highlighter'
import { docco } from 'react-syntax-highlighter/dist/esm/styles/hljs'

export default ({ lang, content, children }) => {
    if (!lang) {
        lang = 'javascript'
    }
    const cont = content || children

    return (
        <SyntaxHighlighter
            customStyle={{ display: 'inline' }}
            language={lang}
            style={docco}
        >
            {cont}
        </SyntaxHighlighter>
    )
}
