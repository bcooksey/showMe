// showMe Client
console.log('Client pulled in');

function connectToShowMe() {
    if ( SHOWME.admin ) {
        return;
    }
    var socket = new io.Socket( 'localhost', { port: 8899 } ); 
    socket.connect();
    socket.on('connect', function(){ socket.send('C:' + showMeIdentifier); });
    socket.on('message', onMessage);
//    socket.on('disconnect', function(){});

}

function onMessage(message) {
    console.log('Received: ' + message.command);
    window[message.command](message.args);
}

function loadURL(args) {
    console.log('Loading url: ' + args);
    window.location = args; 
}

connectToShowMe();
