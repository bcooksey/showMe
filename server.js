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

/********** Setup socket.io **********/
var io  = require('socket.io');
var socket = io.listen(server); 
var customers = {};
var admins = {};
var clientsToCustomers = {};
socket.on('connection', function(client){ 

    // Determine whether this is an admin or not
    client.once('message', function(message) { newClient(message, client); });

    client.on('disconnect', function(){  
        if ( clientsToCustomers[client.sessionId] ) {
            delete customers[ clientsToCustomers[client.sessionId] ];
            delete clientsToCustomers[client.sessionId];
        }
        else {
            delete admins[client.sessionId];
        }
    }); 
}); 

function newClient(message, client) {
    var clientInfo = JSON.parse(message);
    if ( clientInfo.role === 'A' ) {
        console.log('client ' + client.sessionId + ' is an admin');
        admins[client.sessionId] = client;
        client.on('message', function(message) { onAdminMessage(message, client); });
    }
    else {
        if ( customers[clientInfo.id] ) {
            console.log('client ' + client.sessionId + ' claims to be customer ' + clientInfo.id + ', but a client already has that id');
            client.send({ error: 'Sorry, there is already a customer with that id' });
            return;
        }

        console.log('client ' + client.sessionId + ' ( ' + clientInfo.id + ' ) is a customer');
        customers[clientInfo.id] = { client: client, url: clientInfo.url };
        clientsToCustomers[client.sessionId] = clientInfo.id;
    }  
}

// Main listener for data sent from admins
function onAdminMessage(message, client){
    // If no customerId is given, then the response is meant to be returned to
    // the admin who sent the command.
    if ( isEmpty(message.customerId) ) {
        respondToAdmin(message, client);
    }
    else {
        sendCommandToCustomer(message, client);
    }
}

function respondToAdmin(message, client) {
    console.log('admin ' + client.sessionId + ' requested ' + message.command + ' with args: ');
    console.dir(message.args);
    var args = JSON.parse(message.args);

    // TODO: call methods dynamically
    var response;
    if ( message.command === 'getCustomerUrl' ) {
        response = getCustomerUrl(args);
    }
    admins[client.sessionId].send( JSON.stringify(response) );
}

function sendCommandToCustomer(message, client) {
    console.log('admin ' + client.sessionId + ' gave customer ' + message.customerId + ' command ' + message.command + ' with args: ');
    //TODO parse message.args into a JSON array.  It's currently a string
    console.dir(message.argString);
    customers[message.customerId].client.send({command: message.command, args: message.argString});
}

/********** END Setup socket.io **********/

/********** Commands for Admins ***********/

function getCustomerUrl(args) {
    if ( isEmpty(customers[args.customerId]) ) {
        return { error: 'No customer defined with id ' + args.customerId };
    }
    else {
        return { url: customers[args.customerId].url };
    }
}

/********** END Commands for Admins **********/

/********** Helper Methods **********/

function isEmpty(value){
    if ( typeof value === "undefined" || value === null || value == '' ) {
        return 1;
    }
    else {
        return 0 
    };
}

/********** END Helper Methods **********/
