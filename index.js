// import STRICH SDK as an ES6 module directly from a CDN
import {StrichSDK, BarcodeReader} from 'https://cdn.jsdelivr.net/npm/@pixelverse/strichjs-sdk@1.3.2/dist/strich.js';

// AAMVA helper routines
import {parseAAMVALicenseData} from "./aamva.js";

function processPDF417Barcode(codeDetection) {

    // attempt to parse barcode data as AAMVA driver's license
    const parsed = parseAAMVALicenseData(codeDetection.data);
    if (!parsed) {
        console.error('PDF417 data could not be parsed according to AAMVA spec');
        return;
    }

    // calculate age from system time
    const age = new Date().getFullYear() - parsed.dateOfBirth.getFullYear();

    // depending on age, show success or reject popup
    const dialog = document.getElementById(age < 21 ? 'failure' : 'success');
    dialog.getElementsByClassName('popup-name')[0].innerText = parsed.firstName + ' ' + parsed.lastName;
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
                processPDF417Barcode(detections[0]);
            };
            return barcodeReader.start();
        })
        .catch(error => {
            // See: https://docs.strich.io/reference/classes/SdkError.html
            window.alert(error.localizedMessage);
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
