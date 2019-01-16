var http = require('http')
  , fs   = require('fs')
  , url  = require('url')
  , port = 8080;

const sqlite3 = require('sqlite3').verbose();

let db = new sqlite3.Database('./Mazes.db');

let create_table = `CREATE TABLE IF NOT EXISTS 'mazes' (
  id TEXT PRIMARY KEY,
  maze nchar(256),
  name nchar(256)
);
INSERT INTO 'mazes' (id,name,maze) VALUES (123, "ExampleMaze","WWWWWWWWWWWWWWWWBBBBBBBBBBBBBBBWBBBBBBBBBBBBBBBWBBBBBBBBBBBBBBBWBBBBBBBBBBBBBBBWBBBBBBBBBBBBBBBWBBBBBBBBBBBBBBBWBBBBBBBBBBBBBBBWBBBBBBBBBBBBBBBWBBBBBBBBBBBBBBBWBBBBBBBBBBBBBBBWBBBBBBBBBBBBBBBWBBBBBBBBBBBBBBBWBBBBBBBBBBBBBBBWBBBBBBBBBBBBBBBWBBBBBBBBBBBBBBBW");`;

db.run(create_table, (err, row) => {
    if (err) {
      throw err;
    };
});

let default_maze = "WWWWWWWWWWWWWWWWBBBBBBBBBBBBBBBWBBBBBBBBBBBBBBBWBBBBBBBBBBBBBBBWBBBBBBBBBBBBBBBWBBBBBBBBBBBBBBBWBBBBBBBBBBBBBBBWBBBBBBBBBBBBBBBWBBBBBBBBBBBBBBBWBBBBBBBBBBBBBBBWBBBBBBBBBBBBBBBWBBBBBBBBBBBBBBBWBBBBBBBBBBBBBBBWBBBBBBBBBBBBBBBWBBBBBBBBBBBBBBBWBBBBBBBBBBBBBBBW";

function updateMaze(id, newMaze){
  //TODO
  db.run(`UPDATE 'mazes' SET maze="${newMaze}" WHERE id="${id}"`, [], (err, row) => {
    if (err) {
      throw err;
    };
  })
  //return success, or failure if the ID hadn't existed yet
}

function createMaze(res, name){
  //return id
  let id = Math.floor((Math.random()*1412512)%10000);
  console.log(`INSERT INTO 'mazes' (id, name, maze) VALUES ("${id}", "${name}", "${default_maze}")`);
  db.run(`INSERT INTO 'mazes' (id, name, maze) VALUES ("${id}", "${name}", "${default_maze}")`, [], (err) => {
  if (err) {
    throw err;
  }});
  console.log(`A row has been inserted with rowid ${this.lastID}`);
  res.end(String(id));
}

function deleteMaze(id){
  //return success, or failure if the ID doesn't exist
  db.run(`DELETE FROM 'mazes' WHERE id="${id}"`,[], (err, row) => {
    if (err) {
      throw err;
    }
  });
}

function getMaze(res, id){
  //return the maze
  console.log(id);
  db.get(`SELECT * FROM 'mazes' WHERE id="${id}"`,[], (err, row) => {
    if (err) {
      throw err;
    }
    res.end(JSON.stringify(row));
})
}
//This is the function used to populate the menu page
function sendMazes(res){
  //Query SQL for mazes
  db.all(`SELECT * FROM 'mazes'`,[], (err, rows) => {
    if (err) {
      throw err;
    }
    res.end(JSON.stringify(rows));
})
}

var server = http.createServer (function (req, res) {
  var uri = url.parse(req.url)
  var url_parts = url.parse(req.url, true);
  var query = url_parts.query;

  if(req.method == "DELETE"){
    console.log(uri.pathname.slice(1,));
    deleteMaze(uri.pathname.slice(1,));
  }
  if(req.method == "PATCH" || req.method == "POST"){
    console.log(uri.pathname.slice(1,));
    updateMaze(uri.pathname.slice(1,), query.maze);
  }

  switch( uri.pathname ) {

    case '/':
    case '/Index.html'://deliver the "main menu" html
    case '/index.html':
      sendFile(res, 'Index.html');
      break

    case '/Menu.css':// Did someone say fancify?
      sendFile(res, 'Menu.css', 'text/css');// Serve our style sheet
      break //don't drip into the next case

    case '/Menu.js':
      sendFile(res, 'Menu.js', 'text/javascript');
      break

    case '/MAZECRAZE.svg':
      sendFile(res, "MAZECRAZE.svg", "image/svg+xml");
      break;
    
    case '/Mazes.json':
      sendMazes(res);
      break

    case '/Maze.html':
      sendFile(res, "MazeTemplate.html");
      break

    case '/Maze.js':
      sendFile(res, "Maze.js", 'text/javascript');//serve the JS for loading/saving/populating/making mazes
      break

    case '/Maze.css':
      sendFile(res, "Maze.css", 'text/css')
      break

    case '/getMaze':
      getMaze(res, query.id);
      break;

    case '/newMaze':
      createMaze(res, query.name);

    default:
      res.end()
  }
});

server.listen(process.env.PORT || port);
console.log('listening on 8080');

// subroutines

function sendFile(res, filename, contentType) {
  contentType = contentType || 'text/html';

  fs.readFile(filename, function(error, content) {
    res.writeHead(200, {'Content-type': contentType})
    res.end(content, 'utf-8')
  })

}
