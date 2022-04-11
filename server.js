require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
const bodyParser = require('body-parser');
const dns = require('dns');
const mongoose = require('mongoose');
var validUrl = require('valid-url');
// Basic Configuration
var jsonParser = bodyParser.json();

var urlencodedParser = bodyParser.urlencoded({ extended: false })
mongoose.connect(process.env.DATABASE,{
  useUnifiedTopology: true,
  useNewUrlParser: true
});
var urlSchema = new mongoose.Schema({urls:String, shortUrl:Number});
var model = mongoose.model("urls", urlSchema);
const port = process.env.PORT || 3000;

app.use(cors());

app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

app.post('/api/shorturl',urlencodedParser, async function(req,res){
  let inputedUrl = req.body.url;
  
  if(!validUrl.isWebUri(inputedUrl)){
     res.json({Error:"Invalid url"});
  }
  else{
    let dbEntries = await model.find();
    let count = parseInt(dbEntries.length)+1;
    await model.create({
    urls: inputedUrl,
    shortUrl:count 
  });
  res.json({original_url: inputedUrl, short_url: count }); 
  }
});

app.get("/api/shorturl/:id",function(req,res){
  model.findOne({ shortUrl: req.params.id }, function (err, result) {
    if(err) console.log(err);
    if(result == null){
      res.json({Error:"Invalid url"});
    }
    else{
      res.redirect(result.urls);
    }
  });
});



app.get('/api/hello', function(req, res) {
  res.json({ greeting: 'hello API' });
});

mongoose.connection.once('open',() => {
  console.log("Connected to MongoDB");
  app.listen(port, () => {
    console.log("Listening on port 3000");
  });
});