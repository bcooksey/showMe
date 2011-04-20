// showMe Client
console.log('Client pulled in');

var SHOWME = {};
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

function loadUrl(args) {
    console.log('Loading url: ' + args.url);
    window.location = args.url; 
}

function highlightElement(args) {
    console.debug('Highlighting');

    // Remove highlighting from previous element
    if ( SHOWME.lastElementHighlighted ) {
        SHOWME.lastElementHighlighted.style.backgroundColor = ''; 
    }

    // Scroll to the chosen element
    var element = document.getElementsByTagName(args.tag).item(args.index);
    window.scrollTo(0, element.offsetTop);

    // Highlight the element
    element.style.backgroundColor = '#CCCC33';
    SHOWME.lastElementHighlighted = element;
}

connectToShowMe();
