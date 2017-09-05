// Node imports
var ws = require('nodejs-websocket');
var keypress = require('keypress');

// Global variables
var port = 8101;
var users = {};
users[0] = {
    "Name": "srv_Admin",
    "ID": 0,
    "Token": 0
};

//Needed for key commands
keypress(process.stdin);

//Create server and implement necessary functions.
var server = ws.createServer(function (conn) {
    //console.log("new connection");

    conn.on("text", function (str) {
        var jsonStruct = JSON.parse(str);
        switch (jsonStruct.Type) {
            case "log":
                //Login handling
                /* Define login JSON format:
                Login = {
                    "Type": '',		//for login frame, always 'log'
                    "Name": '',		//User's name
                    "ID": 0			//User's ID, will eventually be passed via SQL/PHP calls.
                }
                */

                //TODO: room management
                //TODO: Multiple chat rooms within the same server

                var token = Math.round(Math.random() * 1000000);
                users[jsonStruct.ID] = {
                    "Name": jsonStruct.Name,
                    "ID": jsonStruct.ID,
                    "Token": token
                };
                var jsonResponse = {
                    "Type": "log",
                    "Sender": users[jsonStruct.ID]
                };
                conn.sendText(JSON.stringify(jsonResponse));
                console.log("User " + jsonStruct.Name + " logging on.");
                break;
            case "msg":
                broadcast(jsonStruct);
                //Message handling
                break;
            case "cls":
                delete users[jsonStruct.Sender.ID];
                console.log("User " + jsonStruct.Sender.Name + " logging off.");
                //Close handling
                break;
            default:

                break;
        }
    });

    /*conn.on("close", function (code, reason) {
        //console.log("Connection closed");
    });*/
}).listen(port);
console.log('Now listening on port ' + port);

//Send shutdown message to all clients, close connection, and exit the Node process.
function shutdown() {
    /*  Current JSON structure:
        json.Time:      Javascript time of the message {date().getTime()}
        json.Sender:    Name of the sender
        json.Msg:       Text of the message
    */
    //TODO: Update shut down JSON payload to match new format
    var time = new Date();
    var toSend = {
        "Time": time.getTime(),
        "Sender": users[0],     //User ID 0 is Server Admin user
        "Msg": "Server shutting down..."
    };
    strSend = JSON.stringify(toSend);
    console.log('Shutting down server. Please wait...');
    server.connections.forEach(function (conn) {
        conn.sendText(strSend);
        conn.close();
    });
    process.exit();
}

//Send message to all connected clients
//Will need upgrade to comply with planned format
function broadcast(msg) {
    //var time = Date(msg.Time);
    strSend = JSON.stringify(msg);
    console.log(msg.Sender.Name + " " + msg.Msg);
    server.connections.forEach(function (conn) { conn.send(strSend) });
}

process.stdin.on('keypress', function (ch, key) {
    //console.log('Key pressed: ', key);
    //todo:  Commands?
    //Will probably need to move from individual keys to line input
    if (key) {
        switch (key.name) {
            case 'q':
                //Exit process
                shutdown();
                break;
            case 'h':
                //Print Help text
                break;
        }
    }
    /*if (key && key.name == 'r') {
        pingNum = 0;
    }*/
});
//Needed for key input
process.stdin.setRawMode(true);
process.stdin.resume();