module.exports = {
  wrapresult: function(header, data) {
    let result = `<html>
      <head>
      <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.3.1/css/bootstrap.min.css">
      </head>
      <body>
      <div class="container">
      <div class="jumbotron">
        <h1><center>${header}</center></h1> 
      </div> 
      <table class="table table-dark">
      <thead class="thead-dark">
      <tr>
      <th>key</th>
      <th>name</th>
      </tr>`;
    for (let i in data) {
      let record = data[i];

      let { Email, name } = record;
      if (typeof Module == "undefined") {
        Module = header;
      }
      result += `<tr>
        <td align="middle"> ${Email}</td>
        <td align="middle"> ${name}</td>
        <tr />`;
    }
    result += `</tr>
      </tabel>
      </div>
      </body>
      </html>`;
    return result;
  }
};
