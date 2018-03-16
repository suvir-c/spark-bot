'use strict';

// Import dependencies and set up http server via express.js

const express = require('express'),
	bodyParser = require('body-parser'),
	app = express().use(bodyParser.json()); 
require('dotenv').config();
const PAGE_ACCESS_TOKEN = process.env.PAGE_ACCESS_TOKEN;
const request = require('request');

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
			
			// gets the sender PSID
			let sender_psid = webhook_event.sender.id;
			console.log('Sender PSID: ' + sender_psid);

			if(webhook_event.message) {
				handleMessage(sender_psid, webhook_event.message);	
			} else if(webhook_event.postback) {
				handlePostback(sender_psid, webhook_event.postback);
			}	
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

// handles messages events
function handleMessage(sender_psid, received_message) {
	let response;
	
	// check if the message contains text
	if(received_message.text) {
		
		if(received_message.text === 'testing the chatbot 123') {
			console.log('message received!!');
			// create payload for a basic text message
			response = {
					"template_type" : "button",
					"text" : `yo, you sent: "${received_message.text}, would you like to subscribe to our weekly messenger newsletter?"`,
					"buttons" : [
						{
							"type" : "postback",
							"title" : "Yes!",
							"payload" : "SUBSCRIBE"
						},
						{
							"type" : "postback",
							"title" : "No, thanks!",
							"payload" : "DO_NOT_SUBSCRIBE"	
						}	
					]
			}
		}
	}

	// sends response message
	callSendAPI(sender_psid, response);
}

// handles messaging_postback events
function handlePostback(sender_psid, received_postback) {
	console.log('received a postback event: ' + received_postback.payload);
	if(received_postback.payload === 'SUBSCRIBE') {
		// TODO: add label to this psid "SUBSCRIBED"	
		// (using fb graph api)
	} else if(received_postback.payload === 'DO_NOT_SUBSCRIBE') {
		// TODO: add label to this psid "NOT_SUBSCRIBED"	
	} else {
		console.log('unclear payback');	
	}
}

// sends response messages via Send API
function callSendAPI(sender_psid, response) {
	// construct messsage body
	let request_body = {
		"recipient" : {
			"id" : sender_psid
		}, 
		"message" : {
			"attachment" : {
				"type" : "template",
				"payload" : response
			}
		}
	}

	// send HTTP request to the Messenger Platform
	request({
		"uri": "https://graph.facebook.com/v2.6/me/messages",
		"qs": { "access_token": PAGE_ACCESS_TOKEN }, 
		"method": "POST",
		"json": request_body
	}, (err, res, body) => {
		if(!err) {
			console.log('message sent!');
		} else {
			console.error('unable to send message:' + err);
		}
	});	
}

