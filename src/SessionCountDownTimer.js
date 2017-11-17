
(function ($) {
    $.fn.sessionCountDownTimer = function (ops) {
        var settings = $.extend({
            extendSessionPath: "/path/keepAlive",
            logoutPath: '/logout',
            logoutCsrfToken: 'token',
            lastSessionActionTime: 100000, //long milliseconds usually from session 
            sessiontTimeoutTime: 3, //minutes of inactivity before timeout 
            sessionWarningTime: 1 //minutes from end of timeout for warning   
        }, ops);
        
        return this.each(function () {
            createModal();
            loadSessionDetails(ops);
        });


        /**Global variables need for Session Dialogs**/
        var sessionDetailsPath = "";
        var timeinterval;
        var killSession = true;

        getTimeRemaining : function (endtime) {
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
        ;

        initializeClock : function (id, endtime) {
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
                if (t.total === 0) {
                    console.log("Bye Bye Session is expired!");
                    logoutFunc();
                }
            }

            updateClock();
            timeinterval = setInterval(updateClock, 1000);
        }
        ;

        loadSessionDetails: function () {

            var lastSessionDt = new Date(ops.lastSessionActionTime);
            var timeout = ops.sessionTimoutTime * 60 * 1000;
            var warning = ops.sessionWarningTime * 60 * 1000;
            var sessionWindow = lastSessionDt.getMilliseconds() + timeout;
            var sessionWarningWindow = sessionWindow - warning;
            //displayWarning(sessionWarningWindow);
            console.log("sessionWarningWindow = " + sessionWarningWindow);

            displayWarning(sessionWarningWindow, warning);
        }
        ;

        extendSession : function () {
            var jqxhr = $.getJSON(ops.extendSessionPath, function () {
                console.log("Session has been extended and response from ../open/keepAlive was a success - " + new Date().toISOString());
            });
            killSession = false;
            $('#timeOutWarning').modal('hide');
            clearInterval(timeinterval);
            loadSessionDetails(sessionDetailsPath);
        }
        ;

        logoutFunc : function () {
            var logoutform = '<form id="logoutForm" action="' + ops.logoutPath + '">' +
                    '<input type="hidden" value="' + ops.logoutCsrfToken + '"/></form>';
            $('#sessionRootId').append(logoutform);
            $('#logoutForm').submit();
        }
        ;
        displayWarning : function (timeToDisplayWarning, durationOfWarning) {
            setTimeout(
                    function () {
                        $('#timeOutWarning').modal('show');
                        displayCountDown(durationOfWarning);
                    },
                    timeToDisplayWarning);
        }
        ;
        displayCountDown: function (durationOfWarning) {
            console.log("warning interval inside display count = " + durationOfWarning);
            var deadline = new Date();
            deadline.setMilliseconds(durationOfWarning);
            initializeClock('clockdiv', deadline);
        }
        ;

        createModal : function () {
            var modal = '<div class="modal" id="timeOutWarning" tabindex="-1" role="dialog">' +
                    '   <div class="modal-dialog" role="document">' +
                    '    <div class="modal-content">' +
                    '     <div class="modal-header">' +
                    '       <h5 class="modal-title">Session Timeout Warning</h5>' +
                    '     </div>' +
                    '     <div class="modal-body">' +
                    '       <p><h3>Your session is about to Expire!</h3></p>' +
                    '       <p>To keep session alive please click Keep Alive</p>' +
                    '     </div>' +
                    '     <div class="container" id="clockContainer">  ' +
                    '       <div id="clockdiv">' +
                    '           <div class="row">' +
                    '               <span>' +
                    '                   <div>' +
                    '                       <span class="minutes"></span>' +
                    '                       <div class="smalltext">Minutes</span>' +
                    '                   </div>' +
                    '               </span>' +
                    '               <span>' +
                    '                   <div>' +
                    '                       <span class="seconds"></span>' +
                    '                       <div class="smalltext">Seconds</span>' +
                    '                   </div>' +
                    '               </span>' +
                    '           </div>' +
                    '       </div>' +
                    '     </div>' +
                    '     <div class="modal-footer">' +
                    '       <button type="button" id="keepAliveId" class="btn btn-primary">Keep Alive</button>' +
                    '       <button type="button" id="logoutId" class="btn btn-secondary" data-dismiss="modal">Logout</button>' +
                    '     </div>' +
                    '    </div>' +
                    '   </div>' +
                    '</div>';
            $('#sessionRootId').append(modal);
        }
        ;

        return this;
    };


}(jQuery));
