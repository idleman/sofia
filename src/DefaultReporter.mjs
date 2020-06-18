export default class DefaultReporter {

  constructor(options = {} ) {
    const { stdout: defaultStdout, stderr: defaultStderr } = process;
    const { stdout = defaultStdout, stderr = defaultStderr } = options;
    const errors = [];

    this._DefaultReporter = {
      stdout,
      stderr,
      errors
    };
  }

  start() {
    this._DefaultReporter.errors = [];
  }

  handle(type = '', data = {}) {
    const { stdout, stderr, errors } = this._DefaultReporter;
    const { name, path = [] } = data;
    // const whitespace = getWhitespaceString(lastIndex);
    // const namespace = path.slice(0, -1).join('');
    const baseTitle = `${path.join(' ')}: ${name}`;
    switch(type) {
      case 'pass':
        const { time } = data;
        stdout.write(`[OK]:${baseTitle} (${time} ms)\n`);
        break;
      case 'fail': {
        const { error } = data;
        errors.push(error);
        const { message, stack = '' } = error;
        stderr.write(`[ERROR]:${baseTitle} - ${stack || message}\n`);
        break;
      }
      case 'timeout': {
        const { name, timeout, path } = data;
        const message = `${baseTitle} - Timed out after ${timeout} ms`;
        errors.push(new Error(message));
        stderr.write(`[TIMEOUT]:${message}\n`);
        break;
      }
      case 'pending':
        stderr.write(`[PENDING]:${baseTitle}\n`);
        break;
    }
  }

  pass(...args) {
    return this.handle('pass', ...args);
  }

  fail(...args) {
    return this.handle('fail', ...args);
  }

  pending(...args) {
    return this.handle('pending', ...args);
  }

  timeout(...args) {
    return this.handle('timeout', ...args);
  }

  end(status) {
    const { stdout, stderr, errors } = this._DefaultReporter;

    const { date, time, total, pass, fail, files, pending } = status;
    const report = [
      `Date:\t\t${date}`,
      `Time:\t\t${time}`,
      `Files:\t\t${files}`,
      `Pass:\t\t${pass}`,
      `Fail:\t\t${fail}`,
      `Pending:\t${pending}`,
      `Count:\t\t${total}`
    ];

    if(errors.length) {
      report.push(`\nErrors: \n`, errors.map(err => err.stack || err.message).join('\n'));
    }


    stdout.write(`\n${report.join('\n')}\n`);

    if(fail) {
      process.exit(1);
    }
  }
}