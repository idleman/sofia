class TimeoutError {}
const createTimeoutErrorPromise = ms => new Promise((r, reject) => setTimeout(reject.bind(null, TimeoutError), ms));

const getTime = () => (new Date()).getTime();

export default class Test {

  constructor(options = {}) {
    const { name, skip, only, timeout = 2000, suite, cb } = options;

    this._Test = {
      cb,
      only,
      skip,
      name,
      suite,
      timeout
    };
  }


  _createContext() {
    const dataMap = this._Test;
    const timeout = ms => dataMap.timeout = ms;
    const skip = () => dataMap.skip = true;

    return {
      skip,
      timeout
    };
  }

  only() {
    return this._Test.only;
  }

  skip() {
    return this._Test.skip;
  }


  _run(cb) {
    const context = this._createContext();

    if(cb.length) {
      const doNothing = () => null;
      let [resolve, reject] = [doNothing, doNothing];
      let promise = new Promise((_resolve, _reject) => [resolve, reject] = [_resolve, _reject]);
      const done = (err) => {
        promise = null;
        return err ? reject(err) : resolve();
      };
      cb.call(context, done); // if "done" is called, will no Promise be created and therefor no extra delay.
      return promise;
    }

    return cb.call(context);
  }

  async _runOLD(cb) {
    const context = this._createContext();
    const waitFor = (cb.length ?
      new Promise((resolve, reject) => cb.call(context, (err => err ? reject(err) : resolve())))
      :
      (async () => { await cb.call(context); })());

    return await waitFor;
  }


  async run(reporter) {
    const dataMap = this._Test;
    const { cb, name, suite } = dataMap;
    const path = suite.path();

    if(dataMap.skip) {
      reporter.pending({ name, path });
      return { pending: true };
    }


    let timeout = null;
    try {
      const start = getTime();
      const returnValue = this._run(cb);

      if(dataMap.skip) {
        reporter.pending({ name, path });
        return { pending: true };
      }
      timeout = dataMap.timeout;

      if(returnValue && typeof returnValue === 'object') {
        const raceFor = [returnValue];
        if(0 < timeout) {
          raceFor.push(createTimeoutErrorPromise(timeout));
        }
        await Promise.race(raceFor);
      }
      const end = getTime();
      const time = end - start;

      if(timeout < time) {
        throw TimeoutError;
      }

      reporter.pass({ name, path, time });
      return { pass: time };
    } catch(error) {
      if(error === TimeoutError) {
        reporter.timeout({ name, timeout, path });
        return { timeout };
      }
      reporter.fail({ name, error, path });
      return { error };
    }
  }

}