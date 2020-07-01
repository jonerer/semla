import { Container } from 'semantic-ui-react'
import React from 'react'
import MainTitle from '../../shared/MainTitle'
import Code from '../../shared/Code'
import InlineCode from '../../shared/InlineCode'
import Field from '../../shared/Field'

export default () => {
    return (
        <Container>
            <MainTitle>Templates</MainTitle>
            <p>
                Semla aims to provide full-featured templates. In theory you
                could skip the whole concept of controllers, and just write your
                business logic in templates. That would be silly of course. But
                we believe it's also important to have the power to be able to
                express yourself freely in the templating layer, and not limit
                yourself to "logic-less templates" or similar ideas.
            </p>
            <h2>Full featured example</h2>
            <Code
                content={`
/@
function fibonacci(num) {
    if (num <= 1) return 1;
    
    return fibonacci(num - 1) + fibonacci(num - 2);
}

function promiser() {
    return new Promise(resolve => {
        // for fun, return something from the params
        resolve(ctx.params['qryVar'])
    })
}
@/

<div id="fiboutput">{{ fibonacci(5) }}</div>
<div id="promiseoutput">{{ promiser() }}</div>

@const items = ['one', 'two', 'three']
@for (const item of items)
    This item in the loop: {item}
@end
            `}
            ></Code>

            <h2>Expressions</h2>

            <p>
                Everything that returns a value that you want to show in your
                template is an expression. By default, you create statements
                using <InlineCode>{'{{'}</InlineCode> and{' '}
                <InlineCode>{'}}'}</InlineCode>. For instance, if you want to
                print the local variable "thing", you would write{' '}
                <InlineCode content="{{ l.thing }}"></InlineCode>.
            </p>

            <p>
                The template compiler will turn this into{' '}
                <InlineCode content="    result += await output(l.thing)"></InlineCode>
                . <InlineCode>await</InlineCode> is there just in case you feed
                it a promise. <InlineCode>output</InlineCode> is the function
                doing html escaping.
            </p>

            <h2>Statements</h2>

            <p>
                You use statements to control the flow of the template
                execution. Basically, anything that doesn't return a value is a
                statement. You can use any statement that you could in normal
                javascript, including <InlineCode>await import()</InlineCode>{' '}
                and <InlineCode content="function decl() { ... }"></InlineCode>
            </p>

            <p>
                By default, statements are opened with{' '}
                <InlineCode content="@"></InlineCode> and ended with a newline.
                If you want a multi line statement ("statement block"), you can
                open it with <InlineCode content="/@"></InlineCode> and end with{' '}
                <InlineCode content="@/"></InlineCode>
            </p>

            <p>
                Some transformations are applied for convenience. If you use a
                control flow statement like <InlineCode>if</InlineCode> or{' '}
                <InlineCode>for</InlineCode>, you can omit the opening bracket{' '}
                <InlineCode content="{"></InlineCode>. It will be added
                automatically. We have also added an{' '}
                <InlineCode>end</InlineCode> keyword.
            </p>
            <p>
                Meaning
                <Code
                    content={`@if (l.var === 5) {
    Yup!
@} else {
    Nope!
@}`}
                ></Code>
                is equivalent to
                <Code
                    content={`@if (l.var === 5)
    Yup!
@else
    Nope!
@end`}
                ></Code>
            </p>

            <h2>Usage in controllers</h2>

            <p>
                Although it could be used for antyhing, the primary usage of the
                template engine is for rendering HTML responses from your
                controllers. Here is a minimal example:
            </p>

            <Code
                name="controllers/ExampleController.js"
                content={`class UsersController extends BaseController {
    async show(user) {
        return this.render('users.show', {
            user,
        })
    })`}
            ></Code>

            <Code
                name="views/users/show.tmp"
                content={`<div>
    Welcome to the page for user {{ l.user.name }}!
</div>

<div>
    You reached this page on the path {{ ctx.req.path }}
</div>
    `}
            ></Code>

            <p>
                Note the l in{' '}
                <InlineCode content={'{{ l.user.name }}'}></InlineCode>. This is
                because there are three variables (other than the global
                variables) that you can access from templates:{' '}
                <InlineCode content="l"></InlineCode>,{' '}
                <InlineCode content="ctx"></InlineCode> and{' '}
                <InlineCode content="h"></InlineCode>. Those are "local
                variables", "the (request) context" and "helpers", respectively.
            </p>

            <h2>Helpers</h2>

            <p>
                <Field
                    name="h.partial(name[, locals])"
                    example={() => {
                        return (
                            <>
                                <Code
                                    content={`@const users = await User.all()
<h3>All users:</h3>
@for (const user of users)
    {{ h.partial('user.one', { user }) }}
@end}`}
                                    name="listing.tmp"
                                />
                                <Code
                                    content={`
<div class="user_one">
User name: {{ user.name }}.
Followers: {{ user.numFollowers() }}
</div>`}
                                    name="listing.tmp"
                                />
                            </>
                        )
                    }}
                >
                    A partial is another template, rendered and inserted into
                    the calling template. The child template will be able to
                    access the context via <InlineCode>ctx</InlineCode> just
                    like the parent template. The{' '}
                    <InlineCode>locals</InlineCode> of the included template
                    will be a merge of the parent locals and the locals supplied
                    as argument.
                </Field>
            </p>
        </Container>
    )
}
