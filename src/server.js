const { createServer } = require("http");
const { parse } = require("url");
const next = require("next");
const fs = require("fs");
const path = require("path");

const dev = process.env.NODE_ENV !== "production";
const app = next({ dev });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  createServer((req, res) => {
    const parsedUrl = parse(req.url, true);
    const { pathname } = parsedUrl;

    if (pathname.startsWith("/recordings/")) {
      const filePath = path.join(process.cwd(), "public", pathname);
      fs.stat(filePath, (err, stat) => {
        if (err || !stat.isFile()) {
          handle(req, res, parsedUrl);
        } else {
          const stream = fs.createReadStream(filePath);
          res.writeHead(200, {
            "Content-Type": "audio/x-wav",
            "Content-Length": stat.size,
          });
          stream.pipe(res);
        }
      });
    } else {
      handle(req, res, parsedUrl);
    }
  }).listen(3000, (err) => {
    if (err) throw err;
    console.log("> Ready on http://localhost:3000");
  });
});
