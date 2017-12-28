$(window).scroll(function() {

    // selectors
    var $window = $(window),
        $body = $('body'),
        $panel = $('.panel');

    // Change 33% earlier than scroll position so colour is there when you arrive.
    var scroll = $window.scrollTop() + ($window.height() / 3);

    $panel.each(function () {
        var $this = $(this);

        // if position is within range of this panel.
        // So position of (position of top of div <= scroll position) && (position of bottom of div > scroll position).
        // Remember we set the scroll to 33% earlier in scroll var.
        if ($this.position().top <= scroll && $this.position().top + $this.height() > scroll) {

            // Remove all classes on body with color-
            $body.removeClass(function (index, css) {
                return (css.match (/(^|\s)color-\S+/g) || []).join(' ');
            });

            // Add class of currently active div
            $body.addClass('color-' + $(this).data('color'));
        }
    });

}).scroll();


function intializeCelebreMeans() {
    var possibleWords = ["noted", "renowned", "celebrated", "great"];
    var position = 0;
    var addNewWordInterval;
    setInterval(checkAndUpdatePointer, 500);
    setInterval(cycleToNewWord, 8000);

    function checkAndUpdatePointer() {
        var customTextObject = $('custom.celebre-means');
        var currentText = customTextObject.html();
        if(currentText[currentText.length-1] == 'I') {
            customTextObject.html(currentText.substring(0, currentText.length-1));
        } else {
            customTextObject.html(currentText + "I");
        }
    }
    function cycleToNewWord() {
        var deleteWordInterval = setInterval(deleteWord, 100);

        function deleteWord() {
            var customTextObject = $('custom.celebre-means');
            var currentText = customTextObject.html();
            if(currentText !== "") {
                customTextObject.html(currentText.substring(0, currentText.length-1));
            } else {
                clearInterval(deleteWordInterval);
                if(!addNewWordInterval) {
                    addNextWord();
                }
            }
        }
        function addNextWord() {
            iterateThroughPossibleWords();
            var positionInNewWord = 0;
            addNewWordInterval = setInterval(addNewWord, 200);
            var nextWord = possibleWords[position];

            function addNewWord(){
                var customTextObject = $('custom.celebre-means');
                var currentText = customTextObject.html();
                if(!nextWord){
                    clearInterval(addNewWordInterval);
                    addNewWordInterval=null;
                    return;
                }
                if(currentText !== nextWord && positionInNewWord <= nextWord.length) {
                    customTextObject.html(nextWord.substring(0, positionInNewWord));
                    positionInNewWord++;
                } else {
                    clearInterval(addNewWordInterval);
                    addNewWordInterval=null;
                }
            }
            function iterateThroughPossibleWords() {
                if(position < possibleWords.length) {
                    position++;
                } else {
                    position=0;
                }
            }
        }
    }
}


$( document ).ready(function() {
    console.log( "Initialized!" );
    intializeMoveToNextPage();
    intializeCelebreMeans();

});

function intializeMoveToNextPage() {
    var moveNextbutton = $('.move-next-button');

    moveNextbutton.each(function () {
        var button = $(this);
        button.click(function () {
            var currentPanel = button.closest('.panel');
            var nextPanel = currentPanel.next('.panel');

            $('html,body').animate({
                scrollTop: nextPanel.offset().top - 10
            }, 350);
            button.blur();
        });
    })
}
