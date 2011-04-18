// showMe Admin
console.log('Admin pulled in');
var socket;

function connectToShowMe() {
    socket = new io.Socket( 'localhost', { port: 8899 } ); 
    socket.connect();
    socket.on('connect', function(){ socket.send('A: Hello'); });
}

function dispatchCommand() {
    var command = document.getElementById('command').value;
    var clientId  = document.getElementById('client').value;
    var argString = document.getElementById('args').value;
    console.log('Dispatching command "' + command + '" to client "' + clientId + '"' + ' with args ' + argString);
    socket.send({type: 'A', client: clientId, command: command, argString: argString});
}

function makeClientLoadIndex() {}

connectToShowMe();
