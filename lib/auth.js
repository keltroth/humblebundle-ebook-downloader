const Nightmare = require('nightmare');
const packageInfo = require('../package.json');
const util = require('util');
const userAgent = util.format('Humblebundle-Ebook-Downloader/%s', packageInfo.version);
const url = require('url');

let handledRedirect = false;
let nightmare;


const handleRedirect = async function (targetUrl, resolve) {
    if (handledRedirect) {
        return;
    }

    let parsedUrl = url.parse(targetUrl, true);

    if (parsedUrl.hostname !== 'www.humblebundle.com' || parsedUrl.path.indexOf('/home/library') === -1) {
        return;
    }

    handledRedirect = true;

    nightmare.cookies.get({
        secure: true,
        name: '_simpleauth_sess'
    }).then((sessionCookie) => {
        if (!sessionCookie) {
            return next(new Error('Could not get session cookie'));
        }

        nightmare._endNow();

        resolve ({
            session: sessionCookie.value,
            expirationDate: new Date(sessionCookie.expirationDate * 1000)
        });
    }).catch((error) => next(error));

};

const authenticate = function () {
    return new Promise((resolve, reject) => {
        nightmare = Nightmare({
            show: true,
            width: 1024,
            height: 768
        });

        nightmare.useragent(userAgent);

        nightmare.on('did-get-redirect-request', (event, sourceUrl, targetUrl, isMainFrame, responseCode, requestMethod) => handleRedirect(targetUrl));
        nightmare.on('will-navigate', (event, targetUrl) => handleRedirect(targetUrl, resolve));

        nightmare.goto('https://www.humblebundle.com/login?goto=%2Fhome%2Flibrary')
            .then()
            .catch((e) => reject(e));
    });
};



module.exports = {
    authenticate
};
