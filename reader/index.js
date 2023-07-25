require('dotenv').config();
const {Express} = require("./core/Express");
const {promisePostRequest} = require('./core/httpClient')
const noble = require('@abandonware/noble');

const EVENT_TYPE = {
    Heartrate: "HEART_RATE"
}

let discoverableDevices = [];
let listenablePeripherals = [];
let listeningPeripherals = [];

initBluetooth();
listenHeartrateEvents();

const express = new Express(process.env.PORT_READER, "Reader")
express.get('/', (_, res) => {
    res.send('Service is alive')
});

express.post('/register', (req, res) => {
    let device = req.body.device;
    let serialNumber = req.body.serialNumber;
    let deviceType = req.body.deviceType;

    if (device) {
        console.log("New device received: " + device);
        discoverableDevices.push(device);
        let body = {
            token: process.env.API_TOKEN_MANAGER,
            device: device,
            type: deviceType,
            serialNumber: serialNumber,
            creationDatetime: new Date().getTime()
        };

        promisePostRequest(process.env.INTERNAL_URL_MANAGER_REGISTER_DEVICE, body);

        res.status(200).send("Successfully registered");

    } else {
        res.status(403).send("Bad request");
    }
});

async function initBluetooth() {
    noble.on('stateChange', async (state) => {
        if (state === 'poweredOn') {
            await noble.startScanningAsync([], true);
        }
    });

    noble.on('discover', async (peripheral) => {

        const isDiscoverable = discoverableDevices.some(device => device === peripheral.id);

        if (isDiscoverable) {
            listenablePeripherals.push(peripheral);
            discoverableDevices = discoverableDevices.filter(device => device !== peripheral.id && device !== peripheral.address);
            await peripheral.connectAsync();
            console.log('Connected to peripheral:', peripheral.address);
            console.log('Peripheral name:', peripheral.advertisement.localName);
            console.log('Peripheral advertisement data:', peripheral.advertisement);
        }
    });
}

async function listenHeartrateEvents() {

    setInterval(function () {
        const devicesToListen = listenablePeripherals.filter(item => !listeningPeripherals.includes(item));

        devicesToListen.every(async peripheral => {
            const {characteristics} = await peripheral.discoverSomeServicesAndCharacteristicsAsync(['180D'], ['2A37']);

            characteristics.forEach(function (characteristic) {
                characteristic.on('data', function (data, isNotification) {

                    let body = {
                        token: process.env.API_TOKEN_MANAGER,
                        type: EVENT_TYPE.Heartrate,
                        value: parseInt(data.toString('hex'), 16),
                        device: peripheral.id,
                        creationDatetime: new Date().getTime()
                    };

                    promisePostRequest(process.env.INTERNAL_URL_MANAGER_NEW_EVENT, body);

                });

                characteristic.subscribe(function (error) {
                    // Handle the subscription error
                    console.error("Error", error);
                });
            });
            listeningPeripherals.push(peripheral);
        });

    }, 3000);
}

express.run();