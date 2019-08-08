const ZCRMRestClient = require("zcrmsdk");
const WebMergeAPI = require("webmerge").WebMergeAPI;
const WebMergePromiseAPI = require("webmerge").WebMergePromiseAPI;
var fs = require('fs');
var PDFDocument = require('pdfkit');
var http = require('http');
const pdfMakePrinter = require('pdfmake/src/printer');
//build link with sftp
var Client = require('ssh2').Client;


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
        //console.log(data);
        //fs.writeFileSync('out.pdf',data1);
        //  var pdf_contents = "data1";
        //   var doc = new PDFDocument;
        //   doc.pipe(fs.createWriteStream('output.pdf'));
        //   doc.text(pdf_contents);
        //   doc.end();
        webMergePromise.mergeDocument(testfile.id, testfile.key, data1, 1, 1).then(function(response) {
          //console.log(response);
          // let result = wrap.wrapresult(file.name, response);
          // res.set("Content-Type", "text/html");
          // res.send(result);

          // console.log(typeof response); //should be an Object
          // console.log(response.toString('base64'));

          var pdf_contents = "data1";
          //1.~~~~~~~
          // var pdf_contents = response;
          // var doc = new PDFDocument;
          // doc.pipe(fs.createWriteStream('output.pdf'));
          // doc.text(pdf_contents);
          // doc.end();
          
          //2. ~~~~~~~
          // var outFile = fs.createWriteStream('output.pdf');
          // outFile.write(response);

          //3. ~~~~~~~~
          // const fontDescriptors = {};
          // const printer = new pdfMakePrinter(fontDescriptors);
          // const doc = printer.createPdfKitDocument(response);
          // doc.pipe(fs.createWriteStream('output.pdf'));        
          // doc.end();

          //4. ~~~~~~~
          // var file = fs.createWriteStream('output.pdf');
          // var stat = fs.statSync('output.pdf');
          // response.setHeader('Content-Length', stat.size);
          // response.setHeader('Content-Type', 'application/pdf');
          // response.setHeader('Content-Disposition', 'attachment; filename=quote.pdf');
          // file.pipe(response);

          //5.~~~~~~~~
          // fs.writeFile('output.pdf', response, 'binary', function(err){
          //   if(err)
          //     console.log(err);
          //   else
          //     console.log("This file was saved!");
          // })

          //6. ~~~~~~~~~
          // fs.writeFile('output.pdf', new Buffer(response, 'base64'), function(err){ 
          //     if(err){
          //       res.send(err);
          //     }else{
          //       res.send("save success");
          //     }          
          // });



          // expect(webMergePromise.client.post.mock.calls[0][0]).toEuqal({
          //   url:'/merge/1/key',
          //   qs: { test:1, download:1 },
          //   body: {},
          // })

          // 7. get file from sftp
          var connSettings = {
            host: '68.183.50.232',
            port: 22, // Normal is 22 port
            username: 'www-data',
            password: 'pRt,7bCHg9zVuexF'
            // You can use a key file too, read the ssh2 documentation
          };
          var conn = new Client();
            conn.on('ready', function() {
                conn.sftp(function(err, sftp) {
                    if (err) throw err;                   
                    var moveFrom = "/home/www-data/webmerge/Test1 -- 2019-08-08 01_20pm.pdf";
                    var moveTo = "output.pdf";

                    sftp.fastGet(moveFrom, moveTo , {}, function(downloadError){
                        if(downloadError) throw downloadError;

                        console.log("Succesfully download");
                    });
                });
            }).connect(connSettings);

          res.send("success");
        });
    },
    // mergeDoc: async function(input, res) {
    //     const response = await webMergePromise.mergeDocument(input.id, input.key, input.data, 1, 0);
    //     res.send("success");
    // }
}