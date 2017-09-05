/*var jsonStruct = {
	"Time":'',
	"Sender":{
		"Name":'',
		"ID":'',
		"Token":''
	},
	"Msg":''
};*/

function messageConstructor(Time, Sender, Msg){
	this.Time = Time;
	this.Sender = Sender;
	this.Msg = Msg;
}

function senderConstructor(Name, ID, Token){
	this.Name = Name;
	this.ID = ID;
	this.Token = Token;
}