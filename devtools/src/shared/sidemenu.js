import { Link } from 'react-router-dom'
import React from 'react'

const Sidemenu = () => {
    const docLinks = {
        getting_started: {
            name: 'Getting started',
            items: {
                why: 'Why semla?',
                routing: 'Routing',
                models: 'Models',
                relations: 'Relations',
                templates: 'Templates',
            },
        },
    }
    return (
        <div>
            <ul>
                <h3>Docs</h3>
                {Object.keys(docLinks).map((sectionKey) => {
                    const section = docLinks[sectionKey]
                    return Object.keys(section.items).map((subSecKey) => {
                        const subSec = section.items[subSecKey]
                        return (
                            <li>
                                <Link to={`/${sectionKey}/${subSecKey}`}>
                                    {subSec}
                                </Link>
                            </li>
                        )
                    })
                })}
                <hr />
                <h3>Your app</h3>
                <li>
                    <Link to={'/routes/list'}>Routes</Link>
                </li>
                <li>
                    <Link to={'/generate'}>Generate</Link>
                </li>
                <li>
                    <Link to="/migrations">Migrations</Link>
                    <ul>
                        <li>
                            <Link to="/migrations/create">Create</Link>
                        </li>
                    </ul>
                </li>
                <li>
                    <Link to={'/requests'}>Requests</Link>
                </li>
                <li>
                    <Link to={'/globals'}>Globals</Link>
                </li>
                <li>
                    <Link to={'/models'}>Models</Link>
                </li>
                <li>
                    <Link to={'/config'}>Config</Link>
                </li>
                <li>
                    <Link to={'/db_query'}>DB Query</Link>
                </li>
                <li>
                    <Link to={'/loader'}>Loader</Link>
                </li>
            </ul>
        </div>
    )
}
export default Sidemenu
