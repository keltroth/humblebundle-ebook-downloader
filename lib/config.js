const fs = require('fs');
const path = require('path');
const os = require('os')

const configPath = path.resolve(os.homedir(), '.humblebundle_downloader.json')
let config = require(configPath);

const save = async function () {
    fs.writeFileSync(configPath, JSON.stringify(config, null, 0), 'utf8');
}

const load = () => {
    return config;
};

module.exports = {
    save,
    load
};
