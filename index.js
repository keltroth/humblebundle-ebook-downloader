const auth = require("./lib/auth");
const config = require('./lib/config');
const bundle = require('./lib/bundle');
const colors = require('colors');
const inquirer = require('inquirer');
const path = require('path');
const downloader = require('./lib/downloader');

let options = {};


const run = async function (args) {

    let configData = config.load();

    if (!configData) {
        configData = await auth.authenticate();
        await config.save();
    }
    await config.save();

    await bundle.fetchOrders();

    let bundles = bundle.filterPlatform(options.platform);

    if (!checkArgs(args)) {
        showHelp();
        return;
    }

    return;

    if (args[0] === '--all') {
        bundles = bundle.getInfo().filter(b => b.product.category === 'bundle');
        const d  = await getDownloads(bundles);
        for (const downloadInfo of d) {
            downloader.download(downloadInfo);
        }
    } else if (args[0] === '--listkeys') {
        bundles = bundle.getInfo();
        showKeys(bundles);
    } else if (args[0] === '--list') {
        bundles = await displayOrders(bundle.getInfo());
        const d  = await getDownloads(bundles);
        for (const downloadInfo of d) {
            downloader.download(downloadInfo);
        }
    } else if (args[0] === '--platform') {
        for (let platform of args.slice(1)) {
            try {
                bundles = bundle.getInfo().filter(b=> {
                    for (const sub of b.subproducts) {
                        for (const d of sub.downloads) {
                            if (d.platform === platform) {
                                return true;
                            }
                        }
                    }
                    return false;
                });
                console.log(JSON.stringify(bundles, null, 4));
            } catch (ignored) {}
        }
    } else if (args[0] === '--key') {
        for (let key of args.slice(1)) {
            try {
                bundles.push(bundle.getInfo(key)[0]);
            } catch (ignored) {}
        }
        bundles = bundles.filter(b => b);
        if (bundles.length > 0) {
            const d  = await getDownloads(bundles);
            for (const downloadInfo of d) {
                await downloader.download(downloadInfo);
            }
        } else {
            console.log(colors.red(`No downloads found for keys : ${args.slice(1)}`))
        }
    }

};

const getDownloads = async (bundles) => {
    let downloads = [];
    for (let bundleInfo of bundles) {
        const d = await bundle.getDownloads(bundleInfo);
        downloads = downloads.concat(d);
    }
    return downloads;
};

const showKeys = (bundles) => {
    let keys = bundles.map(b => b.gamekey);
    console.log(JSON.stringify(keys));
};

const displayOrders = async (bundles) => {
    var options = [];

    for (const orderKey of Object.keys(bundles)) {
        const order = bundles[orderKey];
        options.push({name: order.product.human_name, id: orderKey});
    }

    options.sort((a, b) => {
        return a.name.localeCompare(b.name);
    })

    process.stdout.write('\x1Bc');

    const values = await inquirer.prompt({
        type: 'checkbox',
        name: 'bundle',
        message: 'Select bundles to download',
        choices: options,
        pageSize: getWindowHeight() - 2
    });

    return bundles.filter((item) => {
        return values.bundle.indexOf(item.product.human_name) !== -1
    });

};

const getWindowHeight = () => {
    var windowSize = process.stdout.getWindowSize()
    return windowSize[windowSize.length - 1]
};

const showHelp = () => {
    console.log(colors.red('No args found'));
    console.log(`${path.basename(__filename)} [--listkeys|--all|--list|--platform platform1 [platform2 ...]|--key key1 [key2 ...]]`);
};

const checkArgs = (args) => {

    let i = 0;
    while (i < args.length) {
        if (args[i].startsWith('--')) {
            const optionName = args[i].slice(2);
            if (!options[optionName]) options[optionName] = true;
            i++;
            while (args[i] && !args[i].startsWith('--')) {
                if (typeof options[optionName] !== 'object') options[optionName] = [];
                options[optionName].push(args[i]);
                i++;
            }
        }
    }
    console.log(options);
    return (args.length > 0 && (args[0] === '--list' || args[0] === '--listkeys' || args[0] === '--all' || (args[0] === '--platform' && args[1]) || (args[0] === '--key' && args[1])));
};

run(process.argv.splice(2));


