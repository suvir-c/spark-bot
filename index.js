'use strict';

// Import dependencies and set up http server via express.js

const express = require('express'),
	bodyParser = require('body-parser'),
	app = express().use(bodyParser.json()); 
require('dotenv').config();
const PAGE_ACCESS_TOKEN = process.env.PAGE_ACCESS_TOKEN;

app.listen(process.env.PORT || 1337, () => console.log('webhook is listening!'));

app.post('/webhook', (req, res) => {

	let body = req.body;

	// checks this is an event from a page subscription
	if(body.object === 'page') {
		// iterates over each entry
		body.entry.forEach(function(entry) {
			
			// gets the message (always stored at entry.messaging[0]
			let webhook_event = entry.messaging[0];
			console.log(webhook_event);
		});

		res.status(200).send('EVENT_RECEIVED');	
	} else {

		// returns a 404 not found if event is not from a page subscription
		res.sendStatus(404);
	}

});

app.get('/webhook', (req, res) => {

	// your verify token (random string)
	// TODO: change this random string
	let VERIFY_TOKEN = "XYZ_VERIFY_TOKEN";
	
	// parse the parameters of the request
	let mode = req.query['hub.mode'];
	let token = req.query['hub.verify_token'];
	let challenge = req.query['hub.challenge'];

	// checks if token and mode is in the query string of the request
	if(mode && token) {
	
		// verifies that token and mode are correct
		if(mode === 'subscribe' && token === VERIFY_TOKEN) {

			// responds with the challenge token from the request
			console.log('WEBHOOK_VERIFIED');
			res.status(200).send(challenge);
		} else {
			// responds with 403 forbidden if verify tokens do not match
			res.sendStatus(403);
		}
		}
	});
