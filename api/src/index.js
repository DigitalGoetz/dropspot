const path = require('path');
const fs = require('fs');
const express = require('express');
var cors = require('cors');
const fileUpload = require('express-fileupload');

const app = express();
const port = 4500;

var dir = '/dropspot/';
const maxUploadBytes = 5 * 1024 * 1024 * 1024;
const maxTotalBytes = 20 * 1024 * 1024 * 1024;
const progressStepPercent = 5;
const uploadProgressSessions = new Map();

const getDirectorySize = (targetDir) => {
  const entries = fs.readdirSync(targetDir);

  return entries.reduce((total, name) => {
    const filePath = path.join(targetDir, name);
    const stats = fs.statSync(filePath);

    if (stats.isDirectory()) {
      return total + getDirectorySize(filePath);
    }

    if (stats.isFile()) {
      return total + stats.size;
    }

    return total;
  }, 0);
};

const getUploadId = (req) => {
  const queryId = req.query && req.query.uploadId;
  const headerId = req.headers['x-upload-id'];

  if (Array.isArray(queryId)) {
    return queryId[0];
  }

  return queryId || headerId || null;
};

const getOrCreateProgressSession = (uploadId) => {
  let session = uploadProgressSessions.get(uploadId);

  if (!session) {
    session = {
      uploadId,
      clients: new Set(),
      totalBytes: 0,
      receivedBytes: 0,
      lastPercentSent: -progressStepPercent,
      status: 'idle'
    };
    uploadProgressSessions.set(uploadId, session);
  }

  return session;
};

const sendProgress = (session, payload) => {
  if (!session.clients.size) {
    return;
  }

  const message = `data: ${JSON.stringify(payload)}\n\n`;
  session.clients.forEach((client) => {
    client.write(message);
  });
};

const maybeSendProgress = (session, status, force = false) => {
  const totalBytes = session.totalBytes;
  const percent = totalBytes
    ? Math.min(Math.floor((session.receivedBytes / totalBytes) * 100), 100)
    : null;

  if (percent === null && !force) {
    return;
  }

  if (!force && percent < session.lastPercentSent + progressStepPercent && percent !== 100) {
    return;
  }

  if (percent !== null) {
    session.lastPercentSent = percent;
  }

  sendProgress(session, {
    uploadId: session.uploadId,
    bytesReceived: session.receivedBytes,
    totalBytes: session.totalBytes,
    percent,
    status
  });
};

const uploadProgressMiddleware = (req, res, next) => {
  if (req.method !== 'POST') {
    return next();
  }

  const uploadId = getUploadId(req);

  if (!uploadId) {
    return next();
  }

  const totalBytes = Number(req.headers['content-length']) || 0;
  const session = getOrCreateProgressSession(uploadId);

  session.totalBytes = totalBytes;
  session.receivedBytes = 0;
  session.lastPercentSent = -progressStepPercent;
  session.status = 'uploading';

  req.pause();

  const handleData = (chunk) => {
    session.receivedBytes += chunk.length;
    maybeSendProgress(session, 'uploading');
  };

  const handleEnd = () => {
    if (session.totalBytes && session.receivedBytes < session.totalBytes) {
      session.receivedBytes = session.totalBytes;
    }
    maybeSendProgress(session, 'uploaded', true);
  };

  const handleAborted = () => {
    session.status = 'aborted';
    maybeSendProgress(session, 'aborted', true);
  };

  req.on('data', handleData);
  req.on('end', handleEnd);
  req.on('aborted', handleAborted);

  res.on('finish', () => {
    session.status = res.statusCode >= 400 ? 'error' : 'complete';
    maybeSendProgress(session, session.status, true);
    setTimeout(() => {
      if (session.clients.size === 0) {
        uploadProgressSessions.delete(uploadId);
      }
    }, 60000);
  });

  next();
  req.resume();
};

if (!fs.existsSync(dir)) {
  fs.mkdirSync(dir, { recursive: true });
}

app.use(cors());
const uploadMiddleware = fileUpload({
  limits: { fileSize: maxUploadBytes },
  abortOnLimit: true
});
app.use('/web', express.static('web'));


app.get("/", function (req, res) {
  res.redirect("/web");
});

app.get('/files', function (req, res) {
  console.log("Providing content listing");
  try {
    const entries = fs.readdirSync(dir);
    const files = entries.reduce((acc, name) => {
      const filePath = path.join(dir, name);
      const stats = fs.statSync(filePath);

      if (stats.isFile()) {
        acc.push({ name, size: stats.size });
      }

      return acc;
    }, []);

    res.json(files);
  } catch (err) {
    console.log('Unable to scan directory: ' + err);
    res.status(500).send('Unable to list files.');
  }
});

app.get('/files/capacity', function (req, res) {
  console.log("Providing capacity");
  try {
    const usedBytes = getDirectorySize(dir);
    const remainingBytes = Math.max(maxTotalBytes - usedBytes, 0);
    const percentUsed = maxTotalBytes === 0
      ? 0
      : Math.min((usedBytes / maxTotalBytes) * 100, 100);

    res.json({
      usedBytes,
      remainingBytes,
      maxBytes: maxTotalBytes,
      percentUsed
    });
  } catch (err) {
    console.log('Unable to scan directory: ' + err);
    res.status(500).send('Unable to calculate capacity.');
  }
});

app.get('/files/progress/:uploadId', function (req, res) {
  const uploadId = req.params.uploadId;
  const session = getOrCreateProgressSession(uploadId);

  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  if (res.flushHeaders) {
    res.flushHeaders();
  }

  session.clients.add(res);
  maybeSendProgress(session, session.status, true);

  req.on('close', () => {
    session.clients.delete(res);
    if (session.clients.size === 0 && session.status !== 'uploading') {
      uploadProgressSessions.delete(uploadId);
    }
  });
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

app.post('/files', uploadProgressMiddleware, uploadMiddleware, function (req, res) {
  console.log("Uploading File")
  let uploadedFile;
  let uploadPath;

  if (!req.files || Object.keys(req.files).length === 0) {
    return res.status(400).send('No files were uploaded.');
  }

  uploadedFile = req.files.uploadedFile;
  uploadPath = dir + uploadedFile.name;

  let currentTotalBytes;

  try {
    currentTotalBytes = getDirectorySize(dir);
  } catch (err) {
    console.log('Unable to scan directory: ' + err);
    return res.status(500).send('Unable to validate storage limit.');
  }

  if (currentTotalBytes + uploadedFile.size > maxTotalBytes) {
    return res.status(500).send('Storage limit exceeded.');
  }

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
