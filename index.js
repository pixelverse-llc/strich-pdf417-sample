// import STRICH SDK as an ES6 module directly from a CDN
import {StrichSDK, BarcodeReader} from 'https://cdn.jsdelivr.net/npm/@pixelverse/strichjs-sdk@1.3.2/dist/strich.js';

function addResult(codeDetection) {
    const parsed = parse(codeDetection.data); // requires previous import of aamva
    if (!parsed) {
        console.error(`Read something that could not be parsed as AAMVA format`);
        return;
    }

    // aamva.js reports date as 'YYYYMMDD', convert it to 'YYYY-MM-DD' so it can be parsed as a Date
    const yyyymmdd = parsed.birthday; // YYYYMMDD
    const jsDateStr = yyyymmdd.slice(0, 4) + '-' + yyyymmdd.slice(4, 6) + '-' + yyyymmdd.slice(6, 8);
    const date = new Date(jsDateStr);
    const age = new Date().getFullYear() - date.getFullYear();

    // depending on age, show success or reject popup
    const dialog = document.getElementById(age < 21 ? 'reject' : 'success');
    dialog.getElementsByClassName('popup-name')[0].innerText = parsed.name.first + ' ' + parsed.name.last;
    dialog.getElementsByClassName('popup-age')[0].innerText = age + ' yrs old';
    dialog.showModal();
}

// Initialize BarcodeReader with appropriate settings for PDF417
function initializeBarcodeReader() {
    let configuration = {
        selector: '.container',
        engine: {
            symbologies: ['pdf417']
        },
        locator: {
            regionOfInterest: {
                // PDF417 is typically a wide rectangle, size the ROI appropriately
                left: 0.05, right: 0.05, top: 0.3, bottom: 0.3
            }
        },
        frameSource: {
            // high resolution recommended for PDF417
            resolution: 'full-hd'
        },
    };
    new BarcodeReader(configuration).initialize()
        .then(barcodeReader => {

            // store the BarcodeReader in a global, to be able to access it later (e.g. to destroy it)
            window['barcodeReader'] = barcodeReader;
            barcodeReader.detected = (detections) => {
                addResult(detections[0]);
            };
            barcodeReader.start().then(() => {
                console.log('BarcodeReader.start() succeeded');
            }).catch(err => {
                console.error('BarcodeReader.start() failed', err);
            });
        })
        .catch(error => {
            console.error('Initialization error', error);
        });
}

// initialize STRICH SDK with a valid license key
const licenseKey = '<your-license-key-here>';
StrichSDK.initialize(licenseKey)
    .then(() => {
        console.log('SDK initialized successfully');
        initializeBarcodeReader();
    })
    .catch(err => {
        window.alert('SDK failed to initialize: ' + err);
    });
