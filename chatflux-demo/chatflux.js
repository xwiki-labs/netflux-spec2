/* globals window, WebSocket */
require(['/api/preconfigured-netflux.js',
        './bower_components/jquery/dist/jquery.js'], function (networkPromise) {
    var $ = window.jQuery;

    var $backscroll
    var webchannel;

    var logMsg = function (s) { $backscroll.val(function (i, v) { return v + '\n' + s; }); };

    networkPromise.then((network) => {
        network.join((''+window.location.hash).replace('#', '')).then(function(wc) {

            webchannel = wc;
            wc.on('message', function (msg, sender) {
                logMsg('<' + sender + '> ' + msg);
            });
            wc.on('join', function(person) {
                logMsg('* ' + person + ' has joined');
            });
            wc.on('leave', function(person, reason) {
                logMsg('* ' + person + ' has left ' + reason);
            });

        }, function(error) {
            console.error(error);
        });
    });

    var send = function (msg, cb) {
        if(typeof webchannel !== "undefined") {
            webchannel.send(msg);
            cb();
        }
        else {
            cb("Not connected to server");
        }
    };

    var main = function () {
        $backscroll = $('#chatflux-backscroll');
        var $entry = $('#chatflux-entry');
        var logMsg = function (s) {
            $backscroll.val(function (i, v) { return v + '\n' + s; });
            $backscroll.scrollTop($backscroll[0].scrollHeight);
        };

        $entry.on('keydown', function (evt) {
            if (evt.keyCode !== 13) { return; }
            send($entry.val(), function (err) {
                if (err) {
                    logMsg('ERROR: ' + err);
                    return;
                }
                $entry.val('');
            });
        });

        var send = function (msg, cb) {
            if(typeof webchannel !== "undefined") {
                webchannel.bcast(msg);
                cb();
            }
            else {
                cb("Not connected to server");
            }
        };
    };
    main();
});
