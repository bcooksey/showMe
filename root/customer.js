// showMe Customer
console.log('Customer pulled in');

var SHOWME = (function (){

    var socket = null;
    var lastElementHighlighted = null;
    // Socket.io works through callbacks, so we need an accessible
    // reference to this module.
    var that = {
        customer: 1,
        identifier: null,

        init: function() {
            this.connectToShowMe();
        },

        connectToShowMe: function() {
            if ( typeof window.parent.SHOWME !== 'undefined' && window.parent.SHOWME.admin === 1 ) {
                return;
            }
            socket = new io.Socket( 'localhost', { port: 8899 } ); 
            socket.connect();
            var clientInfo = JSON.stringify({ 
                role: 'C',
                id: that.identifier,
                url: window.location.href
            });
            socket.on('connect', function(){ socket.send(clientInfo) });
            socket.on('message', that.onMessage);
            //    socket.on('disconnect', function(){});
        },

        onMessage: function(message) {
            console.log('Received: ' + message.command);
            var args = JSON.parse(message.args);
            that[message.command](args);
        },

        loadUrl: function(args) {
            console.log('Loading url: ' + args.url);
            window.location = args.url; 
        },

        highlightElement: function(args) {
            console.debug('Highlighting');

            // Remove highlighting from previous element
            if ( lastElementHighlighted ) {
                lastElementHighlighted.style.backgroundColor = ''; 
            }

            // Scroll to the chosen element
            var element = document.getElementsByTagName(args.tag).item(args.index);
            window.scrollTo(0, element.offsetTop);

            // Highlight the element
            element.style.backgroundColor = '#CCCC33';
            lastElementHighlighted = element;
        }
    };
    return that;
})();

