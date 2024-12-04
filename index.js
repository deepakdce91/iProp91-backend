require("./config");
require('dotenv').config();
const express = require("express");
// importing cors 
var cors = require('cors');

const http = require("http");

const initializeWebSocket = require('./websocket/socket');

const app = express();
const port = process.env.PORT || 5100;
const server = http.createServer(app);

initializeWebSocket(server);


// parsing all json resonses
app.use(express.json());
// using cors 
app.use(cors()); 



app.use("/api/users",require("./routes/Auth/users"));
app.use("/api/admins",require("./routes/Auth/admins"));

app.use("/api/property",require("./routes/General/property"));

app.use("/api/safe",require("./routes/General/safe"));

 
app.use("/api/state",require("./routes/Configurations/state"));
app.use("/api/city",require("./routes/Configurations/city"));
app.use("/api/builders",require("./routes/Configurations/builders"));
app.use("/api/projects",require("./routes/Configurations/projects"));
app.use("/api/documentType",require("./routes/Configurations/documentType"));
app.use("/api/rejectedReasons",require("./routes/Configurations/rejectedReasons"));
app.use("/api/moreInfoReasons",require("./routes/Configurations/moreInfoReasons"));
 
app.use("/api/communities",require("./routes/Configurations/communities"));
app.use("/api/messages",require("./routes/Configurations/messages"));
app.use("/api/reportedMessages",require("./routes/Configurations/reportedMessages"));
app.use("/api/emailTemplates",require("./routes/Configurations/Emails/emailTemplates"));

app.use("/api/faqs",require("./routes/knowledgeCenter/faqs"));
app.use("/api/laws",require("./routes/knowledgeCenter/laws"));
app.use("/api/library",require("./routes/knowledgeCenter/library"));
app.use("/api/caseLaws",require("./routes/knowledgeCenter/caseLaws"));

app.use("/api/ownersFrom",require("./routes/Configurations/ownersFrom"));

app.use("/api/testimonials",require("./routes/frontendPreview/testimonials"));
app.use("/api/advise",require("./routes/frontendPreview/advise"));
app.use("/api/mobileTiles",require("./routes/frontendPreview/mobileTiles"));
app.use("/api/comparisons",require("./routes/frontendPreview/comparisons"));
app.use("/api/contactUs",require("./routes/frontendPreview/contactUs"));
app.use("/api/questions",require("./routes/frontendPreview/questionBuilder"));

 
server.listen(port,()=>{
    console.log(`listening at port no. ${port} `)
})
