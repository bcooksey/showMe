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
    var client  = document.getElementById('client').value;
    console.log('Dispatching command "' + command + '" to client "' + client + '"');
    socket.send('A|' + client + '|' + command);
}

connectToShowMe();
