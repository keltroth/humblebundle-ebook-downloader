const config = require('./config');
const configData = config.load();
const packageInfo = require('../package.json');
const util = require('util');
const fetch = require('node-fetch');
const colors = require('colors');
const sanitizeFilename = require('sanitize-filename')

var debug = require('debug')('humblebundle:bundle');

const urlApi= 'https://www.humblebundle.com/api/v1/user/order';
const urlOrder = 'https://www.humblebundle.com/api/v1/order/';

const userAgent = util.format('Humblebundle-Ebook-Downloader/%s', packageInfo.version);

const fetchOrders = async () => {

    const headers = getRequestHeaders(configData.session);
    const response = await fetch(urlApi, {headers});

    const data = await response.json();

    if (!configData.bundle) {
        configData.bundle = [];
    }

    const total = data.length;
    let done = 0;

    for (const order of data) {
        done++;
        if (configData.bundle.filter(b=>b.gamekey === order.gamekey).length === 0) {
            const gameData = await fetchOrderInfo(order.gamekey);
            debug(gameData.product.human_name);
            configData.bundle.push(gameData);
            process.stdout.write(`Fetched bundle information... (${colors.yellow(done)}/${colors.red(total)})\r`)
            await config.save();
        }
    }


};

const fetchOrderInfo = async (key) => {
    const url = urlOrder + key;
    const headers = getRequestHeaders(configData.session);
    const response = await fetch(url, {headers});
    return await response.json();
};

const getInfo = (key) => {
    if (!!key) {
        return configData.bundle.filter(b => b.gamekey === key);
    } else {
        return configData.bundle;
    }

};

const getRequestHeaders = (session) => {
    return {
        'Accept': 'application/json',
        'Accept-Charset': 'utf-8',
        'User-Agent': userAgent,
        'Cookie': '_simpleauth_sess=' + session + ';'
    }
};

const hasDownloads = (bundleInfo) => {
    return (!!bundleInfo.subproducts && bundleInfo.subproducts.length > 0 && bundleInfo.subproducts[0].downloads.length > 0);
}

const getDownloads = async (bundleInfo) => {

    // reload fresh data
    bundleInfo = await fetchOrderInfo(bundleInfo.gamekey);

    //bundleInfo.subproducts[0].downloads[0].download_struct[0].url.web
    const result = [];
    if (hasDownloads(bundleInfo)) {
        for (let subproduct of bundleInfo.subproducts) {
            for (let download of subproduct.downloads) {
                for (let download_struct of download.download_struct) {
                    if (!!download_struct.url) {

                        const downloadResult = {
                            bundle: sanitizeFilename(bundleInfo.product.human_name),
                            human_name: sanitizeFilename(subproduct.human_name),
                            platform: download.platform,
                            type: download_struct.name,
                            url: download_struct.url.web,
                        };
                        downloadResult.path = getDownloadPath(downloadResult);
                        result.push(downloadResult);
                    }
                }
            }
        }
    }
    return result;
};

const getDownloadPath = (download) => {
    return `${download.bundle}/${download.human_name}_${download.platform}.${download.type.toLowerCase()}`;
}

const filterPlatform = (platform) => {
    if (!platform) return configData.bundle;

    
    for (const bundle of configData.bundle) {

    }
};



module.exports = {
    fetchOrders,
    getInfo,
    hasDownloads,
    getDownloads,
    filterPlatform
};
