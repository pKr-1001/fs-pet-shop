import http from "node:http";
import fs from "node:fs";

const port = 8000;

const petRegExp = /^\/pets\/(.*)$/;

const server = http.createServer(function(req, res) {
  
    const method = req.method;
    const url = req.url;

    console.log(`${method} Request to ${url}`);
    let index;
    if (method === "GET" && url === "/pets") {
        fs.readFile('../pets.json', 'utf8', (err, data) => {
            if (err) {
                console.error(err);
                res.statusCode = 500;
                res.end();
                return;
            }
            res.setHeader('Content-Type', 'application/json');
            // res.end('All the pets');
            res.end(data);
        })
    } else if (method === "GET" && url.match(petRegExp)) {
        fs.readFile('../pets.json', 'utf8', (err, data) => {
            if (err) {
                console.error(err);
                res.statusCode = 500;
                res.end();
                return;
            }

            const index = Number.parseInt(url.match(petRegExp)[1]); // .parseInt() may be used instead of Number()
            const pets = JSON.parse(data);
            const petJSON = JSON.stringify(pets[index]);

            if(index < 0 || index >= pets.length || Number.isNaN(index)) {
                res.statusCode = 404;
                res.setHeader('Content-Type', 'text/plain');
                return res.end('Not Found');
            }
            
            res.setHeader('Content-Type', 'application/json');
            res.end(petJSON);
        })} else {
                res.statusCode = 404;
                res.end();
            }
        }
);

server.listen(port, function() {
  console.log('Listening on port', port);
});
