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

/* Options:
 *   CSS - Generated query supported by IE8 and others.  Have to use dojo otherwise
 *     Easy to get by stepping up ancestors, appending a bit and checking for css collisons
 *   XPath - gaurenteed unique. IE in its own realm for evaluation (and position indexing!!!), but it hasn't changed.
 *     Harder to make?
 */
function getSelectedElement(e){
    console.debug('The ' + e.target + ' was clicked');
    var anchor = document.evaluate('//a', document, null, XPathResult.ANY_TYPE, null);
    console.debug(anchor.iterateNext().textContent);
}


connectToShowMe();
//TODO Make this IE compatible (attachEvent)
document.addEventListener('click', getSelectedElement, true);
