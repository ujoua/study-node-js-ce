var http = require('http');
var url = require('url');
var fs = require('fs');
var qs = require('querystring');
var layout = require('./layout');

var app = http.createServer(function(request, response){
    var _url = request.url;
    var _query = url.parse(_url, true).query;
    var _pathname = url.parse(_url, true).pathname;
    
    if (_pathname == '/') {
      fs.readdir('data/', function(error, files) {
        var list = layout.getList(files);

        fs.readFile(`data/${_query.title}`, function(error, description){
          var title = _query.title;
          if (title == undefined) {
            title = 'Welcome';
            description = 'Hello, Node.js!';
          }
  
          var html = layout.getHtml(list, title, description);

          response.writeHead(200);
          response.end(html);
        });
      })
    } else if (_pathname == '/create') {      
      fs.readdir('data/', function(error, files){
        var list = layout.getList(files);

        var title = 'Create';
        var form = `
        <form action="/create_process" method="post">
          <div><input type="submit"></div>
          <div><input type="text" name="title" placeholder="title"></div>
          <div><textarea name="description" placeholder="description"></textarea></div>
        </form>
        `;

        var html = layout.getHtml(list, title, form);

        response.writeHead(200);
        response.end(html);
      });
    } else if (_pathname == '/create_process') {
      var data = '';
      request.on('data', function(chunk){
        data += chunk;        
      });
      request.on('end', function(){
        var dataParsed = qs.parse(data);
        var title = dataParsed.title;
        var description = dataParsed.description;
        
        fs.writeFile(`data/${title}`, description, function(err){
          if (err) throw err;
          response.writeHead(302, { 'Location': `/?title=${title}` });
          response.end();
        });
      });
    } else if (_pathname == '/update') {      
      fs.readdir('data/', function(error, files){
        var list = layout.getList(files)

        fs.readFile(`data/${_query.title}`, function(error, description){
          var title = 'Update';
          var form = `
          <form action="/update_process" method="post">
            <div><input type="submit"></div>
            <div><input type="hidden" name="titlePrev" value="${_query.title}"> </div>
            <div><input type="text" name="title" placeholder="title" value="${_query.title}"></div>
            <div><textarea name="description" placeholder="description">${description}</textarea></div>
          </form>
          `;

          var html = layout.getHtml(list, title, form);

          response.writeHead(200);
          response.end(html);
        });
      });
    } else if (_pathname == '/update_process') {
      var data = '';
      request.on('data', function(chunk){
        data += chunk;        
      });
      request.on('end', function(){
        var dataParsed = qs.parse(data);
        var titlePrev = dataParsed.title;
        var title = dataParsed.title;
        var description = dataParsed.description;
        
        fs.rename(`data/${titlePrev}`, `data/${title}`, function(err){
          if (err) throw err;
          fs.writeFile(`data/${title}`, description, function(err){
            if (err) throw err;
            response.writeHead(302, { 'Location': `/?title=${title}` });
            response.end();
          });
        });
      });
    } else if (_pathname == '/delete_process') {
      var data = '';
      request.on('data', function(chunk){
        data += chunk;        
      });
      request.on('end', function(){
        var dataParsed = qs.parse(data);
        var title = dataParsed.title;

        fs.unlink(`data/${title}`, function(err){
          if (err) throw err;
          
          response.writeHead(302, { 'Location': `/` });
          response.end();
        });
      });
    } else {
      response.writeHead(404);
      response.end('Not found');
    }
})
app.listen(3000);
