const fs = require('fs');
var express = require('express');
var walker = require('walker');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var colors = require('colors')
var dir = __dirname + '/test/'



io.on('connection', function (socket) {
    console.log('conection')
    getFolderItems(dir)

    function getFolderItems(path){
        walker(path)
        .on('dir', function(dir, stat) {
            var itemPath = dir.replace(/\\/g, '/')
            var dirNameSplit = itemPath.split('/');
            itemName = dirNameSplit[dirNameSplit.length - 1]
            parentPath = itemPath.slice(0, -itemName.length)
            console.log(parentPath)
            socket.emit('loadItem','dir', itemName,stat.birthtime, stat.size, itemPath, parentPath)

        })

        .on('end', function() {
            console.log('All folders traversed getting files.')
            getFileItems(dir)
        });
    }

    function getFileItems(dir){
        walker(dir)
        .on('file', function(file, stat) {
            var itemPath = file.replace(/\\/g, '/')
            var dirNameSplit = itemPath.split('/');
            itemName = dirNameSplit[dirNameSplit.length - 1]
            var fileExtension = itemName.split('.')
            fileExtension = fileExtension[fileExtension.length - 1]
            console.log('extension ' + fileExtension)
            parentPath = itemPath.slice(0, -itemName.length)
            socket.emit('loadItem','file', itemName,stat.birthtime, stat.size, itemPath, parentPath, fileExtension)

        })
        .on('end', function() {
            console.log('All files traversed... DONE!')
        });
    }
    socket.on('getTextData',function(dir){
        fs.readFile(dir, 'utf8', function(err, data) {  
          if (err) throw err;
          socket.emit('sendTextData',data)
          console.log(data)
      });
      })
      socket.on('saveFile',function(what, data){
        fs.writeFile(what, data, function (err) {
          if (err) throw err;
          console.log('Saved! ' + data + ' to '+ what);
        });
      
      })
})   





    app.get('/', function(req, res){
        app.use(express.static(__dirname + '/webUI' ));
        res.sendFile(__dirname + '/webUI/index.html')
      });
      
      app.set(81, process.env.PORT || 81);
        http.listen(81, function(){
        console.log(colors.green('[+]') + colors.white(' listening on * 81'));
      });