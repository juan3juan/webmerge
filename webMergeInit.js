const ZCRMRestClient = require("zcrmsdk");
const WebMergeAPI = require("webmerge").WebMergeAPI;
const WebMergePromiseAPI = require("webmerge").WebMergePromiseAPI;
var fs = require("fs");
var PDFDocument = require("pdfkit");
var http = require("http");
const pdfMakePrinter = require("pdfmake/src/printer");
//build link with sftp
var Client = require("ssh2").Client;
const moment = require("moment");

//webmerge key & secret
var key = "PNNLI49BF4CEJSMQ21SDY46D9AH8";
var secret = "MIHNLBYA";

const webMerge = new WebMergeAPI(key, secret);
const webMergePromise = new WebMergePromiseAPI(key, secret);

var testfile_G28_I765_test = {
  id: 323297,
  key: "4mxuat"
};

module.exports = {
  mergeZohoContacts: async function(input, res) {
    // zoho fields & webMerge fields mapping
    const respCaseInfo = await ZCRMRestClient.API.MODULES.get(input);
    let caseInfoData = JSON.parse(respCaseInfo.body).data[0];

    //integrate data from different modules
    let integrateData = {};
    let testfile = {};
    console.log("input.document : " + input.document);
    // check which document from url
    if (input.document == "G28_I765_test") {
      testfile = testfile_G28_I765_test;
      //obtain company & client info through case info record
      //extract company data
      let companyId = caseInfoData.Related_Company.id;
      let inputCompany = {};
      inputCompany.id = companyId;
      inputCompany.module = "Accounts";
      const respCompany = await ZCRMRestClient.API.MODULES.get(inputCompany);
      let companyData = JSON.parse(respCompany.body).data[0];
      console.log(companyData.Account_Name);
      //extract client data
      let clientId = caseInfoData.Related_Client.id;
      let inputClient = {};
      inputClient.id = clientId;
      inputClient.module = "Contacts";
      const respClient = await ZCRMRestClient.API.MODULES.get(inputClient);
      let clientData = JSON.parse(respClient.body).data[0];
      console.log(clientData.Email);
      //extract related case data
      let caseId = caseInfoData.Related_Case.id;
      let inputCase = {};
      inputCase.id = caseId;
      inputCase.module = "Deals";
      const respCase = await ZCRMRestClient.API.MODULES.get(inputCase);
      let caseData = JSON.parse(respCase.body).data[0];
      console.log(caseData.Case_Number);

      integrateData.G28_P3_10_DaytimeTelephone = clientData.Phone;
      integrateData.G28_P3_6a_FamilyName = companyData.Account_Name;
      integrateData.G28_P1_3b_Address = caseData.Case_Number;
    }

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
      host: "68.183.50.232",
      port: 22, // Normal is 22 port
      username: "www-data",
      password: "pRt,7bCHg9zVuexF"
      // You can use a key file too, read the ssh2 documentation
    };
    var conn = new Client();
    conn
      .on("ready", function() {
        conn.sftp(function(err, sftp) {
          if (err) throw err;
          //format the filename according to webMerge rule
          var curTime = moment().format("YYYY-MM-DD hh_mma");
          var dir = "/home/www-data/webmerge/";
          //change the file name from sftp
          //filename = "Test1 -- " + curTime + ".pdf";
          filename = input.document + " -- " + curTime + ".pdf";
          var moveFrom = dir + filename;
          var moveTo = filename;
          console.log("filenameInside: " + filename);

          sftp.fastGet(moveFrom, moveTo, {}, function(downloadError) {
            if (downloadError) throw downloadError;
            console.log("Successfully download");
            // prepare input for upload
            var readStream = fs.createReadStream(filename);
            input.x_file_content = readStream;
            // upload file to
            const uploadFile = ZCRMRestClient.API.ATTACHMENTS.uploadFile(input);
            console.log(uploadFile);
          });
        });
      })
      .connect(connSettings);
    console.log("filename: " + filename);
    res.send("success");
  },
  mappingData: async function(input, res) {},
  // prepare input for upload
  // var readStream = fs.createReadStream(filename);
  // input.x_file_content = readStream;
  // const uploadFile = ZCRMRestClient.API.ATTACHMENTS.uploadFile(input);
  // console.log(uploadFile);

  // webMergePromise
  //   .mergeDocument(testfile.id, testfile.key, data1, 1, 1)
  //   .then(function(response) {
  //     //console.log(response);
  //     // let result = wrap.wrapresult(file.name, response);
  //     // res.set("Content-Type", "text/html");
  //     // res.send(result);

  //     // console.log(typeof response); //should be an Object
  //     // console.log(response.toString('base64'));

  //     var pdf_contents = "data1";
  //     //1.~~~~~~~
  //     // var pdf_contents = response;
  //     // var doc = new PDFDocument;
  //     // doc.pipe(fs.createWriteStream('output.pdf'));
  //     // doc.text(pdf_contents);
  //     // doc.end();

  //     //2. ~~~~~~~
  //     // var outFile = fs.createWriteStream('output.pdf');
  //     // outFile.write(response);

  //     //3. ~~~~~~~~
  //     // const fontDescriptors = {};
  //     // const printer = new pdfMakePrinter(fontDescriptors);
  //     // const doc = printer.createPdfKitDocument(response);
  //     // doc.pipe(fs.createWriteStream('output.pdf'));
  //     // doc.end();

  //     //4. ~~~~~~~
  //     // var file = fs.createWriteStream('output.pdf');
  //     // var stat = fs.statSync('output.pdf');
  //     // response.setHeader('Content-Length', stat.size);
  //     // response.setHeader('Content-Type', 'application/pdf');
  //     // response.setHeader('Content-Disposition', 'attachment; filename=quote.pdf');
  //     // file.pipe(response);

  //     //5.~~~~~~~~
  //     // fs.writeFile('output.pdf', response, 'binary', function(err){
  //     //   if(err)
  //     //     console.log(err);
  //     //   else
  //     //     console.log("This file was saved!");
  //     // })

  //     //6. ~~~~~~~~~
  //     // fs.writeFile('output.pdf', new Buffer(response, 'base64'), function(err){
  //     //     if(err){
  //     //       res.send(err);
  //     //     }else{
  //     //       res.send("save success");
  //     //     }
  //     // });

  //     // expect(webMergePromise.client.post.mock.calls[0][0]).toEuqal({
  //     //   url:'/merge/1/key',
  //     //   qs: { test:1, download:1 },
  //     //   body: {},
  //     // })

  //     // 7. get file from sftp
  //     var connSettings = {
  //       host: "68.183.50.232",
  //       port: 22, // Normal is 22 port
  //       username: "www-data",
  //       password: "pRt,7bCHg9zVuexF"
  //       // You can use a key file too, read the ssh2 documentation
  //     };
  //     var conn = new Client();
  //     conn
  //       .on("ready", function() {
  //         conn.sftp(function(err, sftp) {
  //           if (err) throw err;
  //           //format the filename according to webMerge rule
  //           var curTime = moment().format("YYYY-MM-DD hh_mma");
  //           var dir = "/home/www-data/webmerge/";
  //           filename = "Test1 -- " + curTime + ".pdf";
  //           var moveFrom = dir + filename;
  //           var moveTo = filename;

  //           sftp.fastGet(moveFrom, moveTo, {}, function(downloadError) {
  //             if (downloadError) throw downloadError;
  //             console.log("Succesfully download");
  //           });
  //         });
  //       })
  //       .connect(connSettings);

  //     // upload pdf to certain zoho record
  //     // var readStream = fs.createReadStream(filename);
  //     // let input = {};
  //     // input.module = "Contacts";
  //     // input.id = "3890818000007597014";
  //     // input.x_file_content = readStream;

  //     // ZCRMRestClient.API.ATTACHMENTS.uploadFile(input).then(function(
  //     //   response
  //     // ) {
  //     //   response = JSON.parse(response.body);
  //     //   response = response.data[0];
  //     //   console.log(response);
  //     //   // The attachment id of the uploaded file can be obtained from response.details.id
  //     //   console.log(response.details.id);
  //     // });

  //     res.send("success");
  //     var readStream = fs.createReadStream(filename);
  //     input.x_file_content = readStream;
  //   })
  //   .then(input => ZCRMRestClient.API.ATTACHMENTS.uploadFile(input))
  //   .catch(failureCallback);

  // mergeDoc: async function(input, res) {
  //     const response = await webMergePromise.mergeDocument(input.id, input.key, input.data, 1, 0);
  //     res.send("success");
  // }
  uploadFile: function(filename) {
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
};
