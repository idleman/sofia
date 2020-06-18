import Suite from './Suite.mjs';
import Status from './Status.mjs';

const getGlobalScope = (function() {
  let globalScope = null;
  return () => {
    if(!globalScope) {
      globalScope = (new Function('return this'))();
    }
    return globalScope;
  }
})();

function swap(propertyName, from, to) {
  const current = to[propertyName];
  to[propertyName] = from[propertyName];
  from[propertyName] = current;
}

function withOptionsHelpers(cb) {
  const forwarder = (...args) => cb(...args);
  forwarder.only = (...args) => {
    return forwarder(...args, 'only');
  };

  forwarder.skip = (...args) => {
    return forwarder(...args, 'skip');
  };


  return [forwarder, forwarder.skip];
}

const getTime = () => (new Date()).getTime();

export default class Runner {

  constructor(options = {}) {
    const {
      files = [],
      globalScope = getGlobalScope()
    } = options;

    this._it = this._it.bind(this);
    this._describe = this._describe.bind(this);

    const [it, xit] = withOptionsHelpers(this._it);
    const [describe, xdescribe] = withOptionsHelpers(this._describe);


    const scope = {
      it,
      xit,
      describe,
      xdescribe
    };

    const stack = [];
    const tests = [];
    const rootSuite = new Suite(); // root suite, to each shared configuration

    this._Runner = {
      tests,
      files,
      scope,
      stack,
      rootSuite,
      globalScope
    };
  }

  _describe(name, cb, option = 'default') {
    // we want to check if this describe happens within another describe
    const { stack, rootSuite } = this._Runner;
    const currentSuite = stack.length ? stack[stack.length - 1] : rootSuite;
    const nextSuite = currentSuite.createChildSuite({ name, [option]: true });
    stack.push(nextSuite);
    nextSuite.eval(cb);
    stack.pop();
  }

  _it(name, cb, option = 'default') {
    const { tests, stack, rootSuite } = this._Runner;
    const currentSuite = stack.length ? stack[stack.length - 1] : rootSuite;
    const test = currentSuite.createTest({ name, cb, [option]: true });
    tests.push(test);
  }

  _swapGlobalScope() {
    const { scope, globalScope } = this._Runner;
    Object.keys(scope).forEach(propertyName => swap(propertyName, globalScope, scope));
  }

  _getTestsToRun() {
    const { tests } = this._Runner;
    const only = tests.filter(test => test.only());
    return only.length ? only : tests;
  }

  async run(reporter) {
    this._swapGlobalScope();
    const { files } = this._Runner;
    await Promise.all(files.map(file => (async () => {
      try {
        const exports = await import(file);
        return exports;
      } catch(err) {
        const { stack } = err;
        const next = stack.split('\n');
        next.splice(1, 0, '  '.repeat(2) + 'at ' + file.substr(12));
        err.stack = next.join('\n');
        throw err;
      }
    })()));
    this._swapGlobalScope();
    const tests = this._getTestsToRun();
    await reporter.start();
    const start = getTime();

    const testResults = [];

    while(true) {
      const test = tests.shift();
      if(!test) {
        break;
      }
      const result = await test.run(reporter);
      testResults.push(result);
    }
    //const testResults = await Promise.all(tests.map(test => test.run(reporter)));
    const end = getTime();
    let [pass, pending, fail] = [0, 0 , 0];
    testResults.forEach(result => {
      if(!result) {
        return;
      }
      if(typeof result.pass !== 'undefined') {
        ++pass;
        return;
      }
      if(result.pending) {
        ++pending;
        return
      }
      ++fail;
    });

    await reporter.end(new Status({
      end,
      pass,
      fail,
      start,
      pending,
      files: files.length
    }));
  }

  status() {
    return this._Runner.status;
  }

}