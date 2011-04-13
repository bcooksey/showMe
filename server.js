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
var customers;
var admins;
socket.on('connection', function(client){ 
    // Determine whether this is an admin or not
//    client.once('message', function(message, client) {
//        

//    });

    customers[client.sessionId] = client;
    client.on('message', function(message) {
        client.send('Echo: ' + message); 
    });
  
    client.on('disconnect', function(client){  
        // Anything to do?  
      
    }); 
}); 

