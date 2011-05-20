// showMe Admin
console.log('Admin pulled in');

var SHOWME = (function() { 
    var socket;
    var clientDocument = null;

    var that = { 
        admin: 1,
        lastClicked: null,

        init: function() {
            this.connectToShowMe();
            //TODO Make this IE compatible (attachEvent)
            clientDocument = document.getElementById('clientPage').contentDocument;
            clientDocument.addEventListener('click', that.getClickedElement, true);
        },

        connectToShowMe: function() {
            socket = new io.Socket( 'localhost', { port: 8899 } ); 
            socket.connect();
            var message = JSON.stringify({ role: 'A' });
            socket.on('connect', function(){ socket.send(message); });
        },

        dispatchCommand: function() {
            var command = this.getCommand();
            var client  = this.getClient();
            var argString = this.getArgs();
            console.log('Dispatching command "' + command + '" to client "' + client + '"' + ' with args ' + argString);
            socket.send({type: 'A', client: client, command: command, argString: argString});
        },

        // Simple getter methods
        getCommand: function() { return document.getElementById('command').value; },
        getClient: function() { return document.getElementById('client').value; },
        getArgs: function() { return document.getElementById('args').value; },

        isEmpty: function(value) {
            if ( typeof value === "undefined" || value === null || value == '' ) {
                return 1;
            }
            else {
                return 0 
            };
        },

        makeClientLoadIndex: function() {
            document.getElementById('command').value = 'loadUrl';
            document.getElementById('args').value = JSON.stringify( { url: '../index.html' } );
        },

        /* Options:
         *   CSS - Generated query supported by IE8 and others.  Have to use dojo otherwise
         *     Easy to get by stepping up ancestors, appending a bit and checking for css collisons
         *   XPath - gaurenteed unique. IE in its own realm for evaluation (and position indexing!!!), but it hasn't changed.
         *     Harder to make?
         *   Item() - Determine element's index, rooted from simple query like all tags within body or all p tags.
         *     Dynamically created markup changes indexing
         */
        getClickedElement: function(e){
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
            this.lastClicked = { tag: tagName, index: index };
            document.getElementById('args').value = JSON.stringify(this.lastClicked);
            console.log('You clicked the element indexed at ' + index);
        },

        loadClientUrl: function() {
            var client = this.getClient();
            if ( that.isEmpty(client) ) {
                console.warn('No client');
                return;
            } 

            // Setup listener first so we don't have a race condition
            socket.once('message', function(rawResponse) {
                var response = JSON.parse(rawResponse); 
                if ( !that.isEmpty(response.error) ) {
                    console.error( response.error );
                }
                else {
                   document.getElementById('clientPage').src = response.url; 
                }
            });

            var args = JSON.stringify({ client: client });
            socket.send({ args: args, command: 'getClientUrl'}); 
        }
    };

    return that;
})();

