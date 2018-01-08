function initializeAuthStateListener() {
    firebase.auth().onAuthStateChanged(function(user) {
        if (user) {
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
var schoolID, crn, weekNumber, dayNumber;
var allNotes = [];
var pagesCounter = 2;


// THE WAY TO DO ALL CONFIRM/DENYS
// MAKE CHECK CLASS CHECK-MARk
// MAKE REPORT CLASS DELETE-MARK
// MAKE PARENT OF PARENT ( THE ROW ) HAVE DATA-VALUE = CURRENT STATE OF CHECKMARKS
// MAKE DOUBLE PARENT OF THE ROW(SINGLE-NOTE) HAVE DATA TYPE(NOTE/ASSIGNMENT) AND DATA ID (OBJECTID)
function intializeRatingListeners() {
    var containers = $('.container, .modal-body');

    initializeHovers();
    initializeClickers();




    function initializeClickers() {
        // CHECK MARK BUTTONS
        containers.on('click', '.row .rating-buttons .check-mark', function() {
            var item = $(this);
            if(!item.hasClass('text-primary')) {
                var parent = item.parent().parent();
                var row = parent.parent().parent();
                var state = parent.attr('data-value'); // SELECTED OR NOT-SELECTED
                var objectType = row.attr('data-type');
                var objectID = row.attr('data-id');

                if(state !== 'selected') {
                    markObjectAsConfirmed(objectType, objectID, updateUIForConfimration);
                } else {
                    undoDeleteFunction(objectType, objectID, anonFun);
                    function anonFun() {
                        resetCheckButtons(parent, checkYes);
                        function checkYes() {
                            markObjectAsConfirmed(objectType, objectID, updateUIForConfimration);
                        }
                    }
                }
                function updateUIForConfimration() {
                    item.removeClass('text-light');
                    item.removeClass('text-secondary');
                    item.addClass('text-primary');
                    parent.attr('data-value', 'selected');
                }
            }
        });
        // X MARK BUTTONS
        containers.on('click', '.row .rating-buttons .delete-mark', function() {
            var item = $(this);
            if(!item.hasClass('text-danger')) {
                var parent = item.parent().parent();
                var row = parent.parent().parent();
                var state = parent.attr('data-value'); // SELECTED OR NOT-SELECTED
                var objectType = row.attr('data-type');
                var objectID = row.attr('data-id');

                if(state !== 'selected') {
                    markObjectAsDelete(objectType, objectID, updateUIForConfimration);
                } else {
                    undoConfirmFunction(objectType, objectID, anonFun);
                    function anonFun() {
                        resetCheckButtons(parent, checkDelete);
                        function checkDelete() {
                            markObjectAsDelete(objectType, objectID, updateUIForConfimration);
                        }
                    }
                }
                function updateUIForConfimration() {
                    item.removeClass('text-light');
                    item.removeClass('text-warning');
                    item.addClass('text-danger');
                    parent.attr('data-value', 'selected');
                }
            }
        });
    }
    function initializeHovers() {
        // CHECK MARK BUTTONS
        containers.on('mouseenter', '.row .rating-buttons .check-mark', function() {
            var item = $(this);
            if(!item.hasClass('text-primary')) {
                item.removeClass('text-light');
                item.addClass('text-secondary');
            }
        });
        containers.on('mouseleave', '.row .rating-buttons .check-mark', function() {
            var item = $(this);
            if(item.hasClass('text-secondary')) {
                item.addClass('text-light');
                item.removeClass('text-secondary');
            }
        });
        // X MARK BUTTONS
        containers.on('mouseenter', '.row .rating-buttons .delete-mark', function() {
            var item = $(this);
            if(!item.hasClass('text-danger')) {
                item.removeClass('text-light');
                item.addClass('text-warning');
            }
        });
        containers.on('mouseleave', '.row .rating-buttons .delete-mark', function() {
            var item = $(this);
            if(item.hasClass('text-warning')) {
                item.addClass('text-light');
                item.removeClass('text-warning');
            }
        });
    }


    function markObjectAsDelete(objectType, objectID, functionAfter) {
        if(objectType == 'note') {
            var noteLocation = 'notes/'+schoolID+'/'+crn+'/'+weekNumber+'/'+
                dayNumber+'/'+objectID +'/reports';
            incrementDatabaseValue(noteLocation, 1, functionAfter);
        } else
        if(objectType == 'assignment') {
            var assignmentLocation = 'assignments/'+schoolID+'/'+crn+'/'+objectID +'/reports';
            incrementDatabaseValue(assignmentLocation, 1, functionAfter);
        }
        // TODO: MAKE USER NOT SEE THIS OBJECT AGAIN
    }
    function markObjectAsConfirmed(objectType, objectID, functionAfter) {
        if(objectType == 'note') {
            var noteLocation = 'notes/'+schoolID+'/'+crn+'/'+weekNumber+'/'+
                dayNumber+'/'+objectID +'/confirmations';
            incrementDatabaseValue(noteLocation, 1, functionAfter);
        } else
        if(objectType == 'assignment') {
            var assignmentLocation = 'assignments/'+schoolID+'/'+crn+'/'+objectID +'/confirmations';
            incrementDatabaseValue(assignmentLocation, 1, functionAfter);
        }
    }

    function undoDeleteFunction(objectType, objectID, functionAfter) {
        if(objectType == 'note') {
            var noteLocation = 'notes/'+schoolID+'/'+crn+'/'+weekNumber+'/'+
                dayNumber+'/'+objectID +'/reports';
            incrementDatabaseValue(noteLocation, -1, functionAfter);
        } else
        if(objectType == 'assignment') {
            var assignmentLocation = 'assignments/'+schoolID+'/'+crn+'/'+objectID +'/reports';
            incrementDatabaseValue(assignmentLocation, -1, functionAfter);
        }
    }
    function undoConfirmFunction(objectType, objectID, functionAfter) {
        if(objectType == 'note') {
            var noteLocation = 'notes/'+schoolID+'/'+crn+'/'+weekNumber+'/'+
                dayNumber+'/'+objectID +'/confirmations';
            incrementDatabaseValue(noteLocation, -1, functionAfter);
        } else
        if(objectType == 'assignment') {
            var assignmentLocation = 'assignments/'+schoolID+'/'+crn+'/'+objectID +'/confirmations';
            incrementDatabaseValue(assignmentLocation, -1, functionAfter);
        }
    }


    function resetCheckButtons(parent, functionAfter) {
        var checkYes = parent.find('h6 .check-mark');
        var deleteNo = parent.find('h6 .delete-mark');

        checkYes.removeClass('text-primary');
        deleteNo.removeClass('text-danger');

        functionAfter();
    }
}




$( document ).ready(function() {
    moment().format();
    checkURLandNavigate();
    intializePanelPageMover();
    initializeAuthStateListener();
    intializeSingleNoteHover();
    initializeImagesExpander();
    fadeInDayAndCourse();
    intializeNavBarShower();
    intializeRatingListeners();

    function fadeInDayAndCourse() {
        var card = $('.document');
        var initalfade = $('.initial-fade-in');
        fadeInFromLeft(initalfade, SPEED_SLOW);
        fadeIn(card, SPEED_SLOW);
    }
    hideProgressBar();
});
function checkURLandNavigate() {
    if (location.hash == "" || location.hash == null || location.hash == "#!") {
        location.hash = "SCHOOL#CRN#WEEKNUM#DAYNUM";
    } else {
        loadPage(location.hash);
    }
}
function loadPage(location){
    var fullLocation = location.split('#');
    if(fullLocation.length < 5){
        // TODO: EXIT ELEGANTLY
        console.log("PAGE LOCATION ISNT CORRECT");
        return;
    }
    schoolID= fullLocation[1];
    crn = fullLocation[2];
    weekNumber = fullLocation[3]-1;
    dayNumber = fullLocation[4];

    if(calculateIfDateIsInFuture()){
        // TODO: EXIT ELEGANTLY
        console.log("Date is in future...");
        return;
    }
    initializeNotes();

    function calculateIfDateIsInFuture() {
        var startTime = new moment("1-08-2018", "MM-DD-YYYY");
        var classMeets = startTime.add(weekNumber, 'weeks');
        var todaysDate = new moment();

        if(todaysDate.isBefore(classMeets)) {
            // return true;
        }
        return false;
    }
    // TODO: add logic for images in this same window at some point.
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

        moveToNextPanelWithoutSubmit(thisPanel, nextPanel);
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
    });

    function formIsValid(form) {
        var toggle = form[0][0].value;
        if(toggle != "1") {
            return false;
        }
        return true;
    }

}
function intializeSingleNoteHover() {
    var notesContainer = $('.container');

    notesContainer.on('mouseenter', '.single-note', function () {
        var itemToShow =$(this).find('.show-on-hover');
        fadeIn(itemToShow, SPEED_FAST);
    });

    notesContainer.on('mouseleave', '.single-note', function () {
        var itemToShow = $(this).find('.show-on-hover');
        fadeOut(itemToShow, SPEED_MEDIUM);
    });
}
function initializeImagesExpander() {
    var imagesExpandButton = $('.expand-images-button');
    var imagesContainer = $('#images-container');
    imagesContainer.slideToggle('fast');
    imagesExpandButton.click(function () {
        fadeInFromTop(imagesContainer, SPEED_SLOW);
    })
}
function intializeNavBarShower() {
    var button = $('.show-nav-bar');
    button.click(function () {
        var sideBar = $('#sidebar');
        if (sideBar.hasClass('active')) {
            toggleVisiblity();
            fadeIn(sideBar, SPEED_SLOW);
        } else {
            fadeOut(sideBar, SPEED_SLOW, toggleVisiblity);
        }

        sideBar.toggleClass('active');
        function toggleVisiblity() {
            sideBar.toggleClass('hidden-panel');
        }
    })
}
function initializeNotes() {
    var window = $(window);
    var notesRef = database.ref('/notes/'+schoolID+'/'+crn+'/'+weekNumber+'/'+dayNumber+'/');

    notesRef.on('child_added', function(data) {
        attemptToAddNoteItem(data);
    });




    function attemptToAddNoteItem(data) {
        var reports = data.val().reports;
        var confirmations = data.val().confirmations;
        var percentReported = reports/confirmations * 100;
        if(percentReported > 20) {
            return;
        }
        if(percentReported > 10) {
            // TODO: ADD QUESTIONS PART HERE
        }

        var currentPage = $('.current-page');
        if(currentPage.height() > (1.5*window.height)) {
            createNewPage();
        }
        allNotes[data.key] = data.val();
        appendNote(data.key, allNotes[data.key]);
    }

    function createNewPage() {
        var pagesContainer = $('#pages');
        var currentPage = $('.current-page');

        var newPageHTML="";
        newPageHTML += "<div class=\"card paper document hovering-shadow-small margin-bottom-20 current-page\">";
        newPageHTML += "                    <div class=\"card-body\">";
        newPageHTML += "                        <h6 class=\"card-subtitle mb-2 text-muted initial-fade-in\">Page ";
        newPageHTML += pagesCounter;
        newPageHTML += "<\/h6><br>";
        newPageHTML += "                        <div class=\"all-notes\">";
        newPageHTML += "";
        newPageHTML += "                        <\/div>";
        newPageHTML += "";
        newPageHTML += "                    <\/div>";
        newPageHTML += "                <\/div>";

        currentPage.removeClass('.current-page');
        pagesContainer.append(newPageHTML);
        pagesCounter++;
    }

    function appendNote(key, note) {
        var currentNoteSection = $('.current-page .all-notes');
        var time =  moment().millisecond(note.timestamp);
        var newNoteHTML="";
        newNoteHTML += "                            <div class=\"single-note\" data-type=\"note\" data-id=\"";
        newNoteHTML += key;
        newNoteHTML += "\">";
        newNoteHTML += "                                <div class=\"row\">";
        newNoteHTML += "                                    <div class=\"col-1 text-light show-on-hover opacity-none rating-buttons\" data-value=\"not-selected\">";
        newNoteHTML += "                                        <h6><i class=\"material-icons text-icon mouse-pointer show-on-hover check-mark\">&#xE5CA;<\/i>";
        newNoteHTML += "                                            <i class=\"material-icons text-icon mouse-pointer delete-mark\">&#xE5CD;<\/i><\/h6>";
        newNoteHTML += "                                    <\/div>";
        newNoteHTML += "                                    <div class=\"col-10\">";
        newNoteHTML += "                                        <p class=\"lead margin-bottom-0\">";
        newNoteHTML += decodeText(note.content);
        newNoteHTML += "                                        <\/p>";
        newNoteHTML += "                                    <\/div>";
        newNoteHTML += "                                    <div class=\"col-1 show-on-hover opacity-none\">";
        newNoteHTML += "                                        <h6>";
        newNoteHTML += "                                            <i class=\"material-icons text-icon mouse-pointer\">&#xE5D4;<\/i>";
        newNoteHTML += "                                        <\/h6>";
        newNoteHTML += "                                    <\/div>";
        newNoteHTML += "                                    <div class=\"offset-1 col-auto show-on-hover opacity-none\">";
        newNoteHTML += "                                        <p class=\"xsmall margin-bottom-0 text-primary\">";
        newNoteHTML += note.username;
        newNoteHTML += " <custom class=\"text-muted\">";
        newNoteHTML += time.hour + ":" + time.minute();
        newNoteHTML += "<\/custom><\/p>";
        newNoteHTML += "                                    <\/div>";
        newNoteHTML += "                                <\/div>";
        newNoteHTML += "                            <\/div>";
        currentNoteSection.append(newNoteHTML);
    }
}

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
function encodeText(text) {
    return encodeURIComponent(text).replace(/\./g, '%2E');
}
function decodeText(text) {
    return decodeURIComponent(text.replace('%2E', '.'));
}

// Animation stuff
function fadeInFromTop(object, speed) {
    object.animate({
        opacity: 1,
        height: 'toggle'
    }, speed, function() {
        // Animation complete.
    });
}
function fadeInFromBottom(object, speed) {
    object.css("padding-top", "32px");
    object.animate({
        opacity: 1,
        paddingLeft: "0",
        paddingTop: "0"
    }, speed, function() {
        // Animation complete.
    });
}
function fadeInFromLeft(object, speed, functionAfter) {
    object.css("padding-left", "16px");
    object.animate({
        opacity: 1,
        paddingLeft: "0"
    }, speed, function() {
        if(functionAfter) {functionAfter();}
    });
}
function fadeIn(object, speed, functionAfter) {
    object.animate({
        opacity: 1
    }, speed, function() {
        if(functionAfter) {functionAfter();}
    });
}
function fadeOut(object, speed, functionAfter) {
    object.animate({
        opacity: 0
    }, speed, function() {
        if(functionAfter) {functionAfter();}
    });
}


// Global stuff
function showProgressBar() {
    var progress = $('#progress-loader');
    progress.removeClass('hidden-panel')
}
function hideProgressBar() {
    var progress = $('#progress-loader');
    progress.addClass('hidden-panel')
}


$(window).on('hashchange', function() {
    loadPage('' + location.hash);
});
