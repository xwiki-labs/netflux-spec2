/* globals window, WebSocket */
require(['/api/preconfigured-netflux.js',
        './bower_components/jquery/dist/jquery.js'], function (networkPromise) {
    var $ = window.jQuery;

    var $backscroll
    var webchannel;

    var logMsg = function (s) { $backscroll.val(function (i, v) { return v + '\n' + s; }); };

    networkPromise.then((network) => {
        network.join(window.location.hash.substring(1) || null).then(function(wc) {
            if (window.location.hash.substring(1) !== wc.id) {
                window.location.hash = '#' + wc.id;
            }
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

    var main = function () {
        $backscroll = $('#chatflux-backscroll');
        var $entry = $('#chatflux-entry');
        var logMsg = function (s) {
            $backscroll.val(function (i, v) { return v + '\n' + s; });
            $backscroll.scrollTop($backscroll[0].scrollHeight);
        };

        logMsg('connected');
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
                logMsg('<You> ' + msg);
                cb();
            } else {
                cb("Not connected to server");
            }
        };
    };
    main();
});
