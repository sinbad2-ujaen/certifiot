require('dotenv').config()
const { Express } = require("./core/Express");
const { promisePostRequest, promiseDeleteRequest, promiseGetRequest} = require('./core/httpClient')
const crypto = require('crypto');
const EdDSA = require('elliptic').eddsa;
const { v4: uuidv4 } = require('uuid');
const { retrieveData, SingleNodeClient } = require("@iota/iota.js");

const PHONENDO_HEARTRATE_SCHEME = "https://explorer.iota.org/devnet/message/95067ae28dcefa355d5f5f1d335446c03d9e1049d65df5fc7296c06a2288ec01";
const PHONENDO_HEARTRATE_SCHEME_TRANSACTION = "95067ae28dcefa355d5f5f1d335446c03d9e1049d65df5fc7296c06a2288ec01";
const PHONENDO_HEARTRATE_SCHEME_HASH = "cbb8427b43e4a2a1046509aaa05dc33440707c27d9731f2c34c35c46ee933413";

const EVENT_TYPE = {
    Heartrate: "HEART_RATE"
}

let heartRateDataModel = null;
let organization_name = null;


const express = new Express(process.env.PORT_MANAGER, "Manager")
express.get('/', async (_, res) => {
    res.send('Service is alive')
});

express.post('/registerDevice', (req, res) => {
    if (!req.body.token || req.body.token !== process.env.API_TOKEN_MANAGER) {
        res.status(401).send('Not authorized');
    } else {
        let device = req.body.device;
        let type = req.body.type;
        let serialNumber = req.body.serialNumber;
        let creationDatetime = req.body.creationDatetime;

        if (device) {
            console.log("New device received: " + device);
            // send to storage
            let message = {
                key: device,
                value: {
                    device: device,
                    type: type,
                    serialNumber: serialNumber,
                    creationDatetime: creationDatetime
                }
            };

            let body = {
                token: process.env.API_TOKEN_STORAGE,
                message: message
            };

            promisePostRequest(process.env.INTERNAL_URL_STORAGE_DEVICES, body);

            res.status(200).send("Successfully registered");

        } else {
            res.status(403).send("Bad request");
        }
    }
});

express.post('/newEvent',async (req, res) => {
    if (!req.body.token || req.body.token !== process.env.API_TOKEN_MANAGER) {
        res.status(401).send('Not authorized');
    } else {
        let type = req.body.type;
        let value = req.body.value;
        let mac = req.body.mac;

        console.log("New event received: " + type + " // " + value + " // " + mac);

        let message = null;

        if (type === EVENT_TYPE.Heartrate /*&& heartRateDataModel*/) {
            message = {
                schemaID: PHONENDO_HEARTRATE_SCHEME,
                data: {
                    id: uuidv4(),
                    heart_rate: value,
                    timestamp: new Date().getTime(),
                    mac: mac,
                }
            }

            let messageSign = signDataSource(message);

            // Store event on Storage as Captured
            let body = {
                token: process.env.API_TOKEN_STORAGE,
                message: message,
                signature: messageSign
            };

            let storedMessage = await promisePostRequest(process.env.INTERNAL_URL_STORAGE_EVENTS, body);

            // Verify event
            body.message = storedMessage;
            body.token = process.env.API_TOKEN_VERIFIER;

            let verifiedMessage = await promisePostRequest(process.env.INTERNAL_URL_VERIFIER_VERIFY, body);

            // Store event on Storage as Verified
            body.message = verifiedMessage;
            body.token = process.env.API_TOKEN_STORAGE;

            let storedVerifiedMessage = await promisePostRequest(process.env.INTERNAL_URL_STORAGE_EVENTS, body);

            // Publish event
            body.message = storedVerifiedMessage;
            body.token = process.env.API_TOKEN_PUBLISHER;
            body.organization_name = organization_name;
            let publishedMessage = await promisePostRequest(process.env.INTERNAL_URL_PUBLISHER_PUBLISH, body);

            body.token = process.env.API_TOKEN_STORAGE;

            // Delete event from Storage
            promiseDeleteRequest(process.env.INTERNAL_URL_STORAGE_EVENTS + "/" + publishedMessage.key, body);

            res.status(200).send('Event processed');

        } else {
            res.status(500).send('Heartrate scheme not available');
        }
    }
});

express.post('/registerVerifier', (req, res) => {
    if (!req.body.token || req.body.token !== process.env.API_TOKEN_MANAGER) {
        res.status(401).send('Not authorized');
    } else {

        if (req.body.name) {
            organization_name = req.body.name;
            res.status(200).send();
        } else {
            res.status(403).send('Bad request');
        }
    }
});

function signDataSource(message) {

    let MAC = message.data.mac;

    MAC = MAC.replaceAll(':', '');

    const KEY = MAC + 'Phonendo';

    let keyHash = crypto.createHash('sha256').update(KEY).digest('base64');

    keyHash = keyHash.slice(0, MAC.length);

    const macBytes = Buffer.from(MAC,'utf8');

    const keyBytes = Buffer.from(keyHash, 'utf8');

    let seed = macBytes.map((byte, i) => byte ^ keyBytes[i]);

    seed = seed.toString('hex');

    seed = crypto.createHash('sha256').update(seed).digest('hex');

    const ec = new EdDSA('ed25519');

    const key = ec.keyFromSecret(seed);

    //const hexPrivateKey = `0x${Buffer.from(key.getSecret()).toString('hex')}`;

    //const hexPublicKey = `0x${Buffer.from(key.getPublic()).toString('hex')}`;

    const messageBuffer = Buffer.from(JSON.stringify(message), 'utf8');

    return key.sign(messageBuffer).toHex();
}

async function loadHeartbeatDataModel() {

    const iotaNodeClient = new SingleNodeClient("https://api.lb-0.h.chrysalis-devnet.iota.cafe");

    const foundDatamodel = await iotaNodeClient.message(PHONENDO_HEARTRATE_SCHEME_TRANSACTION);

    if (foundDatamodel) {

        let dataModelString = '';
        for (let i = 0; i < foundDatamodel.payload.data.length; i += 2) {
            dataModelString += String.fromCharCode(parseInt(foundDatamodel.payload.data.substr(i, 2), 16));
        }

        const hash = crypto.createHash('sha256').update(dataModelString).digest('hex');

        if (hash === PHONENDO_HEARTRATE_SCHEME_HASH) {
            heartRateDataModel = JSON.parse(dataModelString);
            console.log("Heartrate data model loaded");
        } else {
            console.error("Invalid phonendo heartrate data model");
        }
    }
}

express.run();
loadHeartbeatDataModel();