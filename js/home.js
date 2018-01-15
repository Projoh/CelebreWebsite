function initializeAuthStateListener() {
    firebase.auth().onAuthStateChanged(function(user) {
        if (user) {
            checkURLandNavigate();
        } else {
            // No user is signed in.
            document.location = "login.html";
        }
    });
}

function checkURLandNavigate() {
    if (location.hash == "" || location.hash == null || location.hash == "#!") {
        location.hash = "mochila";
    } else {
        changePage(location.hash);
    }
}

$( document ).ready(function() {
    console.log( "Initialized!" );
    initializeHighLightOnHover();
    initializeAuthStateListener();
});

const SPEED_SLOW = 200; // Full page transitions
const SPEED_MEDIUM = 175; // Entering Screen
const SPEED_FAST = 150; // Leaving Screen


var currentPage;
var database = firebase.database();
var allCourses = [];
var schoolID = null;

// NETWORK STUFF
function updateTimeStamp(location, functionAfter) {
    var currentTime = new Date().getTime();
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
        if(value !== null && typeof value !== 'undefined') {
            if(functionSuccess){
                functionSuccess(value);
            }
        } else {
            if(functionFail) {
                functionFail();
            }
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
function undoUserConfirmedItem(functionAfter) {
    var user = firebase.auth().currentUser;
    incrementDatabaseValue('users/'+user.uid+'/confirmations', -1, updatetime);
    function updatetime() {
        updateTimeStamp('users/'+user.uid+'/last_confirmation', functionAfter);
    }
}
function reportByUID(reportedUID) {
    incrementDatabaseValue('reports/'+schoolID+'/'+reportedUID, 1, userReportedItem);
}
function userReportedItem(afterFunction) {
    var user = firebase.auth().currentUser;
    incrementDatabaseValue('users/'+user.uid+'/reports_given', 1, updatetime);
    function updatetime() {
        updateTimeStamp('users/'+user.uid+'/last_confirmation', afterFunction);
    }
}
function undoUserReportedItem(functionAfter) {
    var user = firebase.auth().currentUser;
    incrementDatabaseValue('users/'+user.uid+'/reports_given', -1, updatetime);
    function updatetime() {
        updateTimeStamp('users/'+user.uid+'/last_confirmation', functionAfter);
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
function rateItem(type,id, confirmOrDeny) {
    var user = firebase.auth().currentUser;
    var location = type+'/' + schoolID + '/'+crn + '/' + weekNumber + '/' + dayNumber + '/' + id;
    var oppLocation = location;
    var decLocation = 'decisions/'+schoolID +'/' + crn + '/' + user.uid + '/' + type + '/' + id;
    if(confirmOrDeny) {
        location += '/' + 'confirmations';
        oppLocation += '/' + 'reports';
    } else {
        location += '/' + 'reports';
        oppLocation += '/' + 'confirmations';
    }


    checkIfDecisionExists();


    function checkIfDecisionExists() {

        fetchData(decLocation, decisionExisted, performJudgment);

        function decisionExisted(response) {
            revertDecision(response, performJudgment);
        }
    }


    function revertDecision(value, functionAfter) {

        incrementDatabaseValue(oppLocation, -1, anonFunction());
        function anonFunction() {
            if(value) { // Was confirmation
                undoUserConfirmedItem(functionAfter);
            } else { // Was a report
                undoUserReportedItem(functionAfter);
            }
        }
    }

    function performJudgment() {
        incrementDatabaseValue(location, 1, afterFunction);

        function afterFunction () {
            if(confirmOrDeny) {
                userConfirmedItem(addDecision)
            } else {
                userReportedItem(addDecision)
            }
        }
    }

    function addDecision() {
        inputKeyValue(decLocation, confirmOrDeny);
    }
}
function retreiveUsername(afterFunction) {
    var user = firebase.auth().currentUser;
    var location = 'users/'+ user.uid + '/username';

    fetchData(location, afterFunction);
}

function intializeMochilaAnimations() {
    var currentCourses = $('.main-content');
    var subTitles = $('.subtitle-main');

    currentCourses.each(function () {
        fadeInFromLeft($(this), SPEED_SLOW);
    });

    subTitles.each(function () {
        fadeInFromLeft($(this), SPEED_SLOW);
    });
}



function initializeHighLightOnHover() {
    var $hoverItems = $('#main-content');
    var $courseSelectItems = $('.course-select-option');
    var entireView = $('#all-content');


    $hoverItems.on('mouseenter', '.course-select-option', function () {
        var hoverItem = $(this);
            var header = hoverItem.find('h1');
            var rightArrow = hoverItem.find('i');

            header.removeClass('text-light');
            header.addClass('text-success');
            rightArrow.removeClass('text-light');
            rightArrow.addClass('text-success');
    });

    $hoverItems.on('mouseleave', '.course-select-option', function () {
        var hoverItem = $(this);
            var header = hoverItem.find('h1');
            var rightArrow = hoverItem.find('i');

            header.removeClass('text-success');
            header.addClass('text-light');
            rightArrow.removeClass('text-success');
            rightArrow.addClass('text-light');
     });

    $hoverItems.on('click', '.course-select-option', function () {
        var courseSelectItem = $(this);
            var CRN = courseSelectItem.attr('id');
            location.hash = CRN;
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
function fadeInFromLeft(object, speed) {
    object.css("padding-left", "16px");
    object.animate({
        opacity: 1,
        paddingLeft: "0"
    }, speed, function() {
        // Animation complete.
    });
}
// Not Real
function fadeOutToLeft(object, speed, functionToExecute) {
    object.animate({
        opacity: 0,
        paddingLeft: "64",
    }, speed, function() {
        hideObject();
        toggleLoader(true);
        if(functionToExecute){
            setTimeout(functionToExecute, 200);
        }
    });
    function hideObject() {
        object.addClass("hidden-panel");
    }
}


function toggleLoader(on) {
    var loader = $('#progress-loader')
    if(on) {
        loader.removeClass('hidden-panel');
    } else {
        loader.addClass('hidden-panel');
    }
}
function editWeekTitle(crn) {
    $('#myModal').modal('show')
}
function viewAllModules(crn) {
    location.hash = crn + '#dateselect';
}
function changePage(newLocation) {
    if(currentPage) {
        fadeOutToLeft(currentPage, SPEED_MEDIUM, showNextPage)
    } else {
        showNextPage();
    }


    // When I wrote this I was an edgy idiot.
    function showNextPage() {
        newLocation = newLocation.split('#');
        if(newLocation[1] == "mochila" || newLocation[1] == "addcourse") {
            currentPage = $('#' + newLocation[1]);
            currentPage.removeClass('hidden-panel');
            fadeInFromBottom(currentPage, SPEED_MEDIUM);
            window[newLocation[1]]();
        } else {
            var crn = newLocation[1];
            var secondModifier = newLocation[2];
            if(newLocation.length > 2){
                // Something like #352866#settings or #crn352866#dateselect
                currentPage = $('#' + secondModifier);
                currentPage.removeClass('hidden-panel');
                window[secondModifier](crn);
            } else {
                showCoursePage(crn);
            }
        }
    }
}



function mochila() {
    toggleLoader(true);
    var coursesContentElement = $('#main-content');
    var user = firebase.auth().currentUser;
    allCourses = [];
    coursesContentElement.html("");
    fetchData('users/'+user.uid+'/school_id', loadCourses);
    afterFun();


    function loadCourses(school_id) {
        schoolID = school_id;
        fetchData('users/'+user.uid+'/courses_enrolled', retrievedCourses);
        function retrievedCourses(snapValue) {
            for(var course in snapValue) {
                course = { crn : course, title : ""};
                allCourses.push(course);
            }
            showCourses();

        }
    }


    function afterFun () {
        intializeMochilaAnimations();
        toggleLoader(false);
    }

    function showCourses() {
        for(var courseID in allCourses) {
            var course = allCourses[courseID];
            appendCourseData(course);
        }
    }

    function updateUIWithNewCourse(course) {

        var courseHTML="";
        courseHTML += "<div class=\"row no-select highlight-to-yellow course-select-option\" id=\"";
        courseHTML += course.crn;
        courseHTML += "\">";
        courseHTML += "                <div class=\"col-8\">";
        courseHTML += "                    <h1 class=\"d-block d-md-none font-weight-light text-light text-truncate\">";
        courseHTML += course.title;
        courseHTML += " <small ";
        courseHTML += "     class=\"text-dark d-block d-md-none\">#";
        courseHTML += course.crn;
        courseHTML += "<\/small> <\/h1>";
        courseHTML += "                    <h1 class=\"d-none d-md-block d-lg-block d-xl-block display-4 font-weight-light text-light\">";
        courseHTML += course.title;
        courseHTML += " <small class=\"text-dark\">#";
        courseHTML += course.crn;
        courseHTML += "<\/small> <\/h1>";
        courseHTML += "                <\/div>";
        courseHTML += "                <div class=\"col align-self-center text-right padding-top-bottom\">";
        courseHTML += "                    <i class=\"material-icons large text-light\">&#xE315;<\/i>";
        courseHTML += "                <\/div>";
        courseHTML += "            <\/div>";

        coursesContentElement.append(courseHTML);
        toggleLoader(off);
    }

    function appendCourseData(course) {
        fetchData('courses/' + schoolID + '/' + course.crn, fillCourseDataAndAppend);

        function fillCourseDataAndAppend(course_response){
            course.days_meeting = decodeText(course_response.days_meeting);
            course.title = decodeText(course_response.title);

            updateUIWithNewCourse(course);
        }
    }
}

function showCoursePage(CRN) {
    var viewModulesElement = $('#view-all-modules-button');
    toggleLoader(false);
    currentPage = $('#course-page');
    currentPage.removeClass('hidden-panel');
    // Loads some type of data
    // Sets it here
    // on after, then calls this:
    viewModulesElement.attr('onclick', 'viewAllModules(\''+CRN+'\')');
    fadeInFromBottom(currentPage, SPEED_MEDIUM);
}

function dateselect(CRN) {
    // TODO: Implement this:
    // Calaulcate what day/month currently

    toggleLoader(false);
    fadeInFromBottom(currentPage, SPEED_MEDIUM);
}


function scrollToTop() {
    $("html, body").animate({ scrollTop: 0 }, SPEED_SLOW);
}


function logOut() {
    firebase.auth().signOut().then(function() {
        // Sign-out successful.
    }).catch(function(error) {
        // An error happened.
    });
}


$(window).on('hashchange', function() {
    changePage('' + location.hash);
});

