const http = require('http');
const path = require('path');
const { scrapeContent } = require('./scraper');
const fs = require('fs');



const PORT = process.env.PORT || 3000;
const server = http.createServer(function (request, response){
  const {url, method, headers } = request;

  if(request.method === 'GET'){
    const filePath = new URL(url, `http://${headers.host}`).pathname;
    let fileToGet = filePath === '/' ? '/front/index.html' : `/front/${filePath}`
    const filename = path.basename(filePath)
    let ext = path.extname(filename);
    let contentType = 'text/html';
    if(ext === '.js') contentType = 'application/json';
    if(ext === '.css') contentType = 'text/css';
    console.log(ext);
    response.writeHead(200, {'content-type': contentType});
    const file = path.join(__dirname, fileToGet);
    const rstream = fs.createReadStream(file);
    rstream.pipe(response);
    rstream.on('end', ()=> {
      rstream.close();
      response.end();
    })
  }

  if(request.method === 'POST'){

    let body = "";
    request.on('data', chunk => {
      body += chunk.toString();
    });

    request.on('end', () => {
      const obj = JSON.parse(body);
      console.log(obj);
      const filePath = `./files/${obj.file}`;
      const scrapedContent = fs.readFile( filePath, (error, content) => {

          if (error) {
            response.statusCode = 500;
            if (error.code === 'ENOENT') {
              console.error(`File does not exist: ${filePath}`);
              response.statusCode = 404;
            } else if (error.code === 'EACCES') {
              console.error(`Cannot read file: ${filePath}`);
            } else {
              console.error(
                'Failed to read file: %s. Received the following error: %s: %s ',
                filePath,
                error.code,
                error.message
              );
            }
            return response.end(error.message);
          }

          scrapeContent(content.toString(), obj.tags, obj.target)
          .then((data) => {
            console.log(obj.resultType);
            if(obj.resultType === 'json'){
              let result = JSON.stringify(data);
              response.writeHead(200,{'content-type':'application/json'});
              response.end(result);
            }
            if(obj.resultType === 'csv'){

              let resultPath = path.join(__dirname, '/files/temp.csv');
              fs.writeFile('./files/temp.csv', '', function (err) {
                if (err) throw err;
                console.log('File created.');
              })
              const writeStream = fs.createWriteStream(resultPath)
              data.forEach((elem) => {
                writeStream.write( elem + '\n' );
              })
              writeStream.end();
              writeStream.on('error', () => {
                console.log("there is a problem.");
              })
              writeStream.on('finish', () => {
                console.log("Written.");
                writeStream.close()
                var stat = fs.statSync(resultPath);

                response.writeHead(200, {
                  'Content-Type': 'text/csv',
                  'Content-Length': stat.size,
                  'Content-Disposition': `attachment: filename="${new Date().toISOString()}_temp.csv"`
                });
                console.log('Sending');

                let rstream = fs.createReadStream(resultPath)
                rstream.pipe(response)

                rstream.on('end', ()=>{
                  rstream.close()
                  response.end()
                  console.log('Sent!');


                  fs.unlink(resultPath, function (err) {
                    if (err) throw err;
                    console.log('File deleted!');
                  });
                })
              })




            }
          });
      });
    });
  }
});


server.on('error', err => {
  console.error(err);
  server.close();
});

server.on('close', () => console.log('Server closed.'));

server.listen(PORT, () => {
  console.log(`Listening on port: ${PORT}`);
});
