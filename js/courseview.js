function initializeAuthStateListener() {
    firebase.auth().onAuthStateChanged(function(user) {
        if (user) {
            checkFirstCourse();
        } else {
            // No user is signed in.
            document.location = "login.html";
        }
    });
}

const SPEED_SLOW = 200; // Full page transitions
const SPEED_MEDIUM = 175; // Entering Screen
const SPEED_FAST = 150; // Leaving Screen
const FIFTEEN_MINUTES = 900; // In Seconds
const ONE_HOUR =  3600; // IN SECONDS


var database = firebase.database();



$( document ).ready(function() {
    intializePanelPageMover();
    initializeAuthStateListener();
});

// NETWORK STUFF
function updateTimeStamp(location, functionAfter) {
    var currentTime = Math.round(new Date().getTime() / 1000);
    inputKeyValue(location, currentTime, functionAfter);
}
function incrementDatabaseValue(location, amount, functionAfter) {
    var reference = database.ref(location);

    reference.transaction(function(currentValue) {
        return currentValue + amount;
    }, function (error) {
        if(functionAfter) {
            functionAfter();
        }
    });

}
function inputKeyValue(key, value, functionAfter) {
    var reference = database.ref(key);
    reference.set(value).then(function () {
        if(functionAfter){
            functionAfter();
        }
    });
}
function attemptToAskQuestion(afterFunction) {

}
function fetchData(location,functionSuccess, functionFail) {
    var reference = database.ref(location);

    reference.once('value').then(function(snapshot) {
        var value = snapshot.val();
        if(value) {
            if(functionSuccess){
                functionSuccess(value);
            }
        } else {
            functionFail();
        }
    });
}
function userConfirmedItem(functionAfter) {
    var user = firebase.auth().currentUser;
    incrementDatabaseValue('users/'+user.uid+'/confirmations', 1, updatetime);
    function updatetime() {
        updateTimeStamp('users/'+user.uid+'/last_confirmation', functionAfter);
    }
}
function reportByUID(reportedUID) {
    incrementDatabaseValue('reports/'+schoolID+'/'+reportedUID, 1, userReportedItem);
}
function userReportedItem() {
    var user = firebase.auth().currentUser;
    incrementDatabaseValue('users/'+user.uid+'/reports_given', 1, updatetime);
    function updatetime() {
        updateTimeStamp('users/'+user.uid+'/last_confirmation');
    }
}
function encodeText(text) {
    return encodeURIComponent(text).replace(/\./g, '%2E');
}
function decodeText(text) {
    return decodeURIComponent(text.replace('%2E', '.'));
}
function requestNotificationPermissions(afterFunction) {
    const messaging = firebase.messaging();
    messaging.requestPermission()
        .then(function() {
            console.log('Notification permission granted.');
            // TODO(developer): Retrieve an Instance ID token for use with FCM.
            retrieveMessagingToken();
        })
        .catch(function(err) {
            showSnackBar('Unable to get permission to notify. ' + err.message);
            afterFunction();
        });

    function retrieveMessagingToken() {
        messaging.getToken()
            .then(function(currentToken) {
                if (currentToken) {
                    sendTokenToServer(currentToken, afterFunction);
                } else {
                    // Show permission request.
                    console.log('No Instance ID token available. Request permission to generate one.');
                    // Show permission UI.
                    // updateUIForPushPermissionRequired();
                    // setTokenSentToServer(false);
                }
            })
            .catch(function(err) {
                console.log('An error occurred while retrieving token. ', err);
                // showToken('Error retrieving Instance ID token. ', err);
                // setTokenSentToServer(false);
            });
    }
}
function allowNotifications() {
    requestNotificationPermissions(redirectToFirstPanel);
}
function sendTokenToServer(currentToken, afterFunction) {
    var user = firebase.auth().currentUser;
    inputKeyValue('user_tokens/'+user.uid, currentToken ,afterFunction);
}
