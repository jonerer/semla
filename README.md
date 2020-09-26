# semla
Semla is a server-side Node.js web framework.

## Features
 - Ergonomic and typesafe ORM (including migrations)
 - Powerful templating
 - Start off with javascript, add typescript as you choose
 - Built-in devtools

## Raison d'être
Semla is an exploration into how ergonomic and powerful you could make an integrated
omakase-style javascript server-side framework.

We optimize for developer happiness. Happiness of course subjective; this is commonly
understood in semla as "DRY", "keep magic to a minimum" and "provide a fast
development speed".

### ORM
In Semla, the central source of truth is your SQL database, and is where you will
design your domain. Great care has been put into making things like querying and
relationships as fluent as possible.

Semla has a migrations system that helps you move your database state between versions.
On startup, semla will read the database to generate the model; meaning it's "Database
first", *not* "Code-first". You don't have to tell semla how your database looks; it'll
find out. As for typescript, this means runtime typings generation.

### Templating
Semla features a powerful templating engine. It's basically HTML with the ability to
write javascript expressions and statements, without any requirements to stay "logic-
less", and with full extensibility and async/await-ability. It also adds some
QOL features like integrated LiveReload.

### Serializers
Semla also has a serializer layer to simplify serializing your models into JSON
responses.

### Routing
Semla builds on express.js, but adds some goodies for routing. Mainly to decrease
typing and increase maintainability. It adds a controller layer to keep concerns
common to specific domain objects together. Some QOL improvements have been included
for instance, if you have a `User` model, then registering a `/users/:user/` path
will automatically help the controller resolve the linked User object (along with
TypeScript typings if so desired).

### Controllers
Semla makes it easy for you to write the HTTP-interface layer, the controller.
There are builtin primitives for e.g. update a model with a restricted set of
input data, setting session vars, sharing request filters logic and more

### Devtools
When you run your app in development mode, a devtools interface will be available
on `/devtools`. This replaces the CLI interface many frameworks use to e.g. generate
new models or migrations. It's also a handy reference to the documentation for the
current version.

### Typing
As your web project grows in complexity and/or team size, you might feel a need
to introduce some TypeScript typing. Since semla is a database-first framework,
typings will be automatically generated from looking the state of the database.

## Status
Semla is still under experimental development. We believe that it's in a great
state to peruse at leisure, but there is also a lot to be done before a 1.0
