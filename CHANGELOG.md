### [2.0.3](https://github.com/vidavidorra/bunyan-pretty-stream/compare/v2.0.2...v2.0.3) (2021-08-02)

### Bug Fixes

- **deps:** update dependency chalk to v4.1.2 ([ca5784b](https://github.com/vidavidorra/bunyan-pretty-stream/commit/ca5784bb72fedef0f71f6ce4b5fc877eb849dbab))

### [2.0.2](https://github.com/vidavidorra/bunyan-pretty-stream/compare/v2.0.1...v2.0.2) (2021-07-14)

### Bug Fixes

- **deps:** update dependency joi to v17.4.1 ([97ba6a4](https://github.com/vidavidorra/bunyan-pretty-stream/commit/97ba6a4ed6cdda7d9733ec4885b6273762b34dad))

### [2.0.1](https://github.com/vidavidorra/bunyan-pretty-stream/compare/v2.0.0...v2.0.1) (2021-05-23)

### Tests

- **logger:** use `@sindresorhus/is` in the test ([674f335](https://github.com/vidavidorra/bunyan-pretty-stream/commit/674f3351464587a69d8ee0476c9ed8b1b8f5251b))

### Code Refactoring

- **helpers:** add Joi to helpers and extend the Joi interface with the `isValid` function ([8c87222](https://github.com/vidavidorra/bunyan-pretty-stream/commit/8c8722279a747048dc7b59a2928b145dc710a124))

## [2.0.0](https://github.com/vidavidorra/bunyan-pretty-stream/compare/v1.0.7...v2.0.0) (2021-05-23)

### ⚠ BREAKING CHANGES

- **options:** narrow `time.type` to `short`, `long` or `format`
- **options:** restrict `jsonIndent` to be an integer number of minimum zero
- **options:** restrict `indent` to be an integer number of minimum zero
- **options:** dissalow empty value for `extrasKey`
- **options:** narrow `newLineCharacter` to `\r`, `\n` or `\r\n`

### Bug Fixes

- **options:** dissalow empty value for `extrasKey` ([7b42aed](https://github.com/vidavidorra/bunyan-pretty-stream/commit/7b42aed724e9f0f7afa3ba39e449797b829ca2d2))
- **options:** narrow `newLineCharacter` to `\r`, `\n` or `\r\n` ([f5ef9a1](https://github.com/vidavidorra/bunyan-pretty-stream/commit/f5ef9a14a2333da378b68f4e78061de31c5c858e))
- **options:** narrow `time.type` to `short`, `long` or `format` ([307d33f](https://github.com/vidavidorra/bunyan-pretty-stream/commit/307d33fb1228d41ca1696ce7976dbf2cb0a5f565))
- **options:** restrict `extrasMaxValueLength` to be a positive integer number ([1c54ae0](https://github.com/vidavidorra/bunyan-pretty-stream/commit/1c54ae03e235cd5ca125698b2ef3f63296301be2))
- **options:** restrict `indent` to be an integer number of minimum zero ([875d4de](https://github.com/vidavidorra/bunyan-pretty-stream/commit/875d4de3e3d99a212b52cd1325d1a5f2de868180))
- **options:** restrict `jsonIndent` to be an integer number of minimum zero ([f29fc38](https://github.com/vidavidorra/bunyan-pretty-stream/commit/f29fc3882dda1ffde0845ce83c28ba9c45fac9eb))

### Tests

- **options:** add unit-test for the options ([844c050](https://github.com/vidavidorra/bunyan-pretty-stream/commit/844c0500ed35635b899cb6391e82f4aafec08d7d))

### [1.0.7](https://github.com/vidavidorra/bunyan-pretty-stream/compare/v1.0.6...v1.0.7) (2021-05-01)

### Bug Fixes

- log multiline message in the details section ([0b17e98](https://github.com/vidavidorra/bunyan-pretty-stream/commit/0b17e9888bf73bcdda44777cab64abccde69c134))

### Code Refactoring

- use @sindresorhus/is for type checking values ([8992fc9](https://github.com/vidavidorra/bunyan-pretty-stream/commit/8992fc9ae32d47710a383d0c7ede11306d040f50))

### [1.0.6](https://github.com/vidavidorra/bunyan-pretty-stream/compare/v1.0.5...v1.0.6) (2021-04-24)

### Bug Fixes

- **deps:** update dependency chalk to v4.1.1 ([1009461](https://github.com/vidavidorra/bunyan-pretty-stream/commit/1009461de28fdeffcb88157d10abd0518f453b92))

### [1.0.5](https://github.com/vidavidorra/bunyan-pretty-stream/compare/v1.0.4...v1.0.5) (2021-03-10)

### Bug Fixes

- sanitise date before formatting the record ([f7a33d2](https://github.com/vidavidorra/bunyan-pretty-stream/commit/f7a33d2c6cbba81319b6b6b673605140bbe6a729)), closes [#8](https://github.com/vidavidorra/bunyan-pretty-stream/issues/8)

### [1.0.4](https://github.com/vidavidorra/bunyan-pretty-stream/compare/v1.0.3...v1.0.4) (2021-02-28)

### Bug Fixes

- remove log of formatting options ([ed7b4df](https://github.com/vidavidorra/bunyan-pretty-stream/commit/ed7b4df1aa579b9a59be0368b3aba82dcf00af65))
- throw Joi validation error when options are invalid ([8657d77](https://github.com/vidavidorra/bunyan-pretty-stream/commit/8657d77a076805cae19c778d73f7e2ddc321ce05))

### [1.0.3](https://github.com/vidavidorra/bunyan-pretty-stream/compare/v1.0.2...v1.0.3) (2021-02-23)

### Tests

- add tests for `bunyan-record` ([88ffaa3](https://github.com/vidavidorra/bunyan-pretty-stream/commit/88ffaa3fb838436228a20e65bd2a4e5140b62acf))

### [1.0.2](https://github.com/vidavidorra/bunyan-pretty-stream/compare/v1.0.1...v1.0.2) (2021-02-22)

### Bug Fixes

- **deps:** add missing `chalk` dependency ([8786e9e](https://github.com/vidavidorra/bunyan-pretty-stream/commit/8786e9e8fa23545599fa7ea59dd4b400d8d18393))

### Continuous Integration

- add tarball to the GitHub release ([62f0efd](https://github.com/vidavidorra/bunyan-pretty-stream/commit/62f0efd386b3ab0c1b2ffd264f2b57b773e736d8))

### [1.0.1](https://github.com/vidavidorra/bunyan-pretty-stream/compare/v1.0.0...v1.0.1) (2021-02-21)

### Continuous Integration

- trigger npm release ([5b01667](https://github.com/vidavidorra/bunyan-pretty-stream/commit/5b01667805953aa46d8f62b7e7c4aaf5b46888a3))

## 1.0.0 (2021-02-21)

### Features

- add initial source code ([49ab06c](https://github.com/vidavidorra/bunyan-pretty-stream/commit/49ab06ca2d994d47177b633597519ea586ab29c2))

### Documentation

- add code coverage badge ([4b11a97](https://github.com/vidavidorra/bunyan-pretty-stream/commit/4b11a970a420800e7c3c6d2119c66e087c258ec8))

### Continuous Integration

- add npm publish token to build workflow release ([2411a68](https://github.com/vidavidorra/bunyan-pretty-stream/commit/2411a68abdc3c3e92736d4284ccf891e49d14f2c))
