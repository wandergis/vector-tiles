var express = require('express');
var router = express.Router();
var vtile = require('../controllers/vectorTile.js');
/* GET home page. */
router.get('/vt/:z/:x/:y', vtile.getVectorTile);

module.exports = router;
