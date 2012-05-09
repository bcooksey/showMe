var http = require('http');

/********** Setup static file servering **********/
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
/********** END Setup static file serving **********/

/********** Setup socket.io **********/
var io  = require('socket.io').listen(server);
var customers = {};
var admins = {};
var clientsToCustomers = {};
io.sockets.on('connection', function(client){ 

    // Determine whether this is an admin or not
    client.once('message', function(message) { newClient(message, client); });

    client.on('disconnect', function(){  
        if ( clientsToCustomers[client.id] ) {
            delete customers[ clientsToCustomers[client.id] ];
            delete clientsToCustomers[client.id];
        }
        else {
            delete admins[client.id];
        }
    }); 
}); 

function newClient(message, client) {
    var clientInfo = JSON.parse(message);
    if ( clientInfo.role === 'A' ) {
        console.log('client ' + client.id + ' is an admin');
        admins[client.id] = client;
        client.on('message', function(adminMessage) { onAdminMessage(adminMessage, client); });
    }
    else {
        if ( customers[clientInfo.id] ) {
            console.log('client ' + client.id + ' claims to be customer ' + clientInfo.id + ', but a client already has that id');
            client.send({ error: 'Sorry, there is already a customer with that id' });
            return;
        }

        console.log('client ' + client.id + ' ( ' + clientInfo.id + ' ) is a customer');
        customers[clientInfo.id] = { client: client, url: clientInfo.url };
        clientsToCustomers[client.id] = clientInfo.id;
    }  
}

// Main listener for data sent from admins
function onAdminMessage(rawMessage, client){
    message = JSON.parse(rawMessage);

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
    console.log('admin ' + client.id + ' requested ' + message.command);

    if ( message.args ) {
        console.log('args:');
        console.dir(message.args);
    }

    // TODO: call methods dynamically (but maybe not, see #16)
    var response;
    if ( message.command === 'getCustomerUrl' ) {
        response = getCustomerUrl(message.args);
    }
    else {
        response = {error: 'Invalid command'};
    }
    admins[client.id].send( JSON.stringify(response) );
}

function sendCommandToCustomer(message, client) {

    // Validate customer
    if ( isEmpty(customers[message.customerId]) ) {
        client.send( JSON.stringify({ error: 'No customer defined with id ' + message.customerId }) );
        return;
    }

    console.log('admin ' + client.id + ' gave customer ' + message.customerId + ' command ' + message.command + ' with args: ');
    console.dir(message.args);
    customers[message.customerId].client.send( JSON.stringify({command: message.command, args: message.args}) );
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

function isEmpty(value) {
    if ( typeof value === "undefined" || value === null || value == '' ) {
        return 1;
    }
    else {
        return 0 
    };
}

/********** END Helper Methods **********/
