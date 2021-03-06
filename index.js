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
var moment = require("moment-timezone");
var URL = require("url").URL;

const app = express();
var router = express.Router();
app.use("/wm", router);
//app.use("/public", express.static("public"));

//zoho
router.get("/getContacts", function(req, res) {
  try {
    //obtain params from url
    let base_url = req.protocol + "://" + req.headers.host;
    // let request_url = req.url;
    let request_url = req.originalUrl;
    console.log("base_url : " + base_url);
    console.log("request_url : " + request_url);

    const current_url = new URL(request_url, base_url);
    const search_params = current_url.searchParams;
    console.log("current_url: " + current_url);
    console.log(search_params);
    let url_input = {};
    url_input.module = search_params.get("module");
    //url_input.module = "Contacts";
    url_input.id = search_params.get("id");
    url_input.document = search_params.get("document");
    console.log("url_input");
    console.log(url_input);
    ZCRMRestClient.initialize().then(function() {
      mysql_util.getOAuthTokens().then(function(result) {
        if (result == null || result.length === 0) {
          //This token needs to be updated for initialization
          let token =
            "1000.8b10455febcd56e8884f7d92799ec540.fd95d5251a143391c26791afc38c3aa2";
          initialzie.getTokenOnetime(token);
        } else {
          integrate.mergeZohoContacts(url_input, res);
          //getContacts(res);
          //uploadFile();
        }
      });
    });
  } catch (e) {
    let url_Error = "URL resolve exception!";
    res.redirect("/wm/error");
    throw new Error("URL resolve exception!\n" + e);
  }
  // process(auto injected, no need to import) used to process uncaughtException
  // process.on("uncaughtException", err => {
  //   console.error("There was an uncaught error", err);
  //   process.exit(1); //mandatory (as per the Node docs)
  // });
});

function getContacts(res) {
  let input = {};
  input.module = "Cases_Info";
  input.id = "3890818000011802561";

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
  input.id = "3890818000007128013";
  input.x_file_content = readStream;

  ZCRMRestClient.API.ATTACHMENTS.uploadFile(input).then(function(response) {
    console.log(response);
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
  // id: 253048,
  // key: "xbgmpq"
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

router.get("/", function(req, res) {
  webMergePromise.getDocuments(option).then(function(response) {
    var curTime = moment()
      .tz("America/New_York")
      .format("YYYY-MM-DD hh_mma");
    console.log("curTime : " + curTime);

    console.log(response);
    res.set("Content-Type", "text/html");
    res.send(response);
  });
});

router.get("/login", function(req, res) {
  //login.login(req, res);
  res.redirect("/success");
});

router.post("/loginSuccess", function(req, res) {
  //res.send("success");
});

router.get("/getFields", function(req, res) {
  webMergePromise.getDocumentFields(file.id).then(function(response) {
    console.log(response);
    let result = wrap.wrapresult(file.name, response);
    res.set("Content-Type", "text/html");
    res.send(result);
  });
});

router.get("/mergeFields", function(req, res) {
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

router.get("/getLeads", function(req, res) {
  ZCRMRestClient.initialize().then(function() {
    let input = {};
    input.module = "Leads";
    let params = {};
    params.page = 0;
    params.per_page = 100;
    input.params = params;
    ZCRMRestClient.API.MODULES.get(input).then(function(response) {
      let data = JSON.parse(response.body).data;
      console.log(data);
      let result = wrap.wrapresult(input.module, data);
      res.set("Content-Type", "text/html");
      res.send(result);
    });
    // const response = await ZCRMRestClient.API.MODULES.get(input);
    // let data = JSON.parse(response.body).data;
    // let result = wrap.wrapresult(input.module, data);
    // res.set("Content-Type", "text/html");
    // res.send(result);
  });
});

//invoke when the merge process success
router.get("/success", function(req, res) {
  //__dirname -- absolute path
  res.sendFile(__dirname + "/public/success.html");
});

//invoke when the merge process success
router.get("/error", function(req, res) {
  let error = req.query.error;
  //__dirname -- absolute path
  res.sendFile(__dirname + "/public/exception.html");
  console.log("error : " + error);
});

app.listen(3200, () => {
  console.log("listening on port 3200");
});
