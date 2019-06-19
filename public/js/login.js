module.exports = {
    login: function(req, res) {
      let result = `
        <!DOCTYPE html>
          <html>
          <head>
          <link href="//maxcdn.bootstrapcdn.com/bootstrap/4.0.0/css/bootstrap.min.css" rel="stylesheet" id="bootstrap-css">
          <script src="//maxcdn.bootstrapcdn.com/bootstrap/4.0.0/js/bootstrap.min.js"></script>
          <script src="//cdnjs.cloudflare.com/ajax/libs/jquery/3.2.1/jquery.min.js"></script>
          <link rel="stylesheet" type="text/css" href="public/css/login.css" />
          </head>
          <body>
          <center>
          <h1>WebMerge Settings</h1>
          <div class="wrapper fadeInDown">
            <div id="formContent">
                <!-- Tabs Titles -->

                <!-- Icon -->
                <div class="fadeIn first">
                <img src="http://danielzawadzki.com/codepen/01/icon.svg" id="icon" alt="User Icon" />
                </div>

                <!-- Login Form -->
                <form action="/loginSuccess" method="post" name='form1'>
                <input type="text" id="login" class="fadeIn second" name="login" placeholder="login">
                <input type="text" id="password" class="fadeIn third" name="login" placeholder="password">
                <input type="submit" class="fadeIn fourth" value="Log In">
                </form>

                <!-- Remind Passowrd -->
                <div id="formFooter">
                <a class="underlineHover" href="#">Forgot Password?</a>
                </div>

            </div>
            </div>
            </center>
          </body>
          </html>`;
      //res.set("Content-Type", "text/html");
      res.send(result);
    }
  };