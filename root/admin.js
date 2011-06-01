// showMe Admin
console.log('Admin pulled in');

var SHOWME = (function() { 
    var socket;
    var customerDocument = null;

    var that = { 
        admin: 1,
        lastClicked: null,

        init: function() {
            that.connectToShowMe();
        },

        connectToShowMe: function() {
            socket = new io.Socket( 'localhost', { port: 8899 } ); 
            socket.connect();
            var message = JSON.stringify({ role: 'A' });
            socket.on('connect', function(){ socket.send(message); });
        },

        dispatchCommand: function() {
            var command = document.getElementById('command').value;
            var customerId = document.getElementById('customerId').value;
            var argString = document.getElementById('args').value;
            console.log(
                'Dispatching command "' + command + '" to customer "'
                + customerId + '"' + ' with args ' + argString
            );
            socket.send({type: 'A', customerId: customerId, command: command, argString: argString});
        },

        isEmpty: function(value) {
            if ( typeof value === "undefined" || value === null || value == '' ) {
                return 1;
            }
            else {
                return 0 
            };
        },

        makeCustomerLoadCorrectPage: function() {
            document.getElementById('command').value = 'loadUrl';
            document.getElementById('args').value = JSON.stringify( { url: './customer.html' } );
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
            if ( that.isEmpty(document.getElementById('customerPage').src) ) {
                console.info('empty src');
                return;
            }

            // Allow admins to prevent links from being followed and onclick
            // events from firing. Can't default to preventing actions because
            // many browsers do special things when control keys are pressed
            // (example: ctrl + click opens a link in a new tab in FF )  
            if ( e.ctrlKey ) {
                e.preventDefault();
                e.stopPropagation(); //FIXME: BROKEN FOR IE
            }

            var tagName = e.target.tagName.toLowerCase();
            console.debug('You clicked: ' + tagName);
            var elements = customerDocument.getElementsByTagName(tagName);
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
            that.lastClicked = { tag: tagName, index: index };
            document.getElementById('args').value = JSON.stringify(that.lastClicked);
            console.log('You clicked the element indexed at ' + index);
            document.getElementById('command').value = 'highlightElement';
        },

        loadCustomerUrl: function() {
            var customerId = document.getElementById('customerId').value;
            if ( that.isEmpty(customerId) ) {
                console.warn('No customer id specified');
                return;
            } 

            // Setup listener first so we don't have a race condition
            socket.once('message', function(rawResponse) {
                var response = JSON.parse(rawResponse); 
                if ( !that.isEmpty(response.error) ) {
                    console.error( response.error );
                }
                else {
                    //FIXME Make this IE compatible (attachEvent)
                    var customerPage = document.getElementById('customerPage');
                    customerPage.src = response.url; 
                    customerPage.onload = function() {
                        customerDocument = customerPage.contentDocument;
                        customerDocument.addEventListener('click', that.getClickedElement, true);
                    };
                }
            });

            var args = JSON.stringify({ customerId: customerId });
            socket.send({ args: args, command: 'getCustomerUrl'}); 
        }
    };

    return that;
})();

