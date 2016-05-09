var express = require('express');
var zlib = require('zlib');
var mapnik = require('mapnik');
if (mapnik.register_default_input_plugins) mapnik.register_default_input_plugins();
var SphericalMercator = require('sphericalmercator');
var mercator = new SphericalMercator({
    size: 256 //tile size
})
var router = express.Router();
var vtile = require('../controllers/vectorTile.js');
var pg = require('pg');
var conString = "postgres://WangMing:5201@localhost/template_postgis";
/* GET home page. */
router.get('/vt/:z/:x/:y', vtile.getVectorTile);

router.get('/vector-tiles/:layername/:z/:x/:y.pbf', function(req, res) {

    var bbox = mercator.bbox(+req.params.x, +req.params.y, +req.params.z,
        false,
        '4326'
    );
    //this initializes a connection pool
    //it will keep idle connections open for a (configurable) 30 seconds
    //and set a limit of 10 (also configurable)
    pg.connect(conString, function(err, client, done) {
        if (err) {
            return console.error('error fetching client from pool', err);
        }
        client.query("SELECT row_to_json (featcoll) FROM ( SELECT 'FeatureCollection' AS TYPE, array_to_json (ARRAY_AGG(feat)) AS features FROM ( SELECT 'Feature' AS TYPE, ST_AsGeoJSON (tbL.geom) :: json AS geometry, row_to_json ((SELECT l FROM(SELECT poiid) AS l)) AS properties FROM weibo AS tbL WHERE st_intersects ( geom, ST_MakeEnvelope ($1, $2, $3, $4, 4326))) AS feat ) AS featcoll;", [bbox[0], bbox[1], bbox[2], bbox[3]], function(err, result) {
            //call `done()` to release the client back to the pool
            done();
            if (err) {
                return console.error('error running query', err);
            }
            res.setHeader('Content-Encoding', 'deflate');
            res.setHeader('Content-Type', 'application/x-protobuf');
            var geojson = result.rows[0].row_to_json;
            console.log(req.params.z + ' ' + req.params.x + ' ' + req.params.y);
            if (geojson.features === null) {
                geojson.features = [];
            }
            // console.log(JSON.stringify(geojson));
            var vtile = new mapnik.VectorTile(+req.params.z, +req.params.x, +req.params.y);
            vtile.addGeoJSON(JSON.stringify(geojson), 'city');
            zlib.deflate(vtile.getData(), function(err, pbf) {
                    res.send(pbf);
                })
                //output: 1
        });
    });
    // select st_asgeojson(geom) as feature from table where st_intersects(geom, bbox)
})

module.exports = router;
