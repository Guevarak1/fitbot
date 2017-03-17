'use strict'
const express = require('express')
const bodyParser = require('body-parser')
const request = require('request')

const app = express()

app.set('port', (process.env.PORT || 5000))

//allows us to process the data
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

//Routes
//when going into heroku and launching the app 
app.get('/', function(req, res) {
	res.send("Hi i am a chatbot");
})

let token = "EAACngySG46UBAPbnA5ARqr7bLT5iA4YOGYl3frRBuSpwPpDh2Cj5J6DpJP6E7YmZCLH7ZA3LT2xIzsDdWsqxxM8RtrZAP4Bod1ZA7D13CjPrRxZAGvLe6HQHl0nZCALtZBlhRb4GvpZAOZBQZBvMx87IZAUPPXv647JfZCsqDuXx00MlWgZDZD"

//Facebook
app.get('/webhook/', function(req, res) {

	if (req.query['hub.verify_token'] === "blondiebytes") {
		res.send(req.query['hub.challenge'])
	}
	res.send("Wrong Token");
})

// respond from web calls from facebook
app.post('/webhook/', function(req, res) {
	var data = req.body;

    //make sure this is a page subscription
    if (data.object == 'page') {
        // Iterate over each entry - there may be multiple if batched
        data.entry.forEach(function(entry) {
        	var pageID = entry.id;
        	var timeOfEvent = entry.time;
            // Iterate over each messaging event
            entry.messaging.forEach(function(event) {
            	if (event.message) {
            		receivedMessage(event);
            	} else {
            		console.log("Webhook received unknown event: ", event);
            	}

            });
        });
        // Assume all went well.
        //
        // You must send back a 200, within 20 seconds, to let us know
        // you've successfully received the callback. Otherwise, the request
        // will time out and we will keep trying to resend.
        res.sendStatus(200);
    }

    // let messaging_events = req.body.entry[0].messaging
    // for (let i = 0; i < messaging_events.length; i++) {
    //     let event = messaging_events[i]
    //     let sender = event.sender.id

    //     //regular message coming in from user
    //     if (event.message && event.message.text) {
    //         let text = event.message.text
    //         decideMessage(sender, text)
    //     }

    //     //postback is the users reponse to a query from the bot
    //     if (event.postback) {
    //         let text = JSON.stringify(event.postback)
    //         decideMessage(sender, text)
    //     }
    // }
    // res.sendStatus(200);
})

function receivedMessage(event) {
	console.log('incoming event', event);
	var senderID = event.sender.id;
	var recipientID = event.recipient.id;
	var timeOfMessage = event.timestamp;
	var message = event.message;
	console.log(JSON.stringify(message));
	var messageId = message.mid;
	var messageText = message.text;
	var messageAttachments = message.attachments;
	if (messageText) {
		sendTextMessage(senderID, messageText);
	}
}

function getWeather(callback, location) {
	var weatherEndpoint = 'https://query.yahooapis.com/v1/public/yql?q=select%20*%20from%20weather.forecast%20where%20woeid%20in%20(select%20woeid%20from%20geo.places(1)%20where%20text%3D%22' + location + '%22)&format=json&env=store%3A%2F%2Fdatatables.org%2Falltableswithkeys';
	console.log(weatherEndpoint);
	request({
		url: weatherEndpoint,
		json: true
	}, function(error, response, body) {
		try {
			var condition = body.query.results.channel.item.condition;
			callback("Today is " + condition.temp + " and " + condition.text + " in " + location);
		} catch(err) {
			console.error('error caught', err);
			callback("There was an error");
		}
	});
}


function sendTextMessage(recipientId, messageText) {
	console.log('incoming message text', messageText);
	getWeather(function(message) {
		var messageData = {
			recipient: {
				id: recipientId
			},
			message: {
				text: message
			}
		};
		callSendAPI(messageData);
	}, messageText);

	function decideMessage(sender, text1) {
		let text = text1.toLowerCase()

    //default muscle groups
    if (text.includes("chest")) {
    	sendGenericMessage(sender)
    } else if (text.includes("back")) {
    	sendGenericMessage(sender)
    } else if (text.includes("legs")) {
    	sendGenericMessage(sender)
    } else if (text.includes("shoulders")) {
    	sendGenericMessage(sender)

        //give user a list of default muscle groups to choose from
    } else {
        //sendText(sender, "Welcome to the Fitbot! Which muscle group are you working out today?");
        sendMuscleGroupMessage(sender)
    }
}

function sendMuscleGroupMessage(sender) {
	console.log("======================sendMuscleGroupMessage request start=======================");
	let messageData = {
		"attachment": {
			"type": "template",
			"payload": {
				"template_type": "generic",
				"elements": [{
					"title": "Welcome to Fitbot!",
					"image_url": "https://digitalgymbuddy.files.wordpress.com/2015/03/cropped-generic-gym.jpg",
					"subtitle": "What would you be working out today?",
					"default_action": {
						"type": "web_url",
						"url": "https://www.bodybuilding.com/",
						"messenger_extensions": true,
						"webview_height_ratio": "tall",
						"fallback_url": "https://www.bodybuilding.com/"
					},
					"buttons": [{
						"title": "Chest",
						"type": "postback",
						"payload": "chest"
					}, {
						"title": "Back",
						"type": "postback",
						"payload": "back"
					}, {
						"title": "Legs",
						"type": "postback",
						"payload": "legs"
					}]
				}]
			}
		}
	}
	sendRequest(sender, messageData)
}


function sendText(sender, text) {
	let messageData = { text: text }
	sendRequest(sender, messageData)
}

function sendButtonMessage(sender, text) {

	let messageData = {
		"attachment": {
			"type": "template",
			"payload": {
				"template_type": "button",
				"text": text,
				"buttons": [{
					"type": "postback",
					"title": "Summer",
					"payload": "summer"
				}, {
					"type": "postback",
					"title": "Winter",
					"payload": "winter"
				}]
			}
		}
	}
	sendRequest(sender, messageData)
}

function sendImageMessage(sender) {
	let messageData = {
		"attachment": {
			"type": "image",
			"payload": {
				"url": "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c4/Field_Hamois_Belgium_Luc_Viatour.jpg/800px-Field_Hamois_Belgium_Luc_Viatour.jpg"
			}
		}
	}
	sendRequest(sender, messageData)
}

function sendGenericMessage(sender) {
	var messageData = {
		attachment: {
			type: "template",
			payload: {
				template_type: "generic",
				elements: [{
					title: "rift",
					subtitle: "Next-generation virtual reality",
					item_url: "https://www.oculus.com/en-us/rift/",
					image_url: "http://www.almanac.com/sites/default/files/styles/primary_image_in_article/public/image_nodes/winter-solstice.jpg?itok=Pvf11DFE",
					buttons: [{
						type: "web_url",
						url: "https://www.oculus.com/en-us/rift/",
						title: "Open Web URL"
					}, {
						type: "postback",
						title: "Call Postback",
						payload: "Payload for first bubble",
					}],
				}, {
					title: "touch",
					subtitle: "Your Hands, Now in VR",
					item_url: "https://www.oculus.com/en-us/touch/",
					image_url: "http://www.almanac.com/sites/default/files/styles/primary_image_in_article/public/image_nodes/winter-solstice.jpg?itok=Pvf11DFE",
					buttons: [{
						type: "web_url",
						url: "https://www.oculus.com/en-us/touch/",
						title: "Open Web URL"
					}, {
						type: "postback",
						title: "Call Postback",
						payload: "Payload for second bubble",
					}]
				}]
			}
		}
	};
	sendRequest(sender, messageData)
}

function callSendAPI(messageData) {
	request({
		uri: 'https://graph.facebook.com/v2.6/me/messages',
		qs: { access_token: token },
		method: 'POST',
		json: messageData
	}, function (error, response, body) {
		if (!error && response.statusCode == 200) {
			var recipientId = body.recipient_id;
			var messageId = body.message_id;
			console.log("Successfully sent generic message with id %s to recipient %s", 
				messageId, recipientId);
		} else {
			console.error("Unable to send message.");
      //console.error(response);
      console.error(error);
  }
});  
}

app.listen(app.get('port'), function() {
	console.log("running: port")
})
