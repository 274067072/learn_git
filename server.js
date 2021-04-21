const http = require("http");

const hostname = "127.0.0.1";
const port = 8080;

const server = http.createServer((req, res) => {
  let body = [];
  req
    .on("error", (err) => {
      console.error(err);
    })
    .on("data", (chunk) => {
      body.push(chunk);
    })
    .on("end", () => {
      body = Buffer.concat(body).toString();
      res.writeHead(200, { "Content-Type": "text/html" });
      res.end(`<html lang="en">
      <head>
        <meta charset="UTF-8"/>
        <title>Document</title>
        <style>
          #box{
            width:80%;
            margin:0 auto;
            background: #ccc;
            text-align:center;
          }
          img{
            display: inline-block;
            padding:1.5%;
            width:21%;
            height:200px;
          }
        </style>
      </head>
      <body>
        <div id="box">
          <img src="http://img.mukewang.com/climg/5a45e49100014e5010601059.jpg" alt=""/>
          <img src="http://img.mukewang.com/climg/5a45e53b00012e6d09940789.jpg" alt=""/>
          <img src="http://img.mukewang.com/climg/5a45e53c0001d04e09940732.jpg" alt=""/>
          <img src="http://img.mukewang.com/climg/5a45e49100014e5010601059.jpg" alt=""/>
          <img src="http://img.mukewang.com/climg/5a45e53b00012e6d09940789.jpg" alt=""/>
          <img src="http://img.mukewang.com/climg/5a45e53c0001d04e09940732.jpg" alt=""/>
        </div>
      </body>
      </html>`);
    });
});

server.listen(port, hostname, () => {
  console.log(`Server running at http://${hostname}:${port}/`);
});
