Sofia - An extreme lightweight test-runner above nodejs
========================================================
As the title suggest, sofia is a lightweight test-runner that run on top of nodejs.


Features
--------

- **Performance**. The code will be run in directly on nodejs. No wrappers will be created.
- **Native**. The code you write, will be executed. You can test and use that functionallity that cannot be emulated/transpiled.


Why
---
This project were created only because most of the current ECMAScript/JavaScript test-runners create wrappers that either slow down the complete execution or transpile the code to be executed. For most projects, will it not make any difference, but sometimes it does. Hence this project were created.


Example:
-------

C
hello.test.mjs:

    `
    import { strictEqual } from 'assert';

    describe('hello', function() {

      it('should work', function() {

      });

    });
    `


CLI:

    sofia ./*.test.mjs