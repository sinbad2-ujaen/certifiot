require('dotenv').config()
const {Express} = require("./core/Express");
const { createSign, createPrivateKey, createPublicKey, generateKeyPairSync } = require("node:crypto");

// Import keys
const fs = require('fs');
let keys = JSON.parse(fs.readFileSync(__dirname+"/keys.json", 'utf8'));
privateKey = createPrivateKey({
    key: keys.privateKey,
    type: "pkcs8",
    format: "pem",
});

const verifierConfig = readConfigFile();

const express = new Express(process.env.PORT_VERIFIER, "Verifier")
express.get('/', (_, res) => {
    res.send('Service is alive')
});

express.post('/verify', (req, res) => {

    if (!req.body.token || req.body.token !== process.env.API_TOKEN_VERIFIER) {
        res.status(401).send('Not authorized');
    } else {
        if (!req.body.message) {
            res.status(403).send("Bad request");
        } else {
            let message = req.body.message;

            const sign = createSign("SHA256");
            sign.write(JSON.stringify(message));
            sign.end();
            const signature = sign.sign(verifierConfig.verifier_private_key || privateKey, "hex");
            message.data.verifierSign = signature;
            message.data.verifierSignDatetime = new Date().getTime();

            console.log("Event Verified with signature: " + signature);

            res.status(200).send(message);
        }
    }
});

function readConfigFile() {
    try {
        return JSON.parse(fs.readFileSync(__dirname+"/config.json", 'utf8'));
    } catch (err) {
        console.error('Error reading config file:', err);
        process.exit(1);
    }
}


express.run();