function initializeAuthStateListener() {
    firebase.auth().onAuthStateChanged(function(user) {
        if (user) {
            firebase.database().ref('/users/' + user.uid +'/username').once('value').then(function(snapshot) {
                var usersnap = snapshot.val();
                if(usersnap) {
                    if(userIsLoggingIn){
                        updateTimeStamp('users/'+user.uid+"/last_login", delayedFunction);
                    } else {
                        delayedFunction();
                    }


                    function delayedFunction() {
                        document.location = "home.html";
                    }
                } else {
                    $('#userDoesntExistPopUp').modal('show');
                }
            });
        } else {

        }
    });
}

const SPEED_SLOW = 200; // Full page transitions
const SPEED_MEDIUM = 175; // Entering Screen
const SPEED_FAST = 150; // Leaving Screen

var userIsLoggingIn;
var database = firebase.database();

$( document ).ready(function() {
    initializeInvisibleCaptcha();
    initializeSignupRedirectListener();
    intializePanelPageMover();
    initializeAuthStateListener();
    intializeVerfCodeListener();
});

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
            var prevForm = prevPanel.find('form');

            resetForm(prevForm);
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

    function formIsValid(form) {
        var toggle = form[0][0].value;
        if(toggle != "1") {
            return false;
        }
        return true;
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
function initializeSignupRedirectListener() {
    firebase.auth().getRedirectResult().then(function(result) {
        userIsLoggingIn = true;
    }).catch(function(error) {
        var errorCode = error.code;
        var errorMessage = error.message;
        // The email of the user's account used.
        var email = error.email;
        // The firebase.auth.AuthCredential type that was used.
        var credential = error.credential;

        showErrorMessage(errorMessage);
    });


}

function loginWithGoogle() {
    userIsLoggingIn = true;
    var provider = new firebase.auth.GoogleAuthProvider();
    firebase.auth().signInWithRedirect(provider);
}
function loginWithFacebook() {
    userIsLoggingIn = true;
    var provider = new firebase.auth.FacebookAuthProvider();
    firebase.auth().signInWithRedirect(provider);
}



function showLoginWithPhoneNumber() {
    var mainPanel = $('#mainPanel');
    var phoneNumberPanel = mainPanel.prev().prev();

    moveToNextPanel(mainPanel, phoneNumberPanel);
}
function signUpPhoneNumber() {
    scrollToTop();
    phoneNumber = '+1' + $('#staticNumber').val();
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
    userIsLoggingIn = true;
    var code = $('#staticVerfCode').val();
    confirmationResult.confirm(code).then(function (result) {
        // User signed in successfully.
        phoneNumber = $('#staticNumber').val();
        markFormAsCompletedAndSubmit($('#phoneNumberAuth2'))
    }).catch(function (error) {
        var staticNum = $('#staticNumber');
        showSnackBar("Verifcation Code was incorrect, please try again.");
        staticNum.html("");
    });
}
function intializeVerfCodeListener() {
    var verfCode = $('#staticVerfCode');

    verfCode.on("change paste keyup", function() {
        var vCode = $(this);
        var value = vCode.val();
        if (value.length > 5) {
            submitVerfCode();
        }
    });
}


function showManualEnterInfo() {
    var customAuthElement = $('#customAuth');
    var manaulElement = $('#manual-info');
    var showEmailPassElement = $('#enterEmailPasswordButton');
    var submitEmailPassElement = $('#submitEmailPasswordButton');

    moveToNextPanel(customAuthElement, manaulElement);
    showEmailPassElement.addClass('hidden-panel');
    submitEmailPassElement.removeClass('subtitle hidden-panel');
}
function signInWithEmailAndPassword() {
    var emailSmallElement = $('#emailSmall').val();
    var emailLargeElement = $('#emailLarge').val();
    var passwordSmallElement = $('#passwordSmall').val();
    var passwordLargeElement= $('#passwordLarge').val();
    var emailText = (emailSmallElement.length > emailLargeElement.length) ?
        emailSmallElement : emailLargeElement;
    var passwordText = (passwordSmallElement.length > passwordLargeElement.length) ?
        passwordSmallElement : passwordLargeElement;

    firebase.auth().signInWithEmailAndPassword(emailText, passwordText).catch(function(error) {
        // Handle Errors here.
        var errorCode = error.code;
        var errorMessage = error.message;
        showErrorMessage(errorMessage);
    });
}



function logOut() {
    firebase.auth().signOut().then(function() {
        $('#userDoesntExistPopUp').modal('hide');
    }).catch(function(error) {
        // An error happened.
    });
}
function rediretToRegister() {
    document.location = "register.html";
}


function updateTimeStamp(location, functionAfter) {
    var currentTime = Math.round(new Date().getTime() / 1000);
    inputKeyValue(location, currentTime, functionAfter);
}
function incrementDatabaseValue(location, functionAfter) {
    var reference = database.ref(location);

    reference.transaction(function(currentValue) {
        return currentValue + 1;
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



function showErrorMessage(message) {
    var errorElement = $('#loginErrorMessage');
    errorElement.html(message);
}

function moveToNextPanel(panel1, panel2) {
    fadeOutToLeft(panel1, SPEED_FAST, enterNextPanel);

    function enterNextPanel() {
        fadeInFromLeft(panel2, SPEED_MEDIUM);
        panel2.find('form').first().submit();
    }
}

function markFormAsCompletedAndSubmit (form) {
    var input = form.children('.toggle').first();
    input.val("1");
    form.submit();
}

function moveToNextPanelWithoutSubmit(panel1, panel2) {
    fadeOutToLeft(panel1, SPEED_FAST, enterNextPanel);

    function enterNextPanel() {
        fadeInFromLeft(panel2, SPEED_MEDIUM);
    }
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

function scrollToTop() {
    $("html, body").animate({ scrollTop: 0 }, SPEED_SLOW);
}

function showSnackBar(message) {
    var snackBarItem = document.getElementById("snackbar")

    // Add the "show" class to DIV
    snackBarItem.className = "show";
    snackBarItem.innerHTML = message;

    // After 3 seconds, remove the show class from DIV
    setTimeout(function(){ snackBarItem.className = snackBarItem.className.replace("show", ""); }, 3000);
}
