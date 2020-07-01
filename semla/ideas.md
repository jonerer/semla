
virtues

## Show 'em how it's done

Sometimes framework authors hear "this framework has too much magic!". This frustrates some people, because they know there's no magic, just code.

One of the best science fiction authors, Arthur C. Clarke famously said:

"Any sufficiently advanced technology is indistinguishable from magic."

I think it's important to avoid this feeling of magic, to make sure people feel empowered to accomplish great things.
For that, there are two parts:

- Make the API clear. The user should be able to read and understand how things fit together
- Make education around the framework very good

The first part doesn't have a clear answer as to how exactly we can implement it. But here is an example:

Let's take the migration code as an example. We could have designed it like this:

```javascript
import { text, table, timestamps } from '...'

function change() {
    table('users', () => {
        text('name')
        text('email')
        timestamps()
    )
}
```

Or like this:

```javascript
function change(m) {
    m.addTable('users', table => {
        t.text('name')
        t.text('email')
        t.timestamps()
    })
}
```

The difference might seem small, but I think it's important. 
In the first case, where everything is global, you might wonder what functions exist? How does "table()" get registered into something? How does "timestamps()" end up on the 'users' table?

In the second case, finding out what other functions exist is easy: just put a breakpoint and see what methods "m" and "t" have. Or go to the docs, look at the migration page and learn that t is a "table helper" and m is the "migration helper". Then you can see what methods those two have. It's also obvious to see how the information is collected

As for education, there are three parts:

- Examples in the documentation
- Code generators
- Clearly showing all the globals generated, all the routes set up etc

## If it's not fun, why bother?

<insert gif of reggie>

Development should be fun. It can be fun, and it can also be a chore. Exactly what makes development is fun is hard to say, but one important act is the feeling of empowerment. The feeling that just a few keystrokes can create something cool.

For that sake, we try to help you type as little as possible, and to have to repeat yourself as little as possible.

## Declarative is usually better than imperative

Whenever we can, we should let you explain what you want in a declarative way, rather than an imperative way.

## Development speed is essential


