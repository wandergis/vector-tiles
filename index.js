var vtpbf = require('vt-pbf');
var geojsonVt = require('geojson-vt');
var fs = require('fs');

var orig = JSON.parse(fs.readFileSync(__dirname + '/data/data.geojson'))
var tileindex = geojsonVt(orig);
// z13-7032-2975
var tile = tileindex.getTile(13, 7032, 2975);
console.log(tileindex.tileCoords); // [{z: 0, x: 0, y: 0}, ...]

// pass in an object mapping layername -> tile object
var buff = vtpbf.fromGeojsonVt({ 'geojsonLayer': tile });
fs.writeFileSync('test-tile.pbf', buff);
