import Test from './Test.mjs';

export default class Suite {

  constructor(options = {}) {
    const { name, timeout, parent, only, skip } = options;

    const tests = [];
    this._Suite = {
      name,
      only,
      skip,
      tests,
      parent,
      timeout
    };
  }

  createChildSuite(opt = {}) {
    const parent = this;
    return new Suite({ parent, ...opt });
  }

  get(propertyName, defaultValue = null) {
    const dataMap = this._Suite;
    const { parent } = dataMap;
    const value = dataMap[propertyName];
    return typeof value !== 'undefined' ? value : (parent ? parent.get(propertyName) : defaultValue);
  }

  path() {
    let current = this;
    const names = [];
    while(current) {
      const { name, parent } = current._Suite;
      if(name) {
        names.push(name);
      }
      current = parent;
    }
    return names.reverse();
  }


  _createContext() {
    const dataMap = this._Suite;
    const timeout = ms => dataMap.timeout = ms;
    const skip = () => dataMap.skip = true;

    return {
      skip,
      timeout
    };
  }

  createTest(opt = {}) {
    const only = this.get('only');
    const skip = this.get('skip');
    const suite = this;
    const base = { only, skip, suite };
    return new Test({ ...base, ...opt });
  }

  eval(cb) {
    cb.call(this._createContext());
  }

}