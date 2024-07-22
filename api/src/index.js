const path = require('path');
const fs = require('fs');
const express = require('express');
var cors = require('cors');
const fileUpload = require('express-fileupload');

const app = express();
const port = 4500;

var dir = '/dropspot/';

if (!fs.existsSync(dir)) {
  fs.mkdirSync(dir, { recursive: true });
}

app.use(cors());
app.use(fileUpload());
app.use('/web', express.static('web'));


app.get("/", function (req, res) {
  res.redirect("/web");
});

app.get('/files', function (req, res) {
  console.log("Providing content listing");
  let files = fs.readdirSync(dir, function (err, files) {

    if (err) {
      return console.log('Unable to scan directory: ' + err);
    }

    files.forEach(function (file) {
      files.push(file)
    });
  });

  res.json(files);
});

app.get('/files/:filename', function (req, res) {
  console.log("Providing File");
  let filename = decodeURI(req.params.filename);
  res.download(dir + filename);
});

app.delete('/files/:filename', function (req, res) {
  console.log("Deleting File")
  let filename = decodeURI(req.params.filename);
  fs.rmSync(dir + filename);
  console.log("Delete Complete")
  return res.status(200).send("File deleted.");
});

app.post('/files', function (req, res) {
  console.log("Uploading File")
  let uploadedFile;
  let uploadPath;

  if (!req.files || Object.keys(req.files).length === 0) {
    return res.status(400).send('No files were uploaded.');
  }

  uploadedFile = req.files.uploadedFile;
  uploadPath = dir + uploadedFile.name;

  uploadedFile.mv(uploadPath, function (err) {
    if (err)
      return res.status(500).send(err);

    res.status(202)
    res.send('File uploaded!');

  });
});

app.listen(port, "0.0.0.0", () => {
  console.log(`Example app listening on port ${port}`);
});

