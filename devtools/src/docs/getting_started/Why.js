import * as marked from 'marked'
import React, { useEffect, useState } from 'react'
import Api from '../../utils/Api'
import ReactMarkdown from 'react-markdown'
import InlineCode from '../../shared/InlineCode'
import MainTitle from '../../shared/MainTitle'
import { Container } from 'semantic-ui-react'

const Te = () => {
    return <div>Tete</div>
}

{
    /*
        doesnt work =/
    const renderers = {
        text: Te,
        /*
        text(e) {
            console.log(e)
            return <div>Nae!</div>
        },

return (
    <>
        va?
        <ReactMarkdown
            source={contents}
            escapeHtml={false}
            renderers={renderers}
        />
    </>
)
*/
    //return <div dangerouslySetInnerHTML={{ __html: contents }}></div>
}

export default () => {
    const [contents, setContents] = useState('')

    useEffect(() => {
        const doit = async () => {
            const raw = (await Api.getDocPage('why')).content
            setContents(marked(raw))
        }
        doit()
    }, [])

    return (
        <Container>
            <MainTitle>Why Semla?</MainTitle>
            <p>
                Semla is a backend javascript framework that seeks to make
                node.js fun and effective. blabla
            </p>
        </Container>
    )
}
