// showMe Client
console.log('Client pulled in');

function connectToShowMe() {
    if ( typeof window.parent.SHOWME !== 'undefined' && window.parent.SHOWME.admin === 1 ) {
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
    var args = JSON.parse(message.args);
    window[message.command](args);
}

function loadURL(args) {
    console.log('Loading url: ' + args);
    window.location = args; 
}

function highlightElement(args) {
    console.debug('Highlighting');
    console.dir(args);
}

connectToShowMe();
