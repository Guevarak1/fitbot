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

app.post('/webhook/', function(req, res) {
    let messaging_events = req.body.entry[0].messaging
    for (let i = 0; i < messaging_events.length; i++) {
        let event = messaging_events[i]
        let sender = event.sender.id

        //regular message coming in from user
        if (event.message && event.message.text) {
            let text = event.message.text
            decideMessage(sender, text)
        }

        //postback is the users reponse to a query from the bot
        if (event.postback) {
            let text = JSON.stringify(event.postback)
            decideMessage(sender, text)
        }
    }
    res.sendStatus(200);
})

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
        sendText(sender, "Welcome to the Fitbot! Which muscle group are you working out today?");
        //sendButtonMessage(sender, "What is your favorite season");
        sendMuscleGroupMessage(sender)
    }
}

function sendMuscleGroupMessage(sender, text) {
   
    var messageData = {
        attachment: {
            type: "template",
            payload: {
                template_type: "list",
                elements: [{
                    title: "Muscle Groups",
                    image_url: "http://vignette2.wikia.nocookie.net/humongous/images/f/f8/Barbell.png/revision/latest?cb=20160404211047",
                    subtitle: "Choose a muscle group for todays workout"
                }, {
                    title: "Chest Day",
                    subtitle: "Exercise that targets your chest.",
                    buttons: [{
                        title: "Select",
                        type: "web_url",
                        url: "http://www.bodybuilding.com/content/10-best-chest-exercises-for-building-muscle.html",
                        messenger_extensions: true,
                        webview_height_ratio: "tall",
                        fallback_url: "https://www.bodybuilding.com/"
                    }]
                }, {
                    title: "Back Day",
                    subtitle: "Exercise that targets your back",
                    buttons: [{
                        title: "Select",
                        type: "web_url",
                        url: "http://www.bodybuilding.com/content/10-best-muscle-building-back-exercises.html",
                        messenger_extensions: true,
                        webview_height_ratio: "tall",
                        fallback_url: "https://www.bodybuilding.com/"
                    }]
                }, {
                    title: "Leg Day",
                    subtitle: "100% Cotton, 200% Comfortable",
                    buttons: [{
                        title: "Select",
                        type: "web_url",
                        url: "http://www.bodybuilding.com/content/5-leg-workouts-for-mass-a-beginners-guide.html",
                        messenger_extensions: true,
                        webview_height_ratio: "tall",
                        fallback_url: "https://www.bodybuilding.com/"
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

function sendRequest(sender, messageData) {

	console.log("message data: " + messageData)
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
            console.log("response body error: \n" + "message: " + error.message + "\n" + "type: " +  error.type)
        }
    })
}

app.listen(app.get('port'), function() {
    console.log("running: port")
})
