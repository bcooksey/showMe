// showMe Admin
console.log('Admin pulled in');
var socket;

function connectToShowMe() {
    socket = new io.Socket( 'localhost', { port: 8899 } ); 
    socket.connect();
    socket.on('connect', function(){ socket.send('A: Hello'); });
}

function dispatchCommand() {
    var clientCommand = document.getElementById('command').value;
    var clientId  = document.getElementById('client').value;
    var clientArgs = document.getElementById('args').value;
    console.log('Dispatching command "' + clientCommand + '" to client "' + clientId + '"' + ' with args ' + clientArgs);
    socket.send({type: 'A', client: clientId, command: clientCommand, args: clientArgs});
}

function makeClientLoadIndex() {}

connectToShowMe();
