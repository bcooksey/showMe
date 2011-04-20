// showMe Admin
console.log('Admin pulled in');
var SHOWME = { admin: 1 }; // Prevent the iframe from connecting as a client
var socket;
var clientDocument = null;

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

function makeClientLoadIndex() {
    document.getElementById('command').value = 'loadUrl';
    document.getElementById('args').value = JSON.stringify( { url: '../index.html' } );
}

/* Options:
 *   CSS - Generated query supported by IE8 and others.  Have to use dojo otherwise
 *     Easy to get by stepping up ancestors, appending a bit and checking for css collisons
 *   XPath - gaurenteed unique. IE in its own realm for evaluation (and position indexing!!!), but it hasn't changed.
 *     Harder to make?
 *   Item() - Determine element's index, rooted from simple query like all tags within body or all p tags.
 *     Dynamically created markup changes indexing
 */
function getClickedElement(e){
    var tagName = e.target.tagName.toLowerCase();
    console.debug('You clicked: ' + tagName);
    var elements = clientDocument.getElementsByTagName(tagName);
    console.log('length: ' + elements.length);
    var index = 0;
    while ( index < elements.length ) {
        if ( elements.item(index) == e.target ) {
            break;
        }
        else {
            index++;
        }
    }
    SHOWME.lastClicked = { tag: tagName, index: index };
    document.getElementById('args').value = JSON.stringify(SHOWME.lastClicked);
    console.log('You clicked the element indexed at ' + index);
}

window.onload = function() {
    connectToShowMe();
    //TODO Make this IE compatible (attachEvent)
    clientDocument = document.getElementById('clientPage').contentDocument;
    clientDocument.addEventListener('click', getClickedElement, true);
};
