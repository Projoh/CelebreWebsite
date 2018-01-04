function initializeAuthStateListener() {
    firebase.auth().onAuthStateChanged(function(user) {
        if (user) {
            //
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
var courseTitles = [];
var reported_courseTitles = [];
var schoolID=null;
var decisionMade = false;


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
            functionSuccess(value);
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




function addCoursebutton() {
    var user = firebase.auth().currentUser;
    var courseElement = $('#courseIDElement');
    var courseText = encodeText(courseElement.val());

    if(courseText < 1){
        showErrorMessage("No Course ID entered.");
        return;
    }

    fetchData('users/'+user.uid+'/courses_enrolled/'+courseText, userIsEnrolled, userIsNotEnrolled)

    function userIsEnrolled() {
        showSnackBar("You're already enrolled in this course!");
    }

    function userIsNotEnrolled() {
        addCourse(courseText);
    }

}





function intializePanelPageMover() {
    var allForms = $('.panel form');
    var panelBackButtons = $('.panel-back-button');
    var goToFirstPanelButtons = $('.go-to-first');
    allForms.submit(function( event ){
        event.preventDefault();
        var thisForm = $(this);

        // if(!formIsValid(thisForm)){
        //     return;
        // }

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
function moveToNextPanel(panel1, panel2) {
    fadeOutToLeft(panel1, SPEED_FAST, enterNextPanel);

    function enterNextPanel() {
        fadeInFromLeft(panel2, SPEED_MEDIUM);
        panel2.find('form').first().submit();
    }
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
function markFormAsCompletedAndSubmit (form) {
    var input = form.children('.toggle').first();
    input.val("1");
    form.submit();
}

function scrollToTop() {
    $("html, body").animate({ scrollTop: 0 }, SPEED_SLOW);
}
function directToHome() {
    document.location = "home.html";
}
function showErrorMessage(message) {
    var errorElement = $('#courseAddError');
    errorElement.html(message);
}
function showErrorMessage(element, message) {
    var errorElement = $('#courseAddError');
    errorElement.html(message);
}
function showSnackBar(message) {
    var snackBarItem = document.getElementById("snackbar")

    // Add the "show" class to DIV
    snackBarItem.className = "show";
    snackBarItem.innerHTML = message;

    // After 3 seconds, remove the show class from DIV
    setTimeout(function(){ snackBarItem.className = snackBarItem.className.replace("show", ""); }, 3000);
}




function addCourse(CRN) {
    var user = firebase.auth().currentUser;

    fetchData('users/'+user.uid+'/school_id', checkIfCourseExists);




    function checkIfCourseExists(schoolIDLoc) {
        schoolID = schoolIDLoc;
        var courseTitlesRef = database.ref('course_titles/'+schoolID+"/"+CRN);
        courseTitlesRef.orderByChild('confirmations').once('value').then(function(snapshot) {
            var allCourseTitles = snapshot.val();
            if(allCourseTitles) {
                inputAllCourseTitles(allCourseTitles);
                checkTitleOkayThenAddCourse();
            } else {
                courseDoesNotExist();
            }
        });
    }

    function courseDoesNotExist() {
        var addCourseElement = $('#addCourse');
        markFormAsCompletedAndSubmit(addCourseElement);

    }


    function inputAllCourseTitles(allCourseTitles, functionAfterThat) {
        courseTitles = [];
        reported_courseTitles = [];

        $.each(allCourseTitles, function(i) {
            var courseTitleObject = allCourseTitles[i];
            var courseTitle = new CourseTitle();
            courseTitle.confirmations = courseTitleObject['confirmations'];
            courseTitle.reports = courseTitleObject['reports'];
            courseTitle.content = decodeText(courseTitleObject['content']);
            courseTitle.uid = courseTitleObject['uid'];
            courseTitle.key = i;
            var ratioOfReports = (courseTitle.reports / courseTitle.confirmations) * 100;
            if(ratioOfReports < 15) {
                courseTitles.push(courseTitle);
            } else {
                reported_courseTitles.push(courseTitle);
            }
            if(ratioOfReports > 5 || ratioOfReports < 20) {
                // TODO: ADD TO LIST OF COURSE CONFIRMATION REQUESTS
            }
        });
        // Unnecessary as we use OrderByChild earlier
        // courseTitles = sortByKey(allCourseTitles, 'confirmations');
        courseTitles = sortByKey(courseTitles, 'confirmations');
    }
    function checkTitleOkayThenAddCourse() {


        checkIfFirstCourseExists();
        var firstTitle = courseTitles[0];
        var ratioOfReports =  firstTitle.reports / firstTitle.confirmations * 100;
        // If there is no not reported title, then add the first of the reported
        // and ask if that title is correct

        if(ratioOfReports >= 10) {
            popupAskingIfTitleIsCorrect();
        } else {
            setCourseTitle();
                if(decisionMade) {
                    // add course in server func
                    addCourseInServer(clearCRNUI);
                } else {
                    // add confirm points
                    incrementDatabaseValue('course_titles/'+ schoolID +
                        '/'+CRN+'/'+firstTitle.key+'/confirmations', 1)
                    userConfirmedItem(addCourseInServer(clearCRNUI));
                        // add course in serer func
                }
                    // TODO: ATTEMPT TO ASK QUESITON
                function addCourseInServer(functionAfter) {
                    var user = firebase.auth().currentUser;
                    inputKeyValue('/users/'+user.uid+'/courses_enrolled/'+encodeText(CRN), true, functionAfter);
                }

                function clearCRNUI() {
                    var crnElement = $('#courseIDElement');
                    crnElement.val("");
                    showSnackBar("You've signed up to the course " +  firstTitle.content +
                        '(' + CRN + ')');
                    attemptToAskQuestion();
                }
        }

        function checkIfFirstCourseExists() {
            if(!courseTitles[0]) {
                reported_courseTitles = sortByKey(reported_courseTitles, 'confirmations');
                courseTitles[0] = reported_courseTitles[0];
            }
        }

        function setCourseTitle() {
            inputKeyValue('/courses/'+schoolID + '/'+ encodeText(CRN)+'/title', courseTitles[0].content);
        }
    }



    function popupAskingIfTitleIsCorrect() {
        var popupElement = $('#correctCourseQuestion');
        var crnElement = $('#CRN-correctQuestion');
        var titleElement = $('#title-correctQuestion');

        crnElement.html(CRN);
        titleElement.html(courseTitles[0].content);
        popupElement.modal({
           keyboard: false,
           background: 'static'
        });
        popupElement.modal('show');
    }

}



// Manual Course title because course does not exist
function submitManualCourseTitle() {
    var titleElement = $('#courseTitle');
    var titleText = titleElement.val();
    var addCourseElement = $('#courseTitleForm');
    if(titleText.length < 1 || titleText.length > 20) {
        showErrorMessage($('#courseTitleError'), "Title cannot be less than one character or longer than twenty.");
    } else {
        markFormAsCompletedAndSubmit(addCourseElement);
    }
}
function submitNewCourse() {
    var crnElement = $('#courseIDElement');
    var titleElement = $('#courseTitle');
    var user = firebase.auth().currentUser;


    var titleText = titleElement.val();
    var daysMeeting = gatherDaysMeeting();
    var CRN = crnElement.val();
    fetchData('users/'+user.uid+'/school_id', createNewCourse);

    function createNewCourse(school) {
        schoolID = school;
        var newCourseRef = database.ref('courses/'+schoolID+'/'+encodeText(CRN));
        newCourseRef.set({
            title: encodeText(titleElement.val()),
            days_meeting: daysMeeting,
            creator: user.uid
        }).then(function () {
            // Create course_title
            var newTitleRef = database.ref('course_titles/'+schoolID+'/'+encodeText(CRN)+
                '/').push();
            newTitleRef.set({
                confirmations: 1,
                content: encodeText(titleText),
                reports: 0,
                uid: user.uid
            }).then(function (value) {
                incrementDatabaseValue('users/'+user.uid+'/courses_created', 1,addCourseInfoAdded);
                function addCourseInfoAdded() {
                    incrementDatabaseValue('users/'+user.uid+'/course_info_added', 2, addCourseToUser);

                    function addCourseToUser() {
                        inputKeyValue('/users/'+user.uid+'/courses_enrolled/'+encodeText(CRN), true, updateUI);
                    }
                }
            });
        });

        function updateUI() {
            var courseDayElementForm = $('#courseDaysForm');
            courseDayElementForm[0].reset();
            titleElement.val("");
            crnElement.val("");
            showSnackBar("You've signed up to the course " +  titleText +
                '(' + CRN + ')');
            redirectToFirstPanel();
            userConfirmedItem();
        }
    }





    function gatherDaysMeeting() {
        var dayOneElement = document.getElementById("dayOneSelector");
        var dayTwoElement = document.getElementById("dayTwoSelector");
        var dayOne = dayOneElement.options[dayOneElement.selectedIndex].value;
        var dayTwo = dayTwoElement.options[dayTwoElement.selectedIndex].value;

        return dayOne.toUpperCase() + '_' + dayTwo.toUpperCase();
    }

    function redirectToFirstPanel() {
        var firstPanel = $('#addCoursePanel');
        var currentPanel = $('#courseDaysPanel');
        moveToNextPanel(currentPanel, firstPanel);
    }
}


// Course Title Looks correct popup functions
function correctTitle() {
    var popupElement = $('#correctCourseQuestion');
    var firstTitle = courseTitles[0];
    var courseElement = $('#courseIDElement');
    var CRN = courseElement.val();

    popupElement.modal('hide');
    // subtract reports by three
    incrementDatabaseValue('course_titles/'+ schoolID +
        '/'+CRN+'/'+firstTitle.key+'/reports', -3, addCourse(CRN));
}
function incorrectTitle() {
    // Open pop up asking what should the title be
    var modalElement = $('#enterTitleModal');
    var popupElement = $('#correctCourseQuestion');

    popupElement.modal('hide');
    modalElement.modal({
        keyboard: false,
        background: 'static'
    });
    modalElement.modal('show');
}
function submitNewTitle() {
    var courseElement = $('#courseIDElement');
    var CRN = courseElement.val();
    var titleTextElement = $('#title-of-class');
    var titleText = encodeText(titleTextElement.val());



    var element = findElementInEitherArray();
    var user = firebase.auth().currentUser;

    // new title = increment count by 1 incase it exists
    // old title = increment report by 1
    //then go to add course function
    if(element) {
        incrementDatabaseValue('/course_titles/'+ schoolID +
            '/'+encodeText(CRN)+'/'+element.key+'/confirmations', 1, incrementReports);
    } else {
        var newTitleRef = database.ref('course_titles/'+schoolID+'/'+encodeText(CRN)+
            '/').push();
        newTitleRef.set({
            confirmations: 1,
            content: titleText,
            reports: 0,
            uid: user.uid
        }).then(incrementReports);
    }
    userConfirmedItem();

    function incrementReports () {
        decisionMade = true;
        reportByUID(courseTitles[0].uid);
        incrementDatabaseValue('course_titles/'+ schoolID +
            '/'+CRN+'/'+courseTitles[0].key+'/reports', 2, addCourse(CRN));
    }



    function findElementInEitherArray() {
        var normalArrayItem = findElementByValue(courseTitles, 'content', decodeText(titleText.toLowerCase()));
        var reportedArrayItem = findElementByValue(reported_courseTitles, 'content', decodeText(titleText.toLowerCase()))
        if(normalArrayItem){
            return normalArrayItem;
        }
        if(reportedArrayItem) {
            return reportedArrayItem;
        }
        return null;
    }
}




function findElementByValue(array, key, value) {
    for(var itemID in array) {
        var item = array[itemID];
        var itemName = item[key].toLowerCase();
        if(itemName == value) {
            return item;
        }
    }
    return null;
}
function sortByKey(array, key) {
    return array.sort(function(a, b) {
        var x = a[key]; var y = b[key];
        return ((x > y) ? -1 : ((x < y) ? 1 : 0));
    });
}

function CourseTitle() {
    this.key;
    this.content ="";
    this.confirmations = 0;
    this.reports = 0;
    this.uid = "";
}

