require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
const dns = require('dns');
const { URL } = require('url');

// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());

app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

app.use(express.urlencoded({ extended: true }));

const urls = {};

function isValidUrl(inputUrl) {
  return new Promise((resolve, reject) => {
    try {
      const { hostname } = new URL(inputUrl);
      dns.lookup(hostname, (err, _) => {
        console.log("Failed DNS lookup.");
        resolve(!err);
      });
    } catch {
      resolve(false);
    }
  });
}

app.post('/api/shorturl', async (req, res) => {
  let { url } = req.body;

  const isValid = await isValidUrl(url);
  if (!url || !isValid) return res.json({ error: "invalid url" });

  const short_url = Object.keys(urls).length + 1;
  urls[short_url] = url;

  res.json({ short_url, original_url: url });
});

app.get('/api/shorturl/:url', (req, res) => {
  const { url } = req.params;

  if (!urls.hasOwnProperty(url)) {
    return res.status(400).send("Invalid url.");
  }

  res.redirect(urls[url]);
});

app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});
