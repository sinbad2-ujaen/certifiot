require('dotenv').config()
const {Express} = require("./core/Express");
const {write, getAllItems, del, update} = require("./db.js");


const express = new Express(process.env.PORT_STORAGE, "Storage")
express.get('/', async (_, res) => {

    let data = await getAllItems();

    console.log(data);

    res.send('Service is alive')
});

express.post('/devices', async (req, res) => {

    if (!req.body.token || req.body.token !== process.env.API_TOKEN_STORAGE) {
        res.status(401).send('Not authorized');
    } else {
        if (!req.body.message) {
            res.status(403).send("Bad request");
        } else {
            let message = req.body.message;
            await write(message.data.id, message.data);
            console.log("Device registered on db: " + message.data.id);
            res.status(200).send("ok");
        }
    }
});

express.post('/events', async (req, res) => {

    if (!req.body.token || req.body.token !== process.env.API_TOKEN_STORAGE) {
        res.status(401).send('Not authorized');
    } else {
        if (!req.body.message) {
            res.status(403).send("Bad request");
        } else {
            let message = req.body.message;
            message.data.status = "Captured";

            await write(message.data.id, message.data);
            console.log("Event Captured on db");
            res.status(200).send(message);
        }
    }
});

express.put('/events', async (req, res) => {

    if (!req.body.token || req.body.token !== process.env.API_TOKEN_STORAGE) {
        res.status(401).send('Not authorized');
    } else {
        if (!req.body.message) {
            res.status(403).send("Bad request");
        } else {
            let message = req.body.message;
            message.data.status = "Verified";

            await update(message.data.id, message.data);
            console.log("Event updated to Verified on db");
            res.status(200).send(message);
        }
    }
});

express.delete('/events/:id', (req, res) => {

    if (!req.body.token || req.body.token !== process.env.API_TOKEN_STORAGE) {
        res.status(401).send('Not authorized');
    } else {
        if (!req.params.id) {
            res.status(403).send("Bad request");
        } else {
            del(req.params.id)

            console.log("Event deleted from db");
            res.status(200).send("ok");
        }
    }
})
express.run();