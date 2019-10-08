const WebMergeAPI = require("webmerge").WebMergeAPI;
const WebMergePromiseAPI = require("webmerge").WebMergePromiseAPI;
const wrap = require("./wrapresult");
const login = require("./public/js/login");
const express = require("express");
//zoho crm
const ZCRMRestClient = require("zcrmsdk");
const mysql_util = require("zcrmsdk/lib/js/mysql/mysql_util");
const initialzie = require("./Initialize");
var bodyParser = require("body-parser");
var urlencodedParser = bodyParser.urlencoded({ extended: true });
const integrate = require("./webMergeInit");
var fs = require("fs");
const moment = require("moment");

const app = express();
app.use("/public", express.static("public"));

//zoho
app.get("/getContacts", function(req, res) {
  ZCRMRestClient.initialize().then(function() {
    mysql_util.getOAuthTokens().then(function(result) {
      if (result == null || result.length === 0) {
        //This token needs to be updated for initialization
        let token =
          "1000.844ffa047696e1c31aa44fabd487c6b6.8931baa8bce8e7251a379ccf3cc38208";
        initialzie.getTokenOnetime(token);
      } else {
        getContacts(res);
        //uploadFile();
      }
    });
  });
});

function getContacts(res) {
  let input = {};
  input.module = "Contacts";
  input.id = "3890818000007597014";
  //input.body = leadJSON;
  // let params = {};
  // params.page = 0;
  // params.per_page = 100;
  // input.params = params;
  integrate.mergeZohoContacts(input, res);
}

function uploadFile() {
  var filename = "Test1 -- 2019-10-08 03_03pm.pdf";
  var readStream = fs.createReadStream(filename);
  let input = {};
  input.module = "Contacts";
  input.id = "3890818000007597014";
  input.x_file_content = readStream;

  ZCRMRestClient.API.ATTACHMENTS.uploadFile(input).then(function(response) {
    response = JSON.parse(response.body);
    response = response.data[0];
    console.log(response);
    // The attachment id of the uploaded file can be obtained from response.details.id
    console.log(response.details.id);
  });
}

//webmerge key & secret
var key = "PNNLI49BF4CEJSMQ21SDY46D9AH8";
var secret = "MIHNLBYA";

const webMerge = new WebMergeAPI(key, secret);
const webMergePromise = new WebMergePromiseAPI(key, secret);

//some test data
var option = {};
option.search = "H1B";

var file = {};
file.id = 189218;
file.name = "H1B 2018 - 0831";
file.key = "u73i5c";

var testfile = {
  id: 248985,
  key: "bpv4ii"
};

var data = {
  // CompanyName: "NYIS",
  // L9_DayTime_Phone: "88888888",
  // L11_Email: "test@nyis.com"
  fullname: "Jihan",
  dob: "feb271989",
  CompanyName: "JPM"
};

app.get("/", function(req, res) {
  webMergePromise.getDocuments(option).then(function(response) {
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
  webMergePromise.getDocumentFields(file.id).then(function(response) {
    console.log(response);
    let result = wrap.wrapresult(file.name, response);
    res.set("Content-Type", "text/html");
    res.send(result);
  });
});

app.get("/mergeFields", function(req, res) {
  webMergePromise
    .mergeDocument(testfile.id, testfile.key, data, 1, 0)
    .then(function(response) {
      console.log(response);
      // let result = wrap.wrapresult(file.name, response);
      // res.set("Content-Type", "text/html");
      // res.send(result);
      var pdf_contents = response;
      res.send("success");
    });
});

app.listen(3000, () => {
  console.log("listening on port 3000");
});
