const express = require("express");
const cookieParser = require("cookie-parser");
const path = require("path");
const app = express();

app.set("view engine", "ejs");
app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));
app.set("views", path.join(__dirname, "views"));
app.use(express.static(path.join(__dirname, "public")));

PORT = 52332
app.listen(PORT, () => {
    console.log(`Server Listening on http://localhost:${PORT}/`);
}).on("error", function(err) {
    console.log(err);
});

app.use('/',(req,res)=>{
    res.send("Node Server Intilized !!");
}) 