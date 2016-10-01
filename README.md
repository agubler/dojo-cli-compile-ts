# dojo-cli-compile-ts

The `compile ts` command for the `dojo cli`.

## Features

Will compile a package as per the dojo2 `dev` and `dist` configurations

## How do I use this package?

- Install globally alongside `dojo cli`

```shell
npm install dojo-cli-compile-ts
```

Run with the following command from within the project directory that needs to be compiled.

```shell
dojo compile [ts] -t ['dev'|'dist']
```

## How do I contribute?

We appreciate your interest!  Please see the [Dojo 2 Meta Repository](https://github.com/dojo/meta#readme) for the
Contributing Guidelines and Style Guide.

## Testing

Test cases MUST be written using [Intern](https://theintern.github.io) using the Object test interface and Assert assertion interface.

90% branch coverage MUST be provided for all code submitted to this repository, as reported by istanbul’s combined coverage results for all supported platforms.

To test locally run:

`npm install`
`grunt test`

## Licensing information

([New BSD](http://opensource.org/licenses/BSD-3-Clause))

© 2004–2016 Dojo Foundation & contributors. [New BSD](http://opensource.org/licenses/BSD-3-Clause) license.
