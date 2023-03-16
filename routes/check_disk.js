require('dotenv').config();
const url = require('url');
let response = null;
const filterResult = '/run/lock';
const token = process.env.TOKEN_FOR_WEB;

var express = require('express');
var router = express.Router();

const execute = require('../services/command').execute;
const generateCommandForShow = require('../services/disk').generateCommandForShow;

router.get('/', function(req, res, next) {
    res.statusCode = 200;
    res.setHeader('Content-Type', 'text/plain');
    const q = url.parse(req.url, true).query;
    if (Object.keys(q).length > 0 && q.t != null) {
        if (q.t != token) {
            res.end('Token is not correct.\n');
        } else {
            response = res;
            let filter = '';
            if (q.a == null || q.a == undefined) {
                filter = filterResult;
                if (q.f != null) {
                    filter = q.f;
                }
            }

            execute(generateCommandForShow(filter), show);
        }
    } else {
        res.end('We need a token.\n');
    }
});

function show(stdout) {
    response.end(stdout);
}

module.exports = router;
