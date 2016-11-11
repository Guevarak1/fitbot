'use strict'

const express = require('express')
const bodyParser = require('body-parser')
const request = require('request')

const app = express()

app.set('port', (process.env.PORT || 5000))

//allows us to process the data
app.use(bodyParser.urlencoded({extended: false}))
app.use(bodyParser.json())

//Routes

app.get('/', function(req,res){
	res.send("Hi i am a chatbot");
})

let token = "EAACngySG46UBAPbnA5ARqr7bLT5iA4YOGYl3frRBuSpwPpDh2Cj5J6DpJP6E7YmZCLH7ZA3LT2xIzsDdWsqxxM8RtrZAP4Bod1ZA7D13CjPrRxZAGvLe6HQHl0nZCALtZBlhRb4GvpZAOZBQZBvMx87IZAUPPXv647JfZCsqDuXx00MlWgZDZD"
//Facebook

app.get('/webhook/', function(req, res){

	if(req.query['hub.verify_token'] === "blondiebytes"){
		res.send(req.query['hub.challenge'])
	}
	res.send("Wrong Token");
})

app.post('/webhook/', function(req,res){
	let messaging_events = req.body.entry[0].messaging
	for(let i = 0; i < messaging_events.length; i++){
		let event = messaging_events[i]
		let sender = event.sender.id
		if(event.message && event.message.text){
			let text = event.message.text
			sendText(sender, "Text echo: " + text.substring(0,100))
		}
	}
	res.sendStatus(200);
})

function sendText(sender, text){
	let messageData = {text: text}
	request({
		url: "https://graph.facebook.com/v2.6/me/messages",
		qs: {access_token: token},
		method: "POST",
		json: {
			recipient: {id:sender},
			message: messageData
		}
	}, function(error, response, body){
		if(error){
			console.log("sending error")
		}else if(response.body.error){
			console.log("response body error")
		}
	})
}

app.listen(app.get('port'), function(){
	console.log("running: port")
})