var http = require('http');

// Setup static file servering
var paperboy = require('paperboy');
var path = require('path');
var WEBROOT = path.join(path.dirname(__filename), 'root');
var server = http.createServer(function(req, res){ 
    paperboy
        .deliver(WEBROOT, req, res)
        .addHeader('Expires', 300)
        .addHeader('X-PaperRoute', 'Node')
        .before(function() {
            console.log('Received Request');
        })
        .after(function(statCode) {
            console.log('Served ' + req.url);
        })
        .error(function(statCode, msg) {
            res.writeHead(statCode, {'Content-Type': 'text/plain'});
            res.end("Error " + statCode);
            console.log(statCode + ', ' + req.url + ', ' + msg);
        })
    ;
});
server.listen(8899);

// Setup socket.io 
var io  = require('socket.io');
var socket = io.listen(server); 
var customers = {};
var admins = {};
socket.on('connection', function(client){ 

    // Determine whether this is an admin or not
    client.once('message', function(message) { newClient(message, client); });

    client.on('disconnect', function(client){  
        // Anything to do?  
      
    }); 
}); 

var adminRegExp = new RegExp('^A');
function newClient(message, client) {
    if ( adminRegExp.test(message) ) {
        console.log('client ' + client.sessionId + ' is an admin');
        admins[client.sessionId] = client;
        client.on('message', function(message) { onAdminMessage(message, client); });
    }
    else {
        var customerId = message.substr(2);
        console.log('client ' + client.sessionId + ' ( ' + customerId + ' ) is a customer');
        customers[customerId] = client;
    }  
}

function onAdminMessage(message, client){
    console.log('admin ' + client.sessionId + ' gave client ' + message.client + ' command ' + message.command + ' with args: ');
    //TODO parse message.args into a JSON array.  It's currently a string
    console.dir(message.argString);
    customers[message.client].send({command: message.command, args: message.argString});
}

