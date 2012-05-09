// showMe Admin
var SHOWME = (function() { 
    var socket;
    var customerDocument = null;

    var that = { 
        admin: 1,
        lastClicked: null,
        debug: 0,

        init: function() {
            that.connectToShowMe();
        },

        connectToShowMe: function() {
            socket = new io.connect( window.location.hostname, { port: 8899 } ); 
            var message = JSON.stringify({ role: 'A' });
            socket.on('connect', function(){ socket.send(message); });
        },

        dispatchCommand: function() {
            var command = document.getElementById('command').value;
            var customerId = document.getElementById('customerId').value;
            var argString = document.getElementById('args').value;
            that.log(
                'Dispatching command "' + command + '" to customer "'
                + customerId + '"' + ' with args ' + argString
            );
            var message = JSON.stringify({type: 'A', customerId: customerId, command: command, argString: argString});

            // Listen for an error response from server
            socket.once('message', function(rawResponse) {
                var response = JSON.parse(rawResponse); 
                if ( !that.isEmpty(response.error) ) {
                    that.log(response.error);
                }
            });

            socket.send(message);
        },

        /* log - function to log messages to the console IF debug mode is on
         */
        log: function(message) {
            if (that.debug === 1) {
                console.log(message);
            }
        },

        isEmpty: function(value) {
            if ( typeof value === "undefined" || value === null || value == '' ) {
                return 1;
            }
            else {
                return 0 
            };
        },

        /* stopEvent - Cross-browsesr compatible function to completely kill an event
         *   (current action and bubbling)
         */
        stopEvent: function(e) {
            var event = e || window.event;

            // Kill event
            event.preventDefault ? event.preventDefault() : event.returnValue = false;

            // Stop bubbling
            event.stopPropagation ? event.stopPropagation() : event.cancelBubble = false;
        },

        makeCustomerLoadCorrectPage: function() {
            document.getElementById('command').value = 'loadUrl';
            document.getElementById('args').value = JSON.stringify( { url: './customer.html?identifier=' } );
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
                that.log('empty src');
                return;
            }

            // Allow admins to prevent links from being followed and onclick
            // events from firing. Can't default to preventing actions because
            // many browsers do special things when control keys are pressed
            // (example: ctrl + click opens a link in a new tab in FF )  
            if ( e.ctrlKey ) {
                that.stopEvent(e);
            }

            var tagName = e.target ? e.target.tagName : e.srcElement.tagName;
            tagName = tagName.toLowerCase();
            that.log('You clicked: ' + tagName);
            var elements = customerDocument.getElementsByTagName(tagName);
            that.log('length: ' + elements.length);
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
            that.log('You clicked the element indexed at ' + index);
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
                    that.log(response.error);
                }
                else {
                    var customerPage = document.getElementById('customerPage');
                    customerPage.src = response.url; 
                    customerPage.onload = function() {
                        customerDocument = customerPage.contentDocument;
                        if (customerDocument.addEventListener) {
                            customerDocument.addEventListener('click', that.getClickedElement, true);
                        }
                        else {
                            customerDocument.attachEvent('onclick', that.getClickedElement);
                        }
                    };
                }
            });

            var message = JSON.stringify({ args: { customerId: customerId }, command: 'getCustomerUrl'});
            socket.send(message);
        }
    };

    return that;
})();

