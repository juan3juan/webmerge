const ZCRMRestClient = require("zcrmsdk");
const WebMergeAPI = require("webmerge").WebMergeAPI;
const WebMergePromiseAPI = require("webmerge").WebMergePromiseAPI;
var fs = require("fs");
var PDFDocument = require("pdfkit");
var http = require("http");
const pdfMakePrinter = require("pdfmake/src/printer");
//build link with sftp
var Client = require("ssh2").Client;
var moment = require("moment-timezone");
const mappingDocument = require("./mappingDocument");

//webmerge key & secret
var key = "PNNLI49BF4CEJSMQ21SDY46D9AH8";
var secret = "MIHNLBYA";

const webMerge = new WebMergeAPI(key, secret);
const webMergePromise = new WebMergePromiseAPI(key, secret);

module.exports = {
  mergeZohoContacts: async function(input, res) {
    try {
      // zoho fields & webMerge fields mapping
      const respCaseInfo = await ZCRMRestClient.API.MODULES.get(input);
      let caseInfoData = JSON.parse(respCaseInfo.body).data[0];
      // console.log("caseInfoData");
      // console.log(caseInfoData);
      // mapping data according to the WebMerge document
      const mappingDatas = await mappingDocument.mappingData(
        input,
        caseInfoData
      );

      let integrateData = mappingDatas[0];
      let testfile = mappingDatas[1];
      // invoke mergeDocument from WebMerge
      const mergeDocu = await webMergePromise.mergeDocument(
        testfile.id,
        testfile.key,
        integrateData,
        1,
        1
      );

      var filename;
      // 7. get file from sftp
      var connSettings = {
        host: "178.128.158.189",
        port: 22, // Normal is 22 port
        username: "yury",
        password: "nyisdeploy"
        // You can use a key file too, read the ssh2 documentation
      };
      var conn = new Client();
      conn
        .on("ready", function() {
          conn.sftp(function(err, sftp) {
            if (err) throw err;
            //format the filename according to webMerge rule
            var curTime = moment()
              .tz("America/New_York")
              .format("YYYY-MM-DD hh_mma");
            console.log("curTime : " + curTime);
            //var dir = "/home/www-data/webmerge/";
            var dir = "/home/yury/WebMergeFile/";
            //change the file name from sftp
            //filename = "Test1 -- " + curTime + ".pdf";
            filename = input.document + " -- " + curTime + ".pdf";
            var moveFrom = dir + filename;
            var moveTo = "file/" + filename;
            console.log("filenameInside: " + filename);

            sftp.fastGet(moveFrom, moveTo, {}, function(downloadError) {
              if (downloadError) throw downloadError;
              console.log("Successfully download");
              // prepare input for upload
              var readStream = fs.createReadStream("file/" + filename);
              input.x_file_content = readStream;
              // upload file to
              const uploadFile = ZCRMRestClient.API.ATTACHMENTS.uploadFile(
                input
              );
              console.log(uploadFile);
            });
          });
        })
        .connect(connSettings);
      console.log("filename: " + filename);
      //res.send("success");
      res.redirect("/wm/success");
    } catch (e) {
      let merge_error = encodeURIComponent("Merge Exception!");
      res.redirect("/error?error=" + merge_error);
      throw new Error("Merge Exception!\n" + e);
    }
  }
};
