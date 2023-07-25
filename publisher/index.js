require('dotenv').config();
const { Express } = require("./core/Express");
const { ClientBuilder } = require('@iota/client');
var lastMessageId = "";

const client = new ClientBuilder()
    //.node('https://api.lb-0.h.chrysalis-devnet.iota.cafe')
    .build();

const express = new Express(process.env.PORT_PUBLISHER, "Publisher")
express.get('/', (_, res) => {
    client.getInfo().then(console.log).catch(console.error);
    res.send('Service is alive')
});

express.post('/publish', async (req, res) => {
    if (!req.body.token || req.body.token !== process.env.API_TOKEN_PUBLISHER) {
        res.status(401).send('Not authorized');
    } else {
        let message = req.body.message
        if (!message) {
            res.status(403).send("Bad request");
        } else {
            console.log(lastMessageId)

            let organization_name = req.body.organization_name;

            delete message.data.id;
            delete message.data.status;
            message.signData = {
                verifierSign: message.data.verifierSign,
                verifierSignDatetime: message.data.verifierSignDatetime
            }
            delete message.data.verifierSignDatetime;
            delete message.data.verifierSign;

            let iotaBuilder = client.message()
                .index('PHONENDO:'+organization_name)
                .data(JSON.stringify(message));

            if (lastMessageId) {
                iotaBuilder.parents([lastMessageId])
            }

            const iotaMessage = await iotaBuilder.submit();

            lastMessageId = iotaMessage.messageId;
            console.log("Event published on IOTA" + JSON.stringify(iotaMessage));
            res.status(200).send(req.body.message);
        }
    }
});

express.run();