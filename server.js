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
            display:flex;
            justifyContent:space-around;
            background-color:rgb(255,192,203);
            width:800px;
          }
          div{
            background-color:rgb(135,206,250);
            width:150px;
            height:150px;
          }
        </style>
      </head>
      <body>
        <div id="box">
          <div></div>
          <div></div>
          <div></div>
        </div>
      </body>
      </html>`);
    });
});

server.listen(port, hostname, () => {
  console.log(`Server running at http://${hostname}:${port}/`);
});
