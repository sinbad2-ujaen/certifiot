require('dotenv').config();
const {Express} = require("./core/Express");
const { ClientBuilder } = require('@iota/client');
const { retrieveData, SingleNodeClient } = require("@iota/iota.js");
const { promisePostRequest} = require('./core/httpClient')


const express = new Express(process.env.PORT_IDENTITY, "Identity")
const iotaClient = new ClientBuilder()
    .node('https://api.lb-0.h.chrysalis-devnet.iota.cafe')
    .build();

const iotaNodeClient = new SingleNodeClient("https://api.lb-0.h.chrysalis-devnet.iota.cafe");


express.get('/', async (_, res) => {
    res.send('Service is alive')
});

express.post('/datamodel', async (req, res) => {
    if (!req.body.token || req.body.token !== process.env.API_TOKEN_IDENTITY) {
        res.status(401).send('Not authorized');
    } else {
        const datamodel = req.body.datamodel;

        console.log("New datamodel: " + datamodel);

        let id = datamodel.namespace + "/" + datamodel.name;

        let iotaBuilder = iotaClient.message()
            .index('PHONENDO:DATAMODEL:' + id)
            .data(JSON.stringify(datamodel));

        const iotaMessage = await iotaBuilder.submit();
        console.log("Data model published on IOTA" + JSON.stringify(iotaMessage));
        res.status(201).send(iotaMessage.messageId);
    }

});

express.post('/publish/:organization', async (req, res) => {
    if (!req.body.token || req.body.token !== process.env.API_TOKEN_IDENTITY) {
        res.status(401).send('Not authorized');
    } else {
        let organization = req.params.organization;
        let public_key = req.body.key;

        console.log("New organization identity: " + organization + " // " + public_key);

        let message = {
            organization: organization,
            publicKey: public_key
        };

        let iotaBuilder = iotaClient.message()
            .index('PHONENDO:IDENTITY:' + organization)
            .data(JSON.stringify(message));

        const iotaMessage = await iotaBuilder.submit();
        console.log("Identity published on IOTA" + JSON.stringify(iotaMessage));

        let body = {
            token: process.env.API_TOKEN_MANAGER,
            name: organization
        };

        await promisePostRequest(process.env.INTERNAL_URL_MANAGER_REGISTER_VERIFIER, body);

        console.log("Verifier added");

        res.status(201).send(iotaMessage.messageId);
    }
});

express.post('/endorse/:organization', async (req, res) => {
    if (!req.body.token || req.body.token !== process.env.API_TOKEN_IDENTITY) {
        res.status(401).send('Not authorized');
    } else {
        let organization = req.params.organization;
        let endorserKey = req.body.endorser_key;
        let endorsedKey = req.body.endorsed_key;
        let validityPeriod = req.body.validity_period;

        console.log("New identity endorsement: " + endorserKey + " // " + endorsedKey + " // " + validityPeriod + " // " + organization);

        let message = {
            endorserKey: endorserKey,
            endorsedKey: endorsedKey,
            metadata: {
                validityPeriod: validityPeriod
            }
        };

        let iotaBuilder = iotaClient.message()
            .index('PHONENDO:IDENTITY:TRUST:'+organization)
            .data(JSON.stringify(message));

        const iotaMessage = await iotaBuilder.submit();
        console.log("Trust endorsement published on IOTA" + JSON.stringify(iotaMessage));
        res.status(201).send(iotaMessage.messageId);
    }
});

express.get('/:organization', async (req, res) => {

    // TODO add API token

    const organization = req.params.organization;

    if (organization) {

        let response = {};

        const foundIdentity = await iotaNodeClient.messagesFind('PHONENDO:IDENTITY:' + organization);

        if (foundIdentity && foundIdentity.messageIds.length > 0) {
            console.log(`Messages Found: ${foundIdentity.count}`);

            const lastIdentity = await retrieveData(iotaNodeClient, foundIdentity.messageIds[foundIdentity.count - 1]);
            if (lastIdentity) {
                response.identity = JSON.parse(bytesToAscii(lastIdentity.data));
                response.identity.profile = "https://explorer.iota.org/devnet/message/" + foundIdentity.messageIds[foundIdentity.count - 1];
                console.log("\tIdentity: ", bytesToAscii(lastIdentity.data));
            }

        } else {
            response.identity = {};
            console.log("Found no identity");
        }

        console.log("Loading trust chain ############################");

        const foundTrustEndorsements = await iotaNodeClient.messagesFind('PHONENDO:IDENTITY:TRUST:'+organization);

        let trustChain = [];

        if (foundTrustEndorsements.messageIds.length > 0) {
            console.log(`Messages Found: ${foundTrustEndorsements.messageIds.length}`);

            for (let i = 0; i < foundTrustEndorsements.messageIds.length; i++) {
                const data = await retrieveData(
                    iotaNodeClient,
                    foundTrustEndorsements.messageIds[i]
                );
                if (data) {
                    trustChain.push(JSON.parse(bytesToAscii(data.data)));
                    console.log("\tData: ", bytesToAscii(data.data));
                }
            }
        } else {
            console.log("Found no trust endorsements");
        }

        response.trustChain = trustChain;

        console.log("Loading messages ############################");

        const foundMessages = await iotaNodeClient.messagesFind('PHONENDO:'+organization);

        let streamData = [];

        console.log(foundMessages);

        if (foundMessages.messageIds.length > 0) {
            console.log(`Messages Found: ${foundMessages.messageIds.length}`);

            for (let i = 0; i < foundMessages.messageIds.length; i++) {
                const data = await retrieveData(
                    iotaNodeClient,
                    foundMessages.messageIds[i]
                );
                if (data) {
                    streamData.push(JSON.parse(bytesToAscii(data.data)));
                    console.log("\tData: ", bytesToAscii(data.data));
                }
            }
        } else {
            console.log("Found no messages");
        }

        response.streamData = streamData;

        res.status(200).send(response);
    } else {
        res.status(403).send("Bad request");
    }
});

function bytesToAscii(bytes) {
    let result = '';
    for (let i = 0; i < bytes.length; i++) {
        result += String.fromCharCode(bytes[i]);
    }
    return result;
}

express.run();