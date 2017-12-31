// Avoid `console` errors in browsers that lack a console.
(function() {
    var method;
    var noop = function () {};
    var methods = [
        'assert', 'clear', 'count', 'debug', 'dir', 'dirxml', 'error',
        'exception', 'group', 'groupCollapsed', 'groupEnd', 'info', 'log',
        'markTimeline', 'profile', 'profileEnd', 'table', 'time', 'timeEnd',
        'timeline', 'timelineEnd', 'timeStamp', 'trace', 'warn'
    ];
    var length = methods.length;
    var console = (window.console = window.console || {});

    while (length--) {
        method = methods[length];

        // Only stub undefined methods.
        if (!console[method]) {
            console[method] = noop;
        }
    }
}());




// Place any jQuery/helper plugins in here.
intializeFirebase();



function intializeFirebase() {
    // Initialize Firebase
    var config = {
        apiKey: "AIzaSyDAQ6XGtO7wdOB-y-e6ApA3WjPh9AZCYww",
        authDomain: "celebre-45714.firebaseapp.com",
        databaseURL: "https://celebre-45714.firebaseio.com",
        projectId: "celebre-45714",
        storageBucket: "celebre-45714.appspot.com",
        messagingSenderId: "71736615331"
    };
    firebase.initializeApp(config);
}
