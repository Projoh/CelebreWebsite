function checkURLandNavigate() {
    if (location.hash == "" || location.hash == null || location.hash == "#!") {
        location.hash = "mochila";
    } else {
        changePage(location.hash);
    }
}

$( document ).ready(function() {
    console.log( "Initialized!" );
    checkURLandNavigate();
    initializeHighLightOnHover();
});

const SPEED_SLOW = 200; // Full page transitions
const SPEED_MEDIUM = 175; // Entering Screen
const SPEED_FAST = 150; // Leaving Screen
var currentPage;

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
    var $hoverItems = $('.highlight-to-yellow');
    var $courseSelectItems = $('.course-select-option');
    var entireView = $('#all-content');


    $hoverItems.each(function () {
        var hoverItem = $(this);
        hoverItem.hover(function () {
            var header = hoverItem.find('h1');
            var rightArrow = hoverItem.find('i');

            header.removeClass('text-light');
            header.addClass('text-success');
            rightArrow.removeClass('text-light');
            rightArrow.addClass('text-success');
        }, function () {
            var header = hoverItem.find('h1');
            var rightArrow = hoverItem.find('i');

            header.removeClass('text-success');
            header.addClass('text-light');
            rightArrow.removeClass('text-success');
            rightArrow.addClass('text-light');
        });


    });

    $courseSelectItems.each(function () {
        var courseSelectItem = $(this);
        courseSelectItem.click(function () {
            var CRN = courseSelectItem.attr('id');
            location.hash = CRN;
        });
    })
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
    intializeMochilaAnimations();
    toggleLoader(false);
}

function showCoursePage(CRN) {
    toggleLoader(false);
    currentPage = $('#course-page');
    currentPage.removeClass('hidden-panel');
    // Loads some type of data
    // Sets it here
    // on after, then calls this:
    fadeInFromBottom(currentPage, SPEED_MEDIUM);
}

function dateselect(CRN) {
    toggleLoader(false);
    fadeInFromBottom(currentPage, SPEED_MEDIUM);
}


function scrollToTop() {
    $("html, body").animate({ scrollTop: 0 }, SPEED_SLOW);
}



$(window).on('hashchange', function() {
    changePage('' + location.hash);
});
