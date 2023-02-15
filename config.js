//Import the express dependency
const express = require("express");
//Instantiate an express app, the main work horse of this server
const app = express();
const path = require("path");
//Save the port number where your server will be listening
const port = 5000;

// call to routes.js file
app.use("/", require("./JS/routes"));

// make public files
app.use(express.static(path.join(__dirname, "/public")));

app.listen(port, () => {
  console.log(`Now listening on port ${port}`);
});
