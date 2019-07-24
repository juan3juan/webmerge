const ZCRMRestClient = require("zcrmsdk");
const WebMergeAPI = require("webmerge").WebMergeAPI;
const WebMergePromiseAPI = require("webmerge").WebMergePromiseAPI;
var fs = require('fs');
var PDFDocument = require('pdfkit');

//webmerge key & secret
var key = "PNNLI49BF4CEJSMQ21SDY46D9AH8";
var secret = "MIHNLBYA";

const webMerge = new WebMergeAPI(key, secret);
const webMergePromise = new WebMergePromiseAPI(key, secret);

var testfile = {
  //two params
    id: 253048,
    key: "xbgmpq"
    // more params but still test
    // id: 248985,
    // key: "bpv4ii"
  };

module.exports = {
    mergeZohoContacts: async function(input, res) {
        const resp = await ZCRMRestClient.API.MODULES.get(input);
        let data = JSON.parse(resp.body).data[0];
        let data1 = {};
        data1.PhoneKey = data.Phone;
        data1.EmailKey = data.Email;
        console.log(data);
        webMergePromise.mergeDocument(testfile.id, testfile.key, data1, 1, 1).then(function(response) {
          //console.log(response);
          // let result = wrap.wrapresult(file.name, response);
          // res.set("Content-Type", "text/html");
          // res.send(result);
          var pdf_contents = response;
          var doc = new PDFDocument;
          doc.pipe(fs.createWriteStream('output.pdf'));
          
          doc.text(pdf_contents);
          doc.end();
          // expect(webMergePromise.client.post.mock.calls[0][0]).toEuqal({
          //   url:'/merge/1/key',
          //   qs: { test:1, download:1 },
          //   body: {},
          // })
          res.send("success");
        });
    },
    // mergeDoc: async function(input, res) {
    //     const response = await webMergePromise.mergeDocument(input.id, input.key, input.data, 1, 0);
    //     res.send("success");
    // }
}