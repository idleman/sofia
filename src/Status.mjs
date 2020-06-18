const getCurrentTimestamp = () => (new Date()).getTime();
export default class Status {

  constructor(opt = {}) {
    const now = getCurrentTimestamp();
    const { start = now, end = now, pass = 0, pending = 0, fail = 0, files = 0 } = opt;
    const date = (new Date(start)).toISOString();
    const time = (end - start);
    const total = pass + pending + fail;
    this._Status = {
      date,
      time,
      total,
      pass,
      fail,
      files,
      pending
    };
  }

  get date() {
    return this._Status.date;
  }

  get time() {
    return this._Status.time;
  }

  get total() {
    return this._Status.total;
  }

  get pass() {
    return this._Status.pass;
  }

  get fail() {
    return this._Status.fail;
  }

  get files() {
    return this._Status.files;
  }

  get pending() {
    return this._Status.pending;
  }

}