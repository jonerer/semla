import { Container, Table } from 'semantic-ui-react'
import React from 'react'
import MainTitle from '../../shared/MainTitle'
import InlineCode from '../../shared/InlineCode'
import SectionTitle from '../../shared/SectionTitle'
import Code from '../../shared/Code'
import Field from '../../shared/Field'

export default () => {
    return (
        <Container>
            <MainTitle>Routing</MainTitle>

            <p>
                Routeing is the art of mapping HTTP paths to controller actions.
                In semla, routes are configured in a rather declarative manner.
                Semla has some methods to simplify common patterns of REST
                services, but you can also supply completely free-form routings.
            </p>

            <SectionTitle>Example</SectionTitle>
            {/* prettier-ignore */}
            <Code content={`
            export function routes(r) {

                r.get('standard_get', 'controller@get')
            
                r.post(
                    '/with_params/:paramOne/',
                    'paramstester@test'
                )

                r.prefix('api', r => {
                    r.resources('users', {
                        controller: 'apiusers',
                    })
                })


                r.resources('users', r => {
                    r.semiNested('pets')
                })

            }
            
            registerRoutes(routes)`} />

            <p>
                This route mapping first sets up a <InlineCode>get</InlineCode>{' '}
                route and a <InlineCode>post</InlineCode> route. As you can see,
                path params are specified with standard{' '}
                <InlineCode>express</InlineCode> syntax. The action is pointed
                out with the second param using the format
                <InlineCode>controllerName@actionName</InlineCode>
            </p>

            <p>
                <InlineCode>prefix</InlineCode>,{' '}
                <InlineCode>resources</InlineCode> and{' '}
                <InlineCode>semiNested</InlineCode> will be explained below
            </p>

            <p>
                You can put your routes anywhere. Just make sure they are
                imported in the 'init' phase of app startup. And that they are
                registered with registerRoutes.
            </p>

            <Field
                name="r.prefix(name[, callback_or_options [, options]])"
                example={`r.prefix('api', r => {
    r.get('teams', 'teams@index')
    r.post('teams', 'teams@create')
})`}
            >
                <p>
                    This will result in two URLs being bound: <br />
                    <InlineCode>GET /api/something</InlineCode> and{' '}
                    <InlineCode>POST /api/something</InlineCode>. It's a useful
                    method for declaring multiple routes that share a prefix,
                    and that share a configuration. For instance, a "api" prefix
                    would probably have shared API authenticator set up.
                </p>

                <p>
                    It will also generate two functions added to the global
                    scope: <InlineCode>apiTeamIndex</InlineCode> and{' '}
                    <InlineCode>apiTeamCreate</InlineCode>. They are used to
                    generate URLs for the routes. Useful in templates,
                    controllers (for redirects) and in tests.
                </p>
            </Field>

            <Field
                name="r.resources(name[, callback_or_options [, options]]"
                example={`r.resources('users')`}
            >
                <p>This will generate five routes:</p>

                <Table celled>
                    <Table.Header>
                        <Table.Row>
                            <Table.HeaderCell>Method</Table.HeaderCell>
                            <Table.HeaderCell>Path</Table.HeaderCell>
                            <Table.HeaderCell>
                                Path helper function
                            </Table.HeaderCell>
                            <Table.HeaderCell>
                                Controller action
                            </Table.HeaderCell>
                        </Table.Row>
                    </Table.Header>

                    <Table.Body>
                        <Table.Row>
                            <Table.Cell>get</Table.Cell>
                            <Table.Cell>/users</Table.Cell>
                            <Table.Cell>userIndex</Table.Cell>
                            <Table.Cell>users @ index</Table.Cell>
                        </Table.Row>

                        <Table.Row>
                            <Table.Cell>post</Table.Cell>
                            <Table.Cell>/users</Table.Cell>
                            <Table.Cell>userCreate</Table.Cell>
                            <Table.Cell>users @ create</Table.Cell>
                        </Table.Row>

                        <Table.Row>
                            <Table.Cell>get</Table.Cell>
                            <Table.Cell>/users/:user</Table.Cell>
                            <Table.Cell>userShow</Table.Cell>
                            <Table.Cell>users @ show</Table.Cell>
                        </Table.Row>

                        <Table.Row>
                            <Table.Cell>post</Table.Cell>
                            <Table.Cell>/users/:user</Table.Cell>
                            <Table.Cell>userUpdate</Table.Cell>
                            <Table.Cell>users @ update</Table.Cell>
                        </Table.Row>

                        <Table.Row>
                            <Table.Cell>delete</Table.Cell>
                            <Table.Cell>/users/:user</Table.Cell>
                            <Table.Cell>userDelete</Table.Cell>
                            <Table.Cell>users @ delete</Table.Cell>
                        </Table.Row>
                    </Table.Body>
                </Table>
            </Field>

            <Field
                name="r.semiNestedResources(name[, callback_or_options [, options]]"
                example={`r.resources('users', r => {
    r.semiNestedResources('pets')
})`}
            >
                <p>
                    This is almost the same as nesting a{' '}
                    <InlineCode>r.resources()</InlineCode> call inside another{' '}
                    <InlineCode>r.resources</InlineCode>. But it will not add
                    the outer resource id onto the specific inner URLs. The
                    example will will generate these routes:
                </p>

                <Table celled>
                    <Table.Header>
                        <Table.Row>
                            <Table.HeaderCell>Method</Table.HeaderCell>
                            <Table.HeaderCell>Path</Table.HeaderCell>
                            <Table.HeaderCell>
                                Path helper function
                            </Table.HeaderCell>
                            <Table.HeaderCell>
                                Controller action
                            </Table.HeaderCell>
                        </Table.Row>
                    </Table.Header>

                    <Table.Body>
                        <Table.Row>
                            <Table.Cell>get</Table.Cell>
                            <Table.Cell>/users</Table.Cell>
                            <Table.Cell>userIndex</Table.Cell>
                            <Table.Cell>users @ index</Table.Cell>
                        </Table.Row>

                        <Table.Row>
                            <Table.Cell>post</Table.Cell>
                            <Table.Cell>/users</Table.Cell>
                            <Table.Cell>userCreate</Table.Cell>
                            <Table.Cell>users @ create</Table.Cell>
                        </Table.Row>

                        <Table.Row>
                            <Table.Cell>get</Table.Cell>
                            <Table.Cell>/users/:user</Table.Cell>
                            <Table.Cell>userShow</Table.Cell>
                            <Table.Cell>users @ show</Table.Cell>
                        </Table.Row>

                        <Table.Row>
                            <Table.Cell>post</Table.Cell>
                            <Table.Cell>/users/:user</Table.Cell>
                            <Table.Cell>userUpdate</Table.Cell>
                            <Table.Cell>users @ update</Table.Cell>
                        </Table.Row>

                        <Table.Row>
                            <Table.Cell>delete</Table.Cell>
                            <Table.Cell>/users/:user</Table.Cell>
                            <Table.Cell>userDelete</Table.Cell>
                            <Table.Cell>users @ delete</Table.Cell>
                        </Table.Row>

                        <Table.Row>
                            <Table.Cell>get</Table.Cell>
                            <Table.Cell>/users/:user/pets</Table.Cell>
                            <Table.Cell>userPetIndex</Table.Cell>
                            <Table.Cell>pets @ index</Table.Cell>
                        </Table.Row>

                        <Table.Row>
                            <Table.Cell>post</Table.Cell>
                            <Table.Cell>/users/:user/pets</Table.Cell>
                            <Table.Cell>userPetCreate</Table.Cell>
                            <Table.Cell>pets @ create</Table.Cell>
                        </Table.Row>

                        <Table.Row>
                            <Table.Cell>get</Table.Cell>
                            <Table.Cell>/pets/:pet</Table.Cell>
                            <Table.Cell>petShow</Table.Cell>
                            <Table.Cell>pets @ show</Table.Cell>
                        </Table.Row>

                        <Table.Row>
                            <Table.Cell>post</Table.Cell>
                            <Table.Cell>/pets/:pet</Table.Cell>
                            <Table.Cell>petUpdate</Table.Cell>
                            <Table.Cell>pets @ update</Table.Cell>
                        </Table.Row>

                        <Table.Row>
                            <Table.Cell>delete</Table.Cell>
                            <Table.Cell>/pets/:pet</Table.Cell>
                            <Table.Cell>petDelete</Table.Cell>
                            <Table.Cell>pets @ delete</Table.Cell>
                        </Table.Row>
                    </Table.Body>
                </Table>

                <p>
                    If this were a nested <InlineCode>r.resource</InlineCode>,
                    then the show/update/delete routes would also be prefixed
                    with <InlineCode>/users/:user</InlineCode>
                </p>
            </Field>
        </Container>
    )
}
