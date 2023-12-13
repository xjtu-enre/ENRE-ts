# ENRE-ts

[![npm version](https://badge.fury.io/js/@enre-ts%2Fcli.svg)](https://badge.fury.io/js/@enre-ts%2Fcli)

> **EN**tity **R**elationship **E**xtractor for ECMAScript and TypeScript based on
> @babel/parser.

By doing static code analysis, ENRE-ts extracts entities and relations between them (aka
**code dependencies**), to help developers have a better and clearer view of understanding
on code repos they are dealing with.

## Features

* 📃 Conform to the latest ECMAScript/TypeScript and Node.js specification

* 📦 Out-of-the-box support for monorepo projects

* 🫣 Support [implicit relation](docs/implicit) analysis

* 📐 Highly standardized, documentations are comprehensive and publicly available

* 🔌 Supports multiple usage patterns, including CLI and programmatic interfaces

## Supported Language

|  Language  | Maximum Version |
|:----------:|:---------------:|
| ECMAScript |      2023       |
| TypeScript |       5.0       |
|    JSX     |        -        |
|  HTML/CSS  |  Not Supported  |

## Getting Started

### Pre-request

| Dependency | Version | Note                 |
|:----------:|:-------:|----------------------|
|  Node.js   |  16~18  | Does not support 19+ |

### `npm` packages

* For command line use, run the following command to install ENRE-ts as a npm global
  package.

    ```shell
    $ npm install -g @enre-ts/cli
    ```

  Then run `@enre-ts/cli` or `npx @enre-ts/cli` to access command line usage.


* For embedding ENRE-ts into your application through programmatic interfaces, in
  application's directory, run:

    ```shell
    $ npm install @enre-ts/core @enre-ts/data @enre-ts/naming @enre-ts/location
    ```

  to install all dependencies that you would probably use.

  Then use following imports (ESM style) to gain access to core functionalities and
  containers:

    ```js
    // Entity container and relation container respectively
    import {eGraph, rGraph} from '@enre-ts/data';
    // Core analyze interface
    import usingCore from '@enre-ts/core';
    ```

### Source code usage

```shell
$ git clone https://github.com/xjtu-enre/ENRE-ts.git --depth=1
$ cd ENRE-ts
$ npm install & npm run build
$ node --experimental-specifier-resolution=node packages/enre-cli/lib/index.js <...options>
```

### Single bundled file

From assets of the latest [release](https://github.com/xjtu-enre/ENRE-ts/releases),
download the file named with `enre-ts-x.x.x.js`, then run it with the following command:

```shell
$ node enre-ts-x.x.x.js
```

## Usage

Append `-h` or `--help` without any other arguments to see list of options:

```text
Usage: enre-ts [options]

A static source code entity relationship extractor for ECMAScript and TypeScript.

Options:
  -V, --version                   output the version number
  -i, --input <path>              specify the path to a file or directory (default: ".")
  -o, --output <file path>/false  specify where to output the Analyze results
                                  use extension '.json' (default) or '.lsif' to specify format (default: "./output.json")
  -e, --exclude <name...>         specify file or directory name to be excluded from analysis
  -v, --verbose                   enable to print more message while processing (default: false)
  -h, --help                      display help for command
```

### Examples

* Analyze files under a given directory (and output results in current working directory)

```shell
$ node enre-ts.js -i path/to/directory
```

* Analyze a file and output results in JSON format in the given directory/file

```shell
$ node enre-ts.js -i path/to/file.js -o path/to/output/result.json
```

<!--
* Analyze files under a directory and output
  in [LSIF](https://microsoft.github.io/language-server-protocol/) format

```shell
$ node enre-ts.js -i path/to/directory -o path/to/output/result.lsif
```
-->

* Analyze files under a given directory and enable verbose logging

```shell
$ node enre-ts.js -i path/to/directory -v
```

## Documentation

Specifications on which kinds of entities and relations can be captured and any other
details can be found
in [docs](docs/README.md).

## Building

After cloning this repository, run `npm install` to install all dependencies.

* For developing functionalities, run `npm start`
* For writing documents and testing, run `npm pretest`
  and `npm test` (append `-- (options)` to `pretest` to specify test range)
* For publishing bundled file, run `npm run bundle:core`
* For publishing prebuilt executable,
  run `npm run bundle:core:xxx`
* For update all dependencies, install `npm-check-update`
  through `npm i npm-check-update -g`, check updates `ncu --deep`, apply
  updates `ncu --deep -u`, and install updates `npm i`.

## References

1. https://github.com/jamiebuilds/babel-handbook/blob/master/translations/en/plugin-handbook.md
