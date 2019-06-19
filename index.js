const WebMergeAPI = require('webmerge').WebMergeAPI
const WebMergePromiseAPI = require('webmerge').WebMergePromiseAPI;
const wrap = require("./wrapresult");
const login = require("./public/js/login");
const express = require("express");

const app = express();
app.use('/public',express.static('public'));

var key = "PNNLI49BF4CEJSMQ21SDY46D9AH8";
var secret = "MIHNLBYA";

const webMerge = new WebMergeAPI(key, secret);
const webMergePromise = new WebMergePromiseAPI(key, secret);

var option = {};
option.search = "H1B";
var file = {};
file.id = 189218;
file.name="H1B 2018 - 0831";

app.get("/", function(req, res) {
    webMergePromise.getDocuments(option).then(function(response){
        console.log(response);
        res.set("Content-Type", "text/html");
        res.send(response);
    });
});

app.get("/login", function(req, res) {
    login.login(req, res);
});

app.post("/loginSuccess", function(req, res) {
        res.send("success");
});

app.get("/getFields", function(req, res) {
    webMergePromise.getDocumentFields(file.id).then(function(response){
        console.log(response);
        let result = wrap.wrapresult(file.name, response);
        res.set("Content-Type", "text/html");
        res.send(result);
    });
});


app.listen(3000, () => {
    console.log("listening on port 3000");
  });

