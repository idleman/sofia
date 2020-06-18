import DefaultReporter from './DefaultReporter.mjs';
import Runner from './Runner.mjs';

export default class Sofia {

  constructor(opt = {}) {
    const files = [];

    this._Sofia = {
      files
    };
  }

  addFile(file) {
    this._Sofia.files.push(file);
    return this;
  }

  async run(options = {}) {
    try {
      const { files } = this._Sofia;
      const runner = new Runner({ files });
      const reporter = new DefaultReporter();
      await runner.run(reporter);
    } catch(err) {
      console.error(err);
      process.exit(1);
    }
  }

};