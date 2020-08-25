const util = require('util');
const fs = require('fs');
const path = require('path');
const streamPipeline = util.promisify(require('stream').pipeline);
const fetch = require('node-fetch');
const colors = require('colors');

const options = {
  downloadDir: 'downloads',
};


const download = async (downloadInfos) => {

  const url = downloadInfos.url;
  const downloadPath = downloadInfos.path;

  const completePath = options.downloadDir + path.sep + downloadPath;

  if (!url || !downloadPath) return;

  fs.mkdirSync(path.dirname(completePath), {recursive: true});

  if (fs.existsSync(completePath)) {
    console.log(colors.yellow(`Ignoring ${downloadInfos.human_name} (${downloadInfos.type})`))
    return;
  }

  console.log(colors.green(`Downloading ${downloadInfos.human_name} (${downloadInfos.type})`))
  const res = await fetch(url);
  if (!res.ok) {
    console.log(res);
    throw new Error(`unexpected response ${res.statusText}`);
  }

  await streamPipeline(res.body, fs.createWriteStream(completePath));

};

const init = (opts) => {
  options.downloadDir = opts.downloadDir;
};


module.exports = {
  download,
  init
};
