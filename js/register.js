function initializeAuthStateListener() {
    firebase.auth().onAuthStateChanged(function(user) {
        if (user) {
            // User is signed in.
            if(createUserWithPassword) {
                processNewUser(user);
            }
        } else {
            // No user is signed in.
        }
    });
}

$( document ).ready(function() {
    intializePanelPageMover();
    initializeSignupRedirectListener();
    initializeInvisibleCaptcha();
    initializeAuthStateListener();
});

const SPEED_SLOW = 200; // Full page transitions
const SPEED_MEDIUM = 175; // Entering Screen
const SPEED_FAST = 150; // Leaving Screen

var user;
var name="", email="", photoUrl="", uid="", emailVerified="",timeStamp="",
    username="",lat="",long ="";
var phoneNumber = "";

var database = firebase.database();
var createUserWithPassword = false;
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
            processNewUser(user);
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

function resetForm(form) {
    var toggle = form[0][0];
    toggle.value = 0;
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

function processNewUser(user) {
    // var user = firebase.auth().currentUser;

    if (user != null) {
        name = user.displayName;
        email = user.email;
        photoUrl = user.photoURL;
        emailVerified = user.emailVerified;
        uid = user.uid;  // The user's ID, unique to the Firebase project. Do NOT use
                         // this value to authenticate with your backend server, if
                         // you have one. Use User.getToken() instead.

        timeStamp = Math.round(new Date().getTime() / 1000);

        // PUT IN INFORMATION

        setTimeout(updateUserDataOnServer, 50);
    }



    if(email || phoneNumber){
        deleteManualPanels();
        markFormAsCompletedAndSubmit($('#initialauth'));
    }



    function deleteManualPanels() {
        var manualPanels = $('.manual-entry');
        manualPanels.remove();
    }
}

function updateUserDataOnServer(nextfunction) {
    if(name == 'null' || name == ""){
        name = username;
    }
    var userRef = database.ref('users/' + uid);
    userRef.update({
        real_name: name,
        email: email,
        photo_url: photoUrl,
        phone_number: phoneNumber,
        register_cords: lat + "_" + long,
        username: username,
        timestamp: timeStamp
    }).then(function () {
        if(nextfunction){
            nextfunction();
        }
    });
}

function submitVerfCode() {
    var code = $('#staticVerfCode').val();
    confirmationResult.confirm(code).then(function (result) {
        // User signed in successfully.
        phoneNumber = $('#staticNumber').val();
        processNewUser(result.user);
        markFormAsCompletedAndSubmit($('#phoneNumberAuth2'))
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
   lat = position.coords.latitude;
   long = position.coords.longitude;
}

function positionSuccess(position) {
    var locationForm = $('#locationServices');
    storeUserLocation(position);



    updateUserDataOnServer(anonFunction)
    function anonFunction() {
        markFormAsCompletedAndSubmit(locationForm);
    }
}

function positionError(error) {
    var errorMessage = $('#location-error');
    switch(error.code) {
        case error.PERMISSION_DENIED:
            errorMessage.html("User denied the request for Geolocation.");
            // x.innerHTML =
            break;
        case error.POSITION_UNAVAILABLE:
            errorMessage.html("Location information is unavailable.<br>" +
                "Please try again later");
            break;
        case error.TIMEOUT:
            errorMessage.html("Your connection seems to be poor.<br>" +
                "Please try again later");
            break;
    }
}

function markFormAsCompletedAndSubmit (form) {
    var input = form.children('.toggle').first();
    input.val("1");
    form.submit();
}

function markFormAsCompleted(form) {
    var input = form.children('.toggle').first();
    input.val("1");
}

function manualEnterInfo() {
    var initForm = $('#initialauth');
    markFormAsCompletedAndSubmit(initForm);
}

function manualEnterEmail() {
    var emailForm = $('#emailForm');
    var emailText = $('#emailInput');

    if(validateEmail(emailText.val())){
        email = emailText.val().toLowerCase();
        markFormAsCompletedAndSubmit(emailForm);
    } else {
        emailText.addClass('is-invalid');
    }
}

function submitPassword() {
    var password = $('#passwordInput').val();
    createUserWithPassword = true;

    firebase.auth().createUserWithEmailAndPassword(email, password).catch(function(error) {
        // Handle Errors here.
        var errorElement = $('#password-error');
        var errorCode = error.code;
        var errorMessage = error.message;

        errorElement.html(errorMessage);
    });
}

function enterDisplayName() {
    var displayForm = $('#usernameForm');
    var usernameInput = $('#username');
    var userText = sanitizeInput(usernameInput.val());

    if(userText < 5 || userText > 20) {
        showUsernameError("Username must be between 5 and 20 regular characters and numbers.");
    } else {
        if(userText.length < 1){
            showUsernameError("Username must be between 5 and 20 regular characters and numbers.");
            return;
        }
        firebase.database().ref('/usernames/' + userText.toLowerCase()).once('value').then(function(snapshot) {
            var usersnap = (snapshot.val() && snapshot.val().username);
            if(usersnap) {
                showUsernameError("Username is already taken.<br> Please try another one");
                return;
            }
            username = userText;
            updateUserDataOnServer(anonFun);
            function anonFun() {
                addToListOfUsers();
                markFormAsCompletedAndSubmit(displayForm);

                function addToListOfUsers() {
                    database.ref('/usernames/'+username.toLowerCase()).set(true);
                }
            }
        });


    }

    function showUsernameError(error) {
        var errorSlot = $('#username-error');

        errorSlot.html(error);
    }
}


function validateEmail(email) {
    var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(email.toLowerCase());
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

function sanitizeInput(input) {
    return input.replace(/[&\/\\#,+()$~%'":*?<>{}]/g, '');
}

function User() {

}
