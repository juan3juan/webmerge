const ZCRMRestClient = require("zcrmsdk");
const WebMergeAPI = require("webmerge").WebMergeAPI;
const WebMergePromiseAPI = require("webmerge").WebMergePromiseAPI;

//webmerge key & secret
var key = "PNNLI49BF4CEJSMQ21SDY46D9AH8";
var secret = "MIHNLBYA";

const webMerge = new WebMergeAPI(key, secret);
const webMergePromise = new WebMergePromiseAPI(key, secret);

var testfile = {
    id: 248985,
    key: "bpv4ii"
  };

module.exports = {
    mergeZohoContacts: async function(input, res) {
        const resp = await ZCRMRestClient.API.MODULES.get(input);
        let data = JSON.parse(resp.body).data[0];
        console.log(data);
        webMergePromise.mergeDocument(testfile.id, testfile.key, data, 1, 0).then(function(response) {
          console.log(response);
          // let result = wrap.wrapresult(file.name, response);
          // res.set("Content-Type", "text/html");
          // res.send(result);
          var pdf_contents = response;
          res.send("success");
        });
    },
    // mergeDoc: async function(input, res) {
    //     const response = await webMergePromise.mergeDocument(input.id, input.key, input.data, 1, 0);
    //     res.send("success");
    // }
}