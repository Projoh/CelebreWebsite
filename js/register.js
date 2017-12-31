

$( document ).ready(function() {
    intializePanelPageMover();
    initializeSignupRedirectListener();
    initializeInvisibleCaptcha();
});

const SPEED_SLOW = 200; // Full page transitions
const SPEED_MEDIUM = 175; // Entering Screen
const SPEED_FAST = 150; // Leaving Screen

var user;
var phoneNumber;
var allowPhoneSignUp;
function initializeSignupRedirectListener() {
    firebase.auth().getRedirectResult().then(function(result) {
        if (result.credential) {
            // This gives you a Google Access Token. You can use it to access the Google API.
            var token = result.credential.accessToken;
            // ...
        }
        // The signed-in user info.
        user = result.user;
        if(user) {
            var formInitialAuth = $('#initialauth');
            markFormAsCompletedAndSubmit(formInitialAuth);
        }
    }).catch(function(error) {
        // Handle Errors here.
        var errorCode = error.code;
        var errorMessage = error.message;
        // The email of the user's account used.
        var email = error.email;
        // The firebase.auth.AuthCredential type that was used.
        var credential = error.credential;
        // ...
    });


}

function intializePanelPageMover() {
    var allForms = $('.panel form');
    var panelBackButtons = $('.panel-back-button');
    var goToFirstPanelButtons = $('.go-to-first');
    allForms.submit(function( event ){
        event.preventDefault();
        var thisForm = $(this);

        if(!formIsValid(thisForm)){
            return;
        }

        var thisPanel = thisForm.parent('.panel');
        var nextPanel = thisPanel.first().next('.panel');

        moveToNextPanel(thisPanel, nextPanel);
    });

    panelBackButtons.each(function () {
        $(this).click(function () {
            var backButton = $(this);
            var currentPanel = backButton.parent();
            var prevPanel = currentPanel.prev();

            moveToNextPanel(currentPanel, prevPanel);
        });
    });

    goToFirstPanelButtons.each(function () {
        $(this).click(function () {
            var clickedButton = $(this);
            var currentPanel = clickedButton.parent();
            var mainPanel = $('#mainPanel');

            moveToNextPanel(currentPanel, mainPanel);
        });
    })

}
function moveToNextPanel(panel1, panel2) {
    fadeOutToLeft(panel1, SPEED_FAST, enterNextPanel);

    function enterNextPanel() {
        fadeInFromLeft(panel2, SPEED_MEDIUM);
        panel2.find('form').first().submit();
    }
}

function initializeInvisibleCaptcha() {
    window.recaptchaVerifier = new firebase.auth.RecaptchaVerifier('submitPhoneNumber', {
        'size': 'invisible',
        'callback': function(response) {
            // reCAPTCHA solved, allow signInWithPhoneNumber.
            signUpPhoneNumber();
        }
    });
}

function formIsValid(form) {
    var toggle = form[0][0].value;
    if(toggle != "1") {
        return false;
    }
    return true;
}

function signUpPhoneNumber() {
    scrollToTop();
        var phoneNumber = '+1' + $('#staticNumber').val();
        var appVerifier = window.recaptchaVerifier;
        firebase.auth().signInWithPhoneNumber(phoneNumber, appVerifier)
            .then(function (confirmationResult) {
                // SMS sent. Prompt user to type the code from the message, then sign the
                // user in with confirmationResult.confirm(code).
                var phoneNumberForm = $('#phoneNumberAuth');
                window.confirmationResult = confirmationResult;
                markFormAsCompletedAndSubmit(phoneNumberForm);
            }).catch(function (error) {
            // Error; SMS not sent
            // ...
            window.recaptchaVerifier.render().then(function(widgetId) {
                grecaptcha.reset(widgetId);
            });
        });
}

function submitVerfCode() {
    var code = $('#staticVerfCode').val();
    confirmationResult.confirm(code).then(function (result) {
        // User signed in successfully.
        var user = result.user;
        phoneNumber = $('#staticNumber');
        var currentForm = $('#phoneNumberAuth2');
        var initalAuthForm = $('#initialauth');

        markFormAsCompletedAndSubmit(currentForm);
        markFormAsCompletedAndSubmit(initalAuthForm);
    }).catch(function (error) {
        // User couldn't sign in (bad verification code?)
        // ...
    });
}

function goToPhoneNumber() {
    var mainPanel = $('#initialauth').parent('.panel');
    var phoneNumberPanel = mainPanel.prev().prev();

    moveToNextPanel(mainPanel, phoneNumberPanel);
}

function signUpGoogle() {
    var provider = new firebase.auth.GoogleAuthProvider();
    firebase.auth().signInWithRedirect(provider);
}

function signUpFacebook() {
    var provider = new firebase.auth.FacebookAuthProvider();
    firebase.auth().signInWithRedirect(provider);
}


function fadeOutToLeft(object, speed, functionToExecute) {
    scrollToTop();
    object.animate({
        opacity: 0,
        paddingLeft: "64",
    }, speed, function() {
        hideObject();
        if(functionToExecute){
            functionToExecute();
        }
    });
    function hideObject() {
        object.addClass("hidden-panel");
    }
}

function requestLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(positionSuccess, positionError);
    } else {
        // x.innerHTML = "Geolocation is not supported by this browser.";
    }
}

function storeUserLocation(position) {
    // TODO:
}

function positionSuccess(position) {
    var locationForm = $('#locationServices');
    markFormAsCompletedAndSubmit(locationForm);
    storeUserLocation(position);
    // x.innerHTML = "Latitude: " + position.coords.latitude +
    //     "<br>Longitude: " + position.coords.longitude;
}

function positionError(error) {
    switch(error.code) {
        case error.PERMISSION_DENIED:
            // x.innerHTML = "User denied the request for Geolocation."
            break;
        case error.POSITION_UNAVAILABLE:
            // x.innerHTML = "Location information is unavailable."
            break;
        case error.TIMEOUT:
            // x.innerHTML = "The request to get user location timed out."
            break;
    }
}

function markFormAsCompletedAndSubmit (form) {
    var input = form.children('.toggle').first();
    input.val("1");
    form.submit();
}

function manualEnterInfo() {
    var initForm = $('#initialauth');
    markFormAsCompletedAndSubmit(initForm);
}

function fadeInFromLeft(object, speed) {
    object.removeClass("hidden-panel");
    object.css("padding-left", "16px");
    object.animate({
        opacity: 1,
        paddingLeft: "0"
    }, speed, function() {
        // Animation complete.
    });
}

function scrollToTop() {
    $("html, body").animate({ scrollTop: 0 }, SPEED_SLOW);
}
