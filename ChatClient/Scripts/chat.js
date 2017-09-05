"use strict";
//Define data formats
/*var jsonStruct = {
	"Type":''		//msg for Message, log for Login, cls for Close
	"Time":'',		//Timestamp, usually Date()
	"Sender":{
		"Name":'',	//User's name
		"ID":'',	//User's numeric ID
		"Token":''	//Session token for error checking
	},
	"Msg":''		//Message data (scrub for input)
};*/
function messageConstructor(Time, Sender, Msg){
	this.Type = "msg";
	this.Time = Time;
	this.Sender = Sender;
	this.Msg = Msg;
}
function senderConstructor(Name, ID, Token){
	this.Name = Name;
	this.ID = ID;
	this.Token = Token;
}

var chatLog = $('#chatLog');
var identity = '';
var chatSocket;

window.onload = function(){
	//THIS IS PLACEHOLDER
	var chatName = prompt("Please enter the name you wish to be displayed. (THIS IS PLACEHOLDER)", "Name");
	
	//var chatSocket = new WebSocket("ws://www.inebriatedstudios.com/chat/chatBackend.php"); //Prod(ish) server
	chatSocket = new WebSocket("ws://games.liekastrays.com:8101"); //Testing
	chatSocket.onopen = function(event) {
		var userID = Math.round(Math.random() * 1000000);	//Testing only
		
		/* Define login JSON format:
		Login = {
			"Type": '',		//for login frame, always 'log'
			"Name": '',		//User's name
			"ID": 0			//User's ID, will eventually be passed via SQL/PHP calls.
		}
		*/
		var login = {
			"Type": "log",
			"Name": chatName,
			"ID": userID
		};
		chatSocket.send(JSON.stringify(login));
	};
	chatSocket.onmessage = function (event) {
		var jsonMsg = JSON.parse(event.data);
		switch(jsonMsg.Type){
			case "msg":
				if(jsonMsg.Sender === "srv_Admin"){
					systemMessage(jsonMsg);
				}else{
					userMessage(jsonMsg);
				}
				break;
			case "log":
				identity = new senderConstructor(jsonMsg.Sender.Name, jsonMsg.Sender.ID, jsonMsg.Sender.Token);
				console.log("Login Successful for " + jsonMsg.Sender.Name); //Testing only
				break;
			case "cls":
				
				break;
			default:	//This shouldn't happen
				break;
		};
	};
};

window.onunload = function(){
	if(identity !== ''){
		//Send close frame
		var jsonClose = {
			"Type": "cls",
			"Sender": identity
		};
		chatSocket.send(JSON.stringify(jsonClose));
	}
	chatSocket.close();
};

function formatTime(timeStr){
	var time = new Date(timeStr);
	var returnStr = time.toLocaleDateString() + ' ' + time.toLocaleTimeString();
	return returnStr;
}

function systemMessage(jsonMessage){
	var msgTime = '[' + formatTime(jsonMessage.Time) + '] ';
	var msg = msgTime + jsonMessage.Msg;
	chatLog.html(chatLog.html() +'<div class="sysmsg">'+msg+'</div>');
}
function userMessage(jsonMessage){
	var msgTime = '[' + formatTime(jsonMessage.Time) + '] ';
	var msgSender = jsonMessage.Sender.Name + ': ';
	var msg = msgTime + msgSender + jsonMessage.Msg;
	chatLog.html(chatLog.html() +'<div class="usrmsg">'+msg+'</div>');
	//console.log('['+jsonMessage.Time+']'+jsonMessage.Sender+': '+jsonMessage.Msg);
}

function sendMessage(){
	var txtbox = $('#txtMessage');
	var strMsg = txtbox.val();
	txtbox.val('');		//TODO:  This is messy, should probably wait until after send for error handling?  Or move this value up to Chat Log to await confirmation?
	var jsonMsg = new messageConstructor(Date(), identity, strMsg);
	chatSocket.send(JSON.stringify(jsonMsg));
}
document.getElementById('txtMessage').onkeypress = function(e){
	if(e.key==="Enter"){
		sendMessage();
	}
};
document.getElementById('btnSend').onclick = function(){  sendMessage(); };