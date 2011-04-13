// showMe Client
console.log('Client pulled in');

function connectToShowMe() {
    var socket = new io.Socket( 'localhost', { port: 8899 } ); 
    socket.connect();
    socket.on('connect', function(){ socket.send('C: Hello'); });
    socket.on('message', function(message){ console.log('Received: ' + message); });
//    socket.on('disconnect', function(){});

}

connectToShowMe();
