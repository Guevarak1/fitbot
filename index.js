var VERIFY_TOKEN = 'blondiebytes';
var PAGE_ACCESS_TOKEN = 'EAACngySG46UBAPbnA5ARqr7bLT5iA4YOGYl3frRBuSpwPpDh2Cj5J6DpJP6E7YmZCLH7ZA3LT2xIzsDdWsqxxM8RtrZAP4Bod1ZA7D13CjPrRxZAGvLe6HQHl0nZCALtZBlhRb4GvpZAOZBQZBvMx87IZAUPPXv647JfZCsqDuXx00MlWgZDZD';

var CHEST_CATEGORY = "11";
var LEGS_CATEGORY = "9";
var SHOULDERS_CATEGORY = "13";
var BACK_CATEGORY = "12";

var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var request = require('request');

app.set('port', (process.env.PORT || 5000))
app.listen(process.env.PORT || 5000)

app.use(bodyParser.urlencoded({
    extended: true
}));

app.use(bodyParser.json());

app.get('/', function(req, res) {
    res.send('Hello world');
});

app.get('/setupButton', function(req, res) {
    getStartedButton(res);
});

app.get('/setupMessage', function(req, res) {
    getStartedMessage(res);
});

app.get('/setupPersistantMenu', function(req, res) {
    persistantMenu(res);
});


// respond to facebook's verification
app.get('/webhook', function(req, res) {
    if (req.query['hub.mode'] === 'subscribe' &&
        req.query['hub.verify_token'] === VERIFY_TOKEN) {
        console.log("Validating webhook");
        res.status(200).send(req.query['hub.challenge']);
    } else {
        console.error("Failed validation. Make sure the validation tokens match.");
        res.sendStatus(403);
    }
});

// respond to post calls from facebook
app.post('/webhook/', function(req, res) {
    var data = req.body;

    // Make sure this is a page subscription
    if (data.object === 'page') {

        // Iterate over each entry - there may be multiple if batched
        data.entry.forEach(function(entry) {
            var pageID = entry.id;
            var timeOfEvent = entry.time;

            // Iterate over each messaging event
            entry.messaging.forEach(function(event) {
                if (event.message) {
                    if (event.message.quick_reply) {
                        receivedPostback(event, "quick")
                    } else {
                        receivedMessage(event);
                    }
                } else if (event.postback) {
                    receivedPostback(event, "regular")
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
});

function receivedMessage(event) {
    var senderID = event.sender.id;
    var recipientID = event.recipient.id;
    var timeOfMessage = event.timestamp;
    var message = event.message;

    console.log("Received message for user %d and page %d at %d with message:",
        senderID, recipientID, timeOfMessage);
    console.log(JSON.stringify(message));

    var messageId = message.mid;

    var messageText = message.text;
    var messageAttachments = message.attachments;

    if (messageText) {

        // If we receive a text message, check to see if it matches a keyword
        // and send back the example. Otherwise, just echo the text we received.
        switch (messageText) {
            // case 'button':
            //     sendButtonMessage(senderID);
            //     break;
            // case 'generic':
            //     sendGenericMessage(senderID);
            //     break;
            // case 'list':
            //     sendListMessage(senderID);
            //     break;
            // case 'quick':
            //     sendQuickRepliesMessage(senderID, "select an exercise:");
            //     break;
            case 'easter':
                sendTextMessage(senderID, "egg");
                break;
            default:
                sendTextMessage(senderID, "tap on the menu option to get started!");
        }
    } else if (messageAttachments) {
        sendTextMessage(senderID, "Message with attachment received");
    }
}

function receivedPostback(event, type) {
    var senderID = event.sender.id;
    var recipientID = event.recipient.id;
    var timeOfMessage = event.timestamp;

    if (type == "regular") {
        var payload = event.postback.payload;
    } else {
        var quick_reply_payload = event.message.quick_reply.payload
    }

    console.log("Received message for user %d and page %d at %d with message:",
        senderID, recipientID, timeOfMessage);
    console.log(JSON.stringify(payload));

    if (payload) {
        switch (payload) {
            case 'GET_STARTED_PAYLOAD':
                sendQuickRepliesMessage(senderID, 'Hi, I\'m Fitbot and I was created to help you choose different exercises.');
                break;
            case 'SELECT_AN_EXERCISE':
                sendQuickRepliesMessage(senderID, 'select an exercise: ');
                break;
            default:
                sendTextMessage(senderID, "payload not set up");
        }
    } else if (quick_reply_payload) {
        switch (quick_reply_payload) {
            case 'GET_STARTED_PAYLOAD':
                sendQuickRepliesMessage(senderID, 'Hi, I\'m Fitbot and I was created to help you choose different exercises.');
                break;
            case 'DEVELOPER_DEFINED_PAYLOAD_FOR_PICKING_CHEST':
            	

            	var info = callWgerAPI(CHEST_CATEGORY);
                

                sendGenericMessage(senderID, info.results[0].name);
                break;
            case 'DEVELOPER_DEFINED_PAYLOAD_FOR_PICKING_LEGS':


            	callWgerAPI(LEGS_CATEGORY);
                

                sendGenericMessage(senderID, info.results[0].name);
                break;
            case 'DEVELOPER_DEFINED_PAYLOAD_FOR_PICKING_BACK':


            	callWgerAPI(BACK_CATEGORY);
                

                sendGenericMessage(senderID, info.results[0].name);
                break;
            case 'DEVELOPER_DEFINED_PAYLOAD_FOR_PICKING_SHOULDERS':


            	callWgerAPI(SHOULDERS_CATEGORY);
                

                sendGenericMessage(senderID, info.results[0].name);
                break;
            default:
                sendTextMessage(senderID, "payload not set up");

        }
    }
}

//where should i put the call to get the json?
function sendTextMessage(recipientId, messageText) {
    var messageData = {
        recipient: {
            id: recipientId
        },
        message: {
            text: messageText
        }
    };

    callSendAPI(messageData);
}

function sendQuickRepliesMessage(recipientId, messageText) {
    var messageData = {
        recipient: {
            id: recipientId
        },
        "message": {
            "text": "Select an exercise:",
            "quick_replies": [{
                "content_type": "text",
                "title": "Chest",
                "payload": "DEVELOPER_DEFINED_PAYLOAD_FOR_PICKING_CHEST"
            }, {
                "content_type": "text",
                "title": "Legs",
                "payload": "DEVELOPER_DEFINED_PAYLOAD_FOR_PICKING_LEGS"
            }, {
                "content_type": "text",
                "title": "Shoulders",
                "payload": "DEVELOPER_DEFINED_PAYLOAD_FOR_PICKING_SHOULDERS"
            }, {
                "content_type": "text",
                "title": "Back",
                "payload": "DEVELOPER_DEFINED_PAYLOAD_FOR_PICKING_BACK"
            }]
        }
    };
    callSendAPI(messageData);
}

function sendButtonMessage(recipientId) {
    var messageData = {
        recipient: {
            id: recipientId
        },
        message: {
            attachment: {
                type: "template",
                payload: {
                    template_type: "button",
                    text: "What do you want to do next?",
                    buttons: [{
                        type: "web_url",
                        url: "https://google.com",
                        title: "Show Website"
                    }, {
                        type: "postback",
                        title: "Start Chatting",
                        payload: "USER_DEFINED_PAYLOAD"
                    }]
                }
            }
        }
    };
    callSendAPI(messageData);
}

function sendGenericMessage(recipientId, muscleCategory) {
    var messageData = {
        recipient: {
            id: recipientId
        },
        message: {
            attachment: {
                type: "template",
                payload: {
                    template_type: "generic",
                    elements: [{
                        title: muscleCategory + ": exercise 1",
                        image_url: "https://cdn-maf1.heartyhosting.com/sites/muscleandfitness.com/files/styles/full_node_image_1090x614/public/media/dumbbells-on-floor.jpg?itok=YyIzb6d3",
                        subtitle: "We\'ve got the right hat for everyone.",
                        buttons: [{
                            type: "web_url",
                            url: "https://google.com",
                            title: "Show Website"
                        }, {
                            type: "web_url",
                            url: "https://google.com",
                            title: "Show Website again"
                        }, {
                            type: "postback",
                            title: "Start Chatting",
                            payload: "DEVELOPER_DEFINED_PAYLOAD"
                        }]
                    }, {
                        title: muscleCategory + ": exercise 2",
                        image_url: "https://cdn-maf1.heartyhosting.com/sites/muscleandfitness.com/files/styles/full_node_image_1090x614/public/media/dumbbells-on-floor.jpg?itok=YyIzb6d3",
                        subtitle: "We\'ve got the right hat for everyone.",
                        buttons: [{
                            type: "web_url",
                            url: "https://google.com",
                            title: "Show Website"
                        }, {
                            type: "web_url",
                            url: "https://google.com",
                            title: "Show Website again"
                        }, {
                            type: "postback",
                            title: "Start Chatting",
                            payload: "DEVELOPER_DEFINED_PAYLOAD"
                        }]
                    }, {
                        title: muscleCategory + ": exercise 3",
                        image_url: "https://cdn-maf1.heartyhosting.com/sites/muscleandfitness.com/files/styles/full_node_image_1090x614/public/media/dumbbells-on-floor.jpg?itok=YyIzb6d3",
                        subtitle: "We\'ve got the right hat for everyone.",
                        buttons: [{
                            type: "web_url",
                            url: "https://google.com",
                            title: "Show Website"
                        }, {
                            type: "web_url",
                            url: "https://google.com",
                            title: "Show Website again"
                        }, {
                            type: "postback",
                            title: "Start Chatting",
                            payload: "DEVELOPER_DEFINED_PAYLOAD"
                        }]
                    }]
                }
            }
        }
    };
    callSendAPI(messageData);
}

function sendListMessage(recipientId) {
    var messageData = {
        recipient: {
            id: recipientId
        },
        message: {
            attachment: {
                type: "template",
                payload: {
                    template_type: "list",
                    elements: [{
                        title: "Classic T-Shirt Collection",
                        image_url: "https://i.imgur.com/jZstPeW.jpg",
                        subtitle: "See all our colors",
                        buttons: [{
                            title: "View",
                            type: "web_url",
                            url: "https://google.com",
                        }]
                    }, {
                        title: "Classic White T-Shirt",
                        // image_url: "https://peterssendreceiveapp.ngrok.io/img/white-t-shirt.png",
                        subtitle: "100% Cotton, 200% Comfortable",
                        buttons: [{
                            title: "Shop Now",
                            type: "web_url",
                            url: "https://google.com",
                        }]
                    }, {
                        title: "Classic Blue T-Shirt",
                        // "image_url": "https://peterssendreceiveapp.ngrok.io/img/blue-t-shirt.png",
                        subtitle: "100% Cotton, 200% Comfortable",
                        buttons: [{
                            title: "Shop Now",
                            type: "web_url",
                            url: "https://google.com",
                        }]
                    }, {
                        title: "Classic Black T-Shirt",
                        // "image_url": "https://peterssendreceiveapp.ngrok.io/img/black-t-shirt.png",
                        subtitle: "100% Cotton, 200% Comfortable",
                        buttons: [{
                            title: "Shop Now",
                            type: "web_url",
                            url: "https://google.com",
                        }]
                    }],
                    buttons: [{
                        title: "View More",
                        type: "postback",
                        payload: "payload"
                    }]
                }
            }
        }
    };
    callSendAPI(messageData);
}

function callSendAPI(messageData) {
    request({
        uri: 'https://graph.facebook.com/v2.6/me/messages',
        qs: { access_token: PAGE_ACCESS_TOKEN },
        method: 'POST',
        json: messageData

    }, function(error, response, body) {
        if (!error && response.statusCode == 200) {
            var recipientId = body.recipient_id;
            var messageId = body.message_id;

            console.log("Successfully sent generic message with id %s to recipient %s",
                messageId, recipientId);
        } else {
            console.error("Unable to send message.");
            console.error(response);
            console.error(error);
        }
    });
}

function callWgerAPI(category) {
    request({
        uri: 'https://wger.de/api/v2/exercise',
        qs: {format: "json", category: category, language: "2"}

    }, function(error, response, body) {
        if (!error && response.statusCode == 200) {

            console.log("===================Successfully sent WGER ===================");
            console.log(body);
            return info = JSON.parse(body);	
        } else {
            console.error("Unable to send message.");
            console.error(response);
            console.error(error);
        }
    });
}

function callSendMessengerProfileAPI(messageData) {
    request({
        uri: 'https://graph.facebook.com/v2.6/me/messenger_profile',
        qs: { access_token: PAGE_ACCESS_TOKEN },
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        json: messageData

    }, function(error, response, body) {
        if (!error && response.statusCode == 200) {
            res.send(body);

            console.log("Successfully sent messenger_profile page");
        } else {
            res.send(body);
            console.error("Unable to send message.");
            console.error(response);
            console.error(error);
        }
    });
}

function getStartedButton(res) {
    var messageData = {
        get_started: {
            payload: "GET_STARTED_PAYLOAD"
        }
    };

    callSendMessengerProfileAPI(messageData);
}

function persistantMenu(res) {
    var messageData = {
        "persistent_menu": [{
            "locale": "default",
            "composer_input_disabled": true,
            "call_to_actions": [{
                "type": "postback",
                "title": "Select a different exercise",
                "payload": "SELECT_AN_EXERCISE"
            }]
        }]
    };

    callSendMessengerProfileAPI(messageData);
}


function getStartedMessage(res) {
    var messageData = {
        "greeting": [{
            "locale": "default",
            "text": "Hello!"
        }, {
            "locale": "en_US",
            "text": "Helping you explore different exercises."
        }]
    };

    callSendMessengerProfileAPI(messageData);
}
