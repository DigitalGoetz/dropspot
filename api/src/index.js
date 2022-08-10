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

app.get('/files', function (req, res) {
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
  let filename = decodeURI(req.params.filename);
  res.download(dir + filename);
});

app.delete('/files/:filename', function (req, res) {
  let filename = decodeURI(req.params.filename);
  fs.rmSync(dir + filename);
  res.status(200)
});

app.post('/files', function (req, res) {
  let uploadedFile;
  let uploadPath;

  if (!req.files || Object.keys(req.files).length === 0) {
    return res.status(400).send('No files were uploaded.');
  }

  // The name of the input field (i.e. "sampleFile") is used to retrieve the uploaded file
  console.log(req.files)
  uploadedFile = req.files.uploadedFile;
  console.log(uploadedFile)
  uploadPath = dir + uploadedFile.name;

  // Use the mv() method to place the file somewhere on your server
  uploadedFile.mv(uploadPath, function (err) {
    if (err)
      return res.status(500).send(err);

    res.send('File uploaded!');
  });
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});

