var vtpbf = require('vt-pbf');
var geojsonVt = require('geojson-vt');
var fs = require('fs');
var _ = require('lodash');
exports.getVectorTile = function(req, res, next) {
    var z = Number(req.params.z);
    var x = Number(req.params.x);
    var y = Number(req.params.y);
    var tileparam = {
        z: z,
        x: x,
        y: y
    };
    var orig = JSON.parse(fs.readFileSync(__dirname + '/data/data.geojson'))
    var tileindex = geojsonVt(orig);
    // z13-7032-2975
    var tile = tileindex.getTile(13, 7032, 2975);
    var alltiles = tileindex.tileCoords; // [{z: 0, x: 0, y: 0}, ...]
    var isExist = _.findIndex(alltiles, tileparam);
    if (isExist === -1) {
        res.send('未查询到数据');
    } else {
        var tile = tileindex.getTile(z, x, y);
        // pass in an object mapping layername -> tile object
        var buff = vtpbf.fromGeojsonVt({ 'geojsonLayer': tile });
        // fs.writeFileSync('test-tile.pbf', buff);
        res.set('Content-Type', 'application/x-protobuf');
        res.end(buff);
        // application/vnd.mapbox-vector-tile
    }

}
