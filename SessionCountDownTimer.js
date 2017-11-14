function getTimeRemaining(endtime) {
    var t = Date.parse(endtime) - Date.parse(new Date());
    var seconds = Math.floor((t / 1000) % 60);
    var minutes = Math.floor((t / 1000 / 60) % 60);
    var hours = Math.floor((t / (1000 * 60 * 60)) % 24);
    var days = Math.floor(t / (1000 * 60 * 60 * 24));
    return {
        'total': t,
        'days': days,
        'hours': hours,
        'minutes': minutes,
        'seconds': seconds
    };
}
var timeinterval;
function initializeClock(id, endtime) {
    var clock = document.getElementById(id);
    var minutesSpan = clock.querySelector('.minutes');
    var secondsSpan = clock.querySelector('.seconds');

    function updateClock() { 
        var t = getTimeRemaining(endtime);
        minutesSpan.innerHTML = ('0' + t.minutes).slice(-2);
        secondsSpan.innerHTML = ('0' + t.seconds).slice(-2); 
        if (t.total <= 0) { 
            clearInterval(timeinterval);
        } 
        if ( t.total === 0){
            console.log("Bye Bye Session is expired!");
            logoutFunc();
        }
    }

    updateClock();
    timeinterval = setInterval(updateClock, 1000); 
}

/**Global variables need for Session Dialogs**/
var sessionDetailsPath = "";
var killSession = true;
/**Methods used for Session Dialogs**/
function loadSessionDetails(path) {
    sessionDetailsPath = path;
    $.getJSON(path, function (result) {
        var details =
                "lastSessionActionTime = " + result.lastSessionActionTime + " \n" +
                "sessionTimoutTime = " + result.sessionTimoutTime + " \n" +
                "sessionWarningTime = " + result.sessionWarningTime + " \n" +
                "principal = " + result.principal;
        var lastSessionDt = new Date(result.lastSessionActionTime);
        var timeout = result.sessionTimoutTime * 60 * 1000;
        var warning = result.sessionWarningTime * 60 * 1000;
        var sessionWindow = lastSessionDt.getMilliseconds() + timeout;
        var sessionWarningWindow = sessionWindow - warning;

        //displayWarning(sessionWarningWindow);
        console.log("sessionWarningWindow = " + sessionWarningWindow);
        
        displayWarning(sessionWarningWindow, warning);
    });
}
function extendSession(path) {
    var jqxhr = $.getJSON(path, function () {
        console.log("Session has been extended and response from ../open/keepAlive was a success - " + new Date().toISOString());
    });
    killSession = false;
    $('#timeOutWarning').modal('hide');
    clearInterval(timeinterval);
    loadSessionDetails(sessionDetailsPath);
}
function displayWarning(timeToDisplayWarning, durationOfWarning) {
    setTimeout(
            function () {
                $('#timeOutWarning').modal('show');
                displayCountDown(durationOfWarning);
            }, 
            timeToDisplayWarning);
}
function killUserSession() {
    logoutFunc();
}
function logoutFunc() {
    $('#logoutForm').submit();
}
function displayCountDown(durationOfWarning) {
    console.log("warning interval inside display count = " + durationOfWarning);
    var deadline = new Date();
    deadline.setMilliseconds(durationOfWarning);
    initializeClock('clockdiv', deadline);
}

//var deadline = new Date(Date.parse(new Date()) + 15 * 24 * 60 * 60 * 1000);
//initializeClock('clockdiv', deadline);
