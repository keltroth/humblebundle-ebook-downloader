

const SUPPORTED_FORMATS = ['epub', 'mobi', 'pdf', 'pdf_hd', 'cbz'];

function normalizeFormat (format) {
    switch (format.toLowerCase()) {
        case '.cbz':
            return 'cbz'
        case 'pdf (hq)':
        case 'pdf (hd)':
            return 'pdf_hd'
        case 'download':
            return 'pdf'
        default:
            return format.toLowerCase()
    }
};

const getEbooks = (bundles) => {

};

module.exports = {
    getEbooks,
};
