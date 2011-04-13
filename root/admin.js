// showMe Admin
console.log('Admin pulled in');
var socket;

function connectToShowMe() {
    socket = new io.Socket( 'localhost', { port: 8899 } ); 
    socket.connect();
    socket.on('connect', function(){ socket.send('A: Hello'); });
}

function dispatchCommand() {
    var userCommand = document.getElementById('command').value;
    var userClient  = document.getElementById('client').value;
    console.log('Dispatching command "' + command + '" to client "' + client + '"');
    socket.send({type: 'A', client: userClient, command: userCommand});
}

connectToShowMe();
