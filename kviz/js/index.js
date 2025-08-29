let baza = "https://docs.google.com/spreadsheets/d/e/2PACX-1vRYrbQpk8C8qpzd042cUetASGAvA5MiMNx5V8KumqTOyEpLeXHLmJ6Hyv-Xb5VrqkZEzm-74Ixoy4k2/pub?output=csv";

var podatci;
const csvData = Papa.parse(baza, {
    dynamicTyping: false,
    download: true,
    header: true,
    transformHeader: function (h) { return h.replace(/\s/g, ''); },
    comments: "*=",
    complete: function (data) {
        podatci = data.data
        document.getElementById("loader").style.display = "none";
        document.getElementById("myDiv").style.display = "block";
    }
});

// VARIABLE DECLARATIONS ------
// pages
var initPage,
    questionsPage,
    resultsPage,
    // buttons
    startBtn,
    submitBtn,
    continueBtn,
    retakeBtn,
    spanishBtn,
    // question and answers
    question,
    answerList,
    answerSpan,
    answerA,
    answerB,
    answerC,
    answerD,
    // event listeners
    answerDiv,
    answerDivA,
    answerDivB,
    answerDivC,
    answerDivD,
    feedbackDiv,
    selectionDiv,
    toBeHighlighted,
    toBeMarked,
    userScore,
    // quiz
    quiz,
    questionCounter,
    correctAnswer,
    correctAnswersCounter,
    userSelectedAnswer,
    // function names
    newQuiz,
    generateQuestionAndAnswers,
    getCorrectAnswer,
    getUserAnswer,
    selectCorrectAnswer,
    deselectCorrectAnswer,
    getSelectedAnswerDivs,
    highlightCorrectAnswerGreen,
    highlightIncorrectAnswerRed,
    slikica,
    clearHighlightsAndFeedback,
    prekidac, countdownTimer, bodovi = 0,
    vrijeme = 0,
    gumbic = 1,
    set_pitanja;
function ProgressCountdown(timeleft, bar, text) {
    return new Promise((resolve, reject) => {
        countdownTimer = setInterval(() => {
            timeleft--;
            document.getElementById(bar).value = timeleft;
            document.getElementById(text).textContent = timeleft;
            if (timeleft <= 0) {
                clearInterval(countdownTimer);
                resolve(true);
            } else if (timeleft <= 1) {
                $("#sekunde").html("sekunda")
                $("#ostalo").html("ostala")
            } else if (timeleft <= 4) {
                $("#sekunde").html("sekunde")
            }
        }, 1000);
    });
}

$(document).ready(function () {


    function promijeniPozadinu(url) {
  const body = document.body;
  // postavi sljedeću sliku na ::after i pokreni fade
  body.style.setProperty('--bg-next', `url("${url}")`);
  body.classList.add('bg-fade-in');

  // kad fade završi: zamijeni "current" i očisti stanje
  const onEnd = (e) => {
    if (e.propertyName !== 'opacity') return;
    body.style.setProperty('--bg-current', `url("${url}")`);
    body.classList.remove('bg-fade-in');
    body.style.removeProperty('--bg-next');
    body.removeEventListener('transitionend', onEnd);
  };
  body.addEventListener('transitionend', onEnd);
}
    // DOM SELECTION ------
    // App pages
    // Page 1 - Initial
    initPage = $('.init-page');
    // Page 2 - Questions/answers
    questionsPage = $('.questions-page');
    // Page 3 - Results
    resultsPage = $('.results-page');
    slikica = $('.slikica');
    // Buttons
    startBtn = $('.init-page__btn, .results-page__retake-btn');
    submitBtn = $('.mrzim');
    continueBtn = $('.questions-page__continue-btn');
    retakeBtn = $('.results-page__retake-btn');
    spanishBtn = $('.results-page__spanish-btn');
    // Answer block divs
    answerDiv = $('.questions-page__answer-div');
    // Selection div (for the pointer, on the left)
    selectionDiv = $('.questions-page__selection-div');
    // Feedback div (for the checkmark or X, on the right)
    feedbackDiv = $('.questions-page__feedback-div');
    // Questions and answers
    question = $('.questions-page__question');
    answerList = $('.questions-page__answer-list');
    answerSpan = $('.questions-page__answer-span');
    answerA = $('.questions-page__answer-A');
    answerB = $('.questions-page__answer-B');
    answerC = $('.questions-page__answer-C');
    answerD = $('.questions-page__answer-D');
    // User final score
    userScore = $('.results-page__score');
    prikazBodova = $('.results-page__bodovi');
    // QUIZ CONTENT ------

    // FUNCTION DECLARATIONS ------
    $.fn.declasse = function (re) {
        return this.each(function () {
            var c = this.classList
            for (var i = c.length - 1; i >= 0; i--) {
                var classe = "" + c[i]
                if (classe.match(re)) c.remove(classe)
            }
        })
    }
    function shuffle(array) { //izmješaj pitanja
        var i = 0,
            j = 0,
            temp = null
        for (i = array.length - 1; i > 0; i -= 1) {
            j = Math.floor(Math.random() * (i + 1))
            temp = array[i]
            array[i] = array[j]
            array[j] = temp
        }
    }
    // Start the quiz
    newQuiz = function () {
        prekidac = 1;
        bodovi = 0;
        // Set the question counter to 0
        questionCounter = 0;
        // Set the total correct answers counter to 0
        correctAnswersCounter = 0;
        // Hide other pages of the app
        questionsPage.hide();
        resultsPage.hide();
        if (set_pitanja==1){cat="počeci";     promijeniPozadinu("../slike/ciril-metod.jpeg");}
        else if (set_pitanja==2){cat="rano"; promijeniPozadinu("../slike/Bascanska_ploca.png");}
        else if (set_pitanja==3){cat="zlatno"; promijeniPozadinu("../slike/Hrvojev_misal.jpg");}
        else if (set_pitanja==4){cat="sumrak"; promijeniPozadinu("../slike/Propagande-Fide.png");}
        else if (set_pitanja==5){cat="moderno"; promijeniPozadinu("../slike/5-centi.png");}
        let output =
        podatci.filter(employee => employee.Razdoblje == cat);
        podatci=output
        shuffle(podatci)
    };
    // Load the next question and set of answers
    generateQuestionAndAnswers = function () {
        $(".questions-page__answer-list").show()
        question.html("<span style='font-size: 1.3rem;'>" + (questionCounter + 1) + "/" + podatci.length + ".</span> <br>");
        //riječ za koju se pogađa značenje
        $(".definicija").html(" <span class='lat'>" + podatci[questionCounter].pitanje + "</span>")
        //spajanje krivih i točnih odgovora te generiranje liste pitanja
        lista = podatci[questionCounter].kriviodgovor.split(";")
        lista.push(podatci[questionCounter].točanodgovor)
        shuffle(lista)
        for (x = 0; x < lista.length; x++) {
            document.getElementById("linkovi").innerHTML += '<div class="questions-page__answer-div questions-page__answer-div-' + x + '" onclick="odabir(this)"><div class=questions-page__selection-div></div><div class=questions-page__feedback-div></div><li class=questions-page__answer-line><span class="questions-page__answer-' + x + ' questions-page__answer-span">' + lista[x] + '</span></div>'

        }

        slikica.hide()

        $(".vrijeme").html('<progress value="60" max="60" id="pageBeginCountdown"><span id="pageBeginCountdownText">60</p>')

        if (prekidac == 1) {
            ProgressCountdown(60, 'pageBeginCountdown', 'pageBeginCountdownText').then(value => odgovor());
        }


    };
    // Store the correct answer of a given question
    getCorrectAnswer = function () {
        correctAnswer = podatci[questionCounter].točanodgovor.replace("<br>", "");
    };
    // Store the user's selected (clicked) answer
    getUserAnswer = function (target) {

        userSelectedAnswer = $(target).text();
    };

    // Get the selected answer's div for highlighting purposes
    getSelectedAnswerDivs = function (target) {
        toBeHighlighted = $(target);
        toBeMarked = $(target).find(feedbackDiv);
    };
    // Make the correct answer green and add checkmark
    highlightCorrectAnswerGreen = function (target) {

    };
    // Make the incorrect answer red and add X
    highlightIncorrectAnswerRed = function () {

    };
    // Clear all highlighting and feedback
    clearHighlightsAndFeedback = function () {
        answerDiv.removeClass('questions-page--correct');
        answerDiv.removeClass('questions-page--incorrect');
        feedbackDiv.removeClass('ion-checkmark-round');
        feedbackDiv.removeClass('ion-close-round');
    };
    // APP FUNCTIONALITY ------
    /* --- PAGE 1/3 --- */
    // Start the quiz:
    resultsPage.hide();
    submitBtn.hide();
    continueBtn.hide();
    // Clicking on start button:
    startBtn.on('click', function () {
        newQuiz();
        // Advance to questions page
        initPage.hide();
        questionsPage.show(300);
        // Load question and answers
        generateQuestionAndAnswers();
        // Store the correct answer in a variable
        getCorrectAnswer();
        // Hide the submit and continue buttons
        submitBtn.hide();
        continueBtn.hide();
    });

    // Clicking on the spanish button:
    // Link takes user to Duolingo
});

/* --- PAGE 2/3 --- */
// Clicking on an answer:
function odabir(e) {

    if (gumbic == 1) {
        // Make the submit button visible
        // Remove pointer from any answer that already has it
        // Put pointer on clicked answer
        // Store current selection as user answer
        getUserAnswer(e);
        // Store current answer div for highlighting purposes
        getSelectedAnswerDivs(e);
        odgovor();
    }
};
function odgovor() {
    vrijeme = parseInt($("#pageBeginCountdownText").text())
    bodovi += vrijeme
    prekidac = 0;
    var ide = 0
    // Disable ability to select an answer
    answerDiv.off('click');
    if (questionCounter != podatci.length - 1) {
        ide = 1
    } else {
        ide = 0
    }

    // Make correct answer green and add a checkmark
    highlightCorrectAnswerGreen();
    clearInterval(countdownTimer);
    gumbic = 0;
    if (document.getElementById("pageBeginCountdown").value == "0") {
        $("#krivo")[0].play();
        bodovi -= 10;
        let slikaHtml = "";
if (podatci[questionCounter].Slika !== "") {
    slikaHtml = "<figure><img src='slike/" + podatci[questionCounter].Slika + "' class='slikica2'/> <figcaption>"+podatci[questionCounter].Opisslike+"</figcaption></figure>";
}
        Swal.fire({
            title: "Isteklo je vrijeme.",
            html: "<p style='text-align:center; font-size: 1.5em;'><strong>Točan je odgovor: <span style='color:#bb422a; ' >" + podatci[questionCounter].točanodgovor + "</span></strong></p><br><p>"+podatci[questionCounter].Objašnjenje+"</p>"+slikaHtml,
            showCloseButton: true,
            confirmButtonText: ' dalje',
            backdrop: false,
            allowOutsideClick: false, allowEscapeKey: false
        });
        $(".swal2-confirm").click(function () {
            gumbic = 1;
            clearInterval(countdownTimer)
            if (ide == 1) {
                ProgressCountdown(60, 'pageBeginCountdown', 'pageBeginCountdownText').then(value => odgovor());
            }
            nastavi()
        })
        $(".swal2-close").click(function () {
            gumbic = 1;
            clearInterval(countdownTimer)
            if (ide == 1) {
                ProgressCountdown(60, 'pageBeginCountdown', 'pageBeginCountdownText').then(value => odgovor());
            }
            nastavi()
        })

        if (podatci[questionCounter].Slika == "") {
            $("figure").hide()
        }
    } else {
        // Evaluate if the user got the answer right or wrong
        if (userSelectedAnswer === correctAnswer) {
            // Increment the total correct answers counter
            correctAnswersCounter++;
            bodovi += 10;
            $("#tocno")[0].play();
            broj = vrijeme + 10
            let slikaHtml = "";
if (podatci[questionCounter].Slika !== "") {
    slikaHtml = "<figure><img src='slike/" + podatci[questionCounter].Slika + "' class='slikica2'/> <figcaption>"+podatci[questionCounter].Opisslike+"</figcaption></figure>";
}
            Swal.fire({
                title: "<span style='color:green'>Točno</span>",
                html: "<span style='font-size:1.5em' class='bodovi'>+" + broj + "</span><br><br><p>"+podatci[questionCounter].Objašnjenje+"</p><br>"+slikaHtml,
                showCloseButton: true,
                confirmButtonText: ' dalje',
                backdrop: false,
                allowOutsideClick: false, allowEscapeKey: false
            });
            $(".swal2-confirm").click(function () {
                gumbic = 1;
                clearInterval(countdownTimer)
                if (ide == 1) {
                    ProgressCountdown(60, 'pageBeginCountdown', 'pageBeginCountdownText').then(value => odgovor());
                }
                nastavi()
            })
            $(".swal2-close").click(function () {
                gumbic = 1;
                clearInterval(countdownTimer)
                if (ide == 1) {
                    ProgressCountdown(60, 'pageBeginCountdown', 'pageBeginCountdownText').then(value => odgovor());
                }
                nastavi()
            })
            if (podatci[questionCounter].Slika == "") {
                $("figure").hide()
            }
        } else {
            highlightIncorrectAnswerRed();
            bodovi -= 10;
            $("#krivo")[0].play();
            let slikaHtml = "";
            if (podatci[questionCounter].Slika !== "") {
    slikaHtml = "<figure><img src='slike/" + podatci[questionCounter].Slika + "' class='slikica2'/> <figcaption>"+podatci[questionCounter].Opisslike+"</figcaption></figure>";
}
            Swal.fire({
                title: " <span style='color:#bb422a' >Netočno</span>",
                html: "<p style='text-align:center; font-size: 1.5em;'><strong>Točan je odgovor: <span style='color:#bb422a; ' >" + podatci[questionCounter].točanodgovor + "</span></strong></p><br><p>"+podatci[questionCounter].Objašnjenje+"</p>"+slikaHtml,
                showCloseButton: true,
                confirmButtonText: ' dalje',
                backdrop: false,
                allowOutsideClick: false, allowEscapeKey: false
            });
            $(".swal2-confirm").click(function () {
                gumbic = 1;
                clearInterval(countdownTimer)
                if (ide == 1) {
                    ProgressCountdown(60, 'pageBeginCountdown', 'pageBeginCountdownText').then(value => odgovor());
                }
                nastavi()
            })
            $(".swal2-close").click(function () {
                gumbic = 1;
                clearInterval(countdownTimer)
                if (ide == 1) {
                    ProgressCountdown(60, 'pageBeginCountdown', 'pageBeginCountdownText').then(value => odgovor());
                }
                nastavi()
            })
            if (podatci[questionCounter].Slika == "") {
                $("figure").hide()
            }
        }
    }

    // Substitute the submit button for the continue button:
    submitBtn.hide(300);

}
// Clicking on the submit button:
function nastavi() {
    document.getElementById("linkovi").innerHTML = "";
    if (questionCounter < podatci.length - 1) {
        questionCounter++;
    } else {
        document.getElementsByClassName('questions-page')[0].style.display = "none"
        document.getElementsByClassName('sakri')[0].style.display = "block"
        document.getElementsByClassName('results-page')[0].style.display = "block"
        // Display user score as a percentage
        userScore.text(Math.floor((correctAnswersCounter / podatci.length) * 100) + " %");
        prikazBodova.text(bodovi);
        $("#input-q2").attr("value", bodovi)
    }
    // Load the next question and set of answers
    generateQuestionAndAnswers();
    // Store the correct answer in a variable
    getCorrectAnswer();
    // Remove all selections, highlighting, and feedback
    clearHighlightsAndFeedback();
    // Hide the continue button
    continueBtn.hide(300);
    // Enable ability to select an answer
    answerDiv.on('click', function () {
        // Make the submit button visible
        // Remove pointer from any answer that already has it


        // Store current answer div for highlighting purposes
        getSelectedAnswerDivs(this);
        // Store current selection as user answer
        getUserAnswer(this);
        odgovor()
    }
    );

}

$(".questions-page__answer-div").dblclick(function () {

    odgovor()
})


function touchHandler(event) {
    var touches = event.changedTouches,
        first = touches[0],
        type = "";
    switch (event.type) {
        case "touchstart":
            type = "mousedown";
            break;
        case "touchmove":
            type = "mousemove";
            break;
        case "touchend":
            type = "mouseup";
            break;
        default:
            return;
    }
    // initMouseEvent(type, canBubble, cancelable, view, clickCount, 
    //                screenX, screenY, clientX, clientY, ctrlKey, 
    //                altKey, shiftKey, metaKey, button, relatedTarget);
    var simulatedEvent = document.createEvent("MouseEvent");
    simulatedEvent.initMouseEvent(type, true, true, window, 1,
        first.screenX, first.screenY,
        first.clientX, first.clientY, false,
        false, false, false, 0 /*left*/, null);
    first.target.dispatchEvent(simulatedEvent);
    event.preventDefault();
}

function hasTouch() {
    return 'ontouchstart' in document.documentElement
        || navigator.maxTouchPoints > 0
        || navigator.msMaxTouchPoints > 0;
}

if (hasTouch()) { // remove all the :hover stylesheets
    try { // prevent exception on browsers not supporting DOM styleSheets properly
        for (var si in document.styleSheets) {
            var styleSheet = document.styleSheets[si];
            if (!styleSheet.rules) continue;

            for (var ri = styleSheet.rules.length - 1; ri >= 0; ri--) {
                if (!styleSheet.rules[ri].selectorText) continue;

                if (styleSheet.rules[ri].selectorText.match(':hover')) {
                    styleSheet.deleteRule(ri);
                }
            }
        }
    } catch (ex) { }
}