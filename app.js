const http = require('http');
const port = process.env.PORT || 8080;

// These values will update automatically on each deployment via Cloud Build
const version = process.env.VERSION || process.env.COMMIT_SHA || "dev";
const deployedAt = new Date().toISOString();

http.createServer((req, res) => {
  res.setHeader("Content-Type", "text/html");
  res.write(`
    <html>
      <head>
        <title>GKE CI/CD Demo</title>
        <style>
          body { font-family: Arial; text-align: center; margin-top: 60px; }
          h1 { color: #059862; }
          .box { display: inline-block; padding: 20px; border: 2px solid #059862; border-radius: 12px; }
          p { font-size: 18px; }
          footer { margin-top: 40px; font-size: 14px; color: gray; }
        </style>
      </head>
      <body>
        <div class="box">
          <h1>This message means the app is successfully deployed on GKE</h1>
          <p><b>Version:</b> ${version}</p>
          <p><b>Deployed at:</b> ${deployedAt}</p>
          <p>💡 CI/CD Powered by Cloud Build → GCR → GKE</p>
        </div>

        <footer>
          <p>Make a code change and push again to see a new auto-deployment!</p>
        </footer>
      </body>
    </html>
  `);
  res.end();
}).listen(port, () => console.log(`App running on port ${port}`));
