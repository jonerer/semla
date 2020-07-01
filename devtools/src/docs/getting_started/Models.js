import { Container } from 'semantic-ui-react'
import React from 'react'
import MainTitle from '../../shared/MainTitle'
import Code from '../../shared/Code'
import InlineCode from '../../shared/InlineCode'
import SectionTitle from '../../shared/SectionTitle'
import { Link } from 'react-router-dom'

export default () => {
    return (
        <Container>
            <MainTitle>Models</MainTitle>
            <p>
                Models contain most of the data in your application. Every model
                corresponds to a database table. They also correspond to each
                logical entity your domain includes (and the connections between
                them).
            </p>
            <p>
                For instance, if you have a site where users can join teams, you
                will have at least *three* models: User, Membership and Team.
                Models know how they are related to other entities in your
                system. They also know how to self-validate.
            </p>

            <SectionTitle>Example</SectionTitle>
            {/* prettier-ignore */}
            <Code content={`class Cat extends BaseModel {
    static setup(m) {
        m.hasMany('users')
        m.fillable(['name', 'color'])

        m.validate(v => {
            v.present(['name', 'color'])
            v.custom(this.maxTwoOwners, {
                creation: false,
            })
        })
    }

    async maxTwoOwners() {
        const owners = await this.users
        return owners.length <= 2
    }
}`} />
            <p>
                This model represents a cat. It uses the special
                <InlineCode>static setup(m)</InlineCode> method to populate it's
                configuration. The <InlineCode>m</InlineCode> parameter to setup
                is an instance of <InlineCode>SetupCollector</InlineCode>. It
                gathers information about your model.
                <Link to="/advanced/setup_collector">here</Link> to read mor
            </p>

            <p>
                We set up a relation to the model called{' '}
                <InlineCode>User</InlineCode>, whose data is in the{' '}
                <InlineCode>users</InlineCode> table (which is assumed to have a{' '}
                <InlineCode>cat_id</InlineCode> attribute). In the end it simply
                means instances of <InlineCode>Cat</InlineCode> will get a
                "users" attribute. You can <InlineCode>await</InlineCode> it to
                get the attached users.
                <Link to="/getting_started/relations">here</Link> to read more
            </p>

            <p>Next, we set two // todo ta bort fillable?</p>

            <p>
                Next, we add some validations. In this case, we apply the
                built-in <InlineCode>present</InlineCode> validation on two
                fields. This means we won't be able to save the model (it will
                throw) unless both fields have a non-falsy value. We also set up
                a custom validation, executed by the{' '}
                <InlineCode>async maxTwoOwners()</InlineCode> method. Note that
                this validation will only be checked on object updates, not on
                initial creation. Go{' '}
                <Link to="/getting_started/validations">here</Link> to read more
            </p>
        </Container>
    )
}
