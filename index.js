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

app.post('/webhook/', function(req, res) {
    let messaging_events = req.body.entry[0].messaging
    for (let i = 0; i < messaging_events.length; i++) {
        let event = messaging_events[i]
        let sender = event.sender.id
        if (event.message && event.message.text) {
            let text = event.message.text
            decideMessage(sender, text)
                //sendText(sender, "Text echo: " + text.substring(0,100))
        }
        if (event.postback) {
            let text = JSON.stringify(event.postback)
            decideMessage(sender, text)
        }
    }
    res.sendStatus(200);
})

function decideMessage(sender, text1) {
    let text = text1.toLowerCase()
    if (text.includes("summer")) {
        sendImageMessage(sender)
    } else if (text.includes("winter")) {
        sendGenericMessage(sender)
    } else {
        sendText(sender, "I like fall");
        sendButtonMessage(sender, "What is your favorite season");
    }
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
                    "title": "winter",
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
    let messageDate = {
        "attachment": {
            "type": "template",
            "payload": {
                "template_type": "generic",
                "elements": [{
                    "title": "Winter",
                    "subtitle": "I love winter",
					"image_url": "http://www.almanac.com/sites/default/files/styles/primary_image_in_article/public/image_nodes/winter-solstice.jpg?itok=Pvf11DFE",					
                    "buttons": [{
                        "type": "web_url",
                        "url": "https://en.wikipedia.org/wiki/Winter",
                        "title": "More about winter!"
                    }]
                }]
            }
        }
    }
}

function sendRequest(sender, messageData) {

    request({
        url: "https://graph.facebook.com/v2.6/me/messages",
        qs: { access_token: token },
        method: "POST",
        json: {
            recipient: { id: sender },
            message: messageData
        }
    }, function(error, response, body) {
        if (error) {
            console.log("sending error")
        } else if (response.body.error) {
            console.log("response body error")
        }
    })
}

app.listen(app.get('port'), function() {
    console.log("running: port")
})
