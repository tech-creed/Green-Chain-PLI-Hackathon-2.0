require('dotenv').config()
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


const AuthRoute = require('./routes/authRoute')


PORT = 52332
app.listen(PORT, () => {
    console.log(`Server Listening on http://localhost:${PORT}/`);
}).on("error", function(err) {
    console.log(err);
});


app.use('/auth',AuthRoute)

app.use('/',(req,res)=>{
    res.render("index");
}) 