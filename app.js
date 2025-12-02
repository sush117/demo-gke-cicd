const http = require('http');
const mysql = require('mysql2');
const qs = require('querystring');

// ----- Deployment Info -----
const port = process.env.PORT || 8080;
const version = process.env.VERSION || process.env.COMMIT_SHA || "dev";
const deployedAt = new Date().toISOString();

// ----- Database Pool (Auto-Reconnect) -----
const db = mysql.createPool({
  host: '127.0.0.1',
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  port: 3306,
  waitForConnections: true,
  connectionLimit: 5,
  queueLimit: 0
});

let dbStatus = "⏳ Connecting...";

db.getConnection((err, conn) => {
  if (err) {
    console.error("❌ Initial DB connection failed:", err);
    dbStatus = "❌ Database not connected";
  } else {
    console.log("✅ Connected to Cloud SQL MySQL successfully!");
    dbStatus = "✅ Database connected";
    conn.release();
  }
});


// ----- Web Server -----
http.createServer((req, res) => {
  if (req.method === "POST") {
    let body = "";
    req.on("data", chunk => (body += chunk));
    req.on("end", () => {
      const form = qs.parse(body);

      console.log("📨 Form received:", form);

      db.query(
        "INSERT INTO users (name, email) VALUES (?, ?)",
        [form.name, form.email],
        err => {
          if (err) console.error("❌ Insert failed:", err);
          else console.log("✅ Insert successful!");
          res.writeHead(302, { Location: "/" });
          res.end();
        }
      );
    });
    return;
  }

  // Read user records
  db.query("SELECT * FROM users ORDER BY id DESC LIMIT 10", (err, rows = []) => {
    if (err) {
      console.error("❌ Failed to fetch users:", err);
      rows = [];
    }

    const userList = rows
      .map(u => `<li>${u.name} (${u.email}) — ${u.submitted_at}</li>`)
      .join("");

    res.setHeader("Content-Type", "text/html");
    res.write(`
      <html>
        <head>
          <title>GKE + Cloud SQL User Data Demo</title>
          <style>
            body { font-family: Arial; margin: 30px; text-align: center; }
            .box { border: 2px solid #059862; border-radius: 10px; padding: 20px; display: inline-block; }
            input { padding: 8px; margin: 4px; }
            button { padding: 10px; margin-top: 6px; cursor: pointer; }
            ul { text-align: left; width: 50%; margin: 0 auto; }
          </style>
        </head>
        <body>
          <div class="box">
            <h1>🚀 GKE + Cloud SQL User Demo</h1>
            <p><b>Version:</b> ${version}</p>
            <p><b>Deployed at:</b> ${deployedAt}</p>
            <p><b>DB Status:</b> ${dbStatus}</p>

            <h3>Enter your details</h3>
            <form method="POST">
              <input type="text" name="name" placeholder="Your name" required><br>
              <input type="email" name="email" placeholder="Your email" required><br>
              <button type="submit">Submit</button>
            </form>

            <h3>Recent submissions</h3>
            <ul>${userList || "<p>No submissions yet</p>"}</ul>

            <p style="margin-top:20px;">💡 Stored in Cloud SQL MySQL in real time.</p>
          </div>
        </body>
      </html>
    `);
    res.end();
  });
}).listen(port, "0.0.0.0", () => console.log(`App running on port ${port}`));
