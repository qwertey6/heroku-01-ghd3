
## Jacob Kaplan | MaZe CrAzE (crazy-case optional)
    MAZE CRAZE is an online game where you can play, edit, and delete mazes which other players create!
    The front end is made almost entirely with d3. The source code is in the Menu.js and Maze.js files, for the menu and maze pages respectively
    The backend runs on node.js, and stores the mazes in a sqlite3 database.
    The website is hosted on heroku.
    If you wish to run this locally, first run 'npm install', and then you may run 'npm start ./server.js'


## Technical Achievements
- **Tech Achievement 1**: Using SQLite3 on Heroku (do not do this)
- **Tech Achievement 2**: Everything is made with D3, except for (most) of the XMLHttpRequests.
- **Tech Achievement 3**: Made swappable controllers for the maze board. Can click Edit/Play to entirely change how the mouse interaction works. 
- **Tech Achievement 4**: Even the Edit controller is attached to multiple events - users can either simply click to edit the board, or click AND drag.
- **Tech Achievement 5**: The play controller is state-aware. This is necessary to disallow the user from "skipping" through parts of the maze. This was accomplished with higher order functions
- **Tech Achievement 6**: Multiple pages for interacting with the same data at different levels. Seeing all mazes vs interacting with a specific one.

### Design/Evaluation Achievements
- **Design Achievement 1**: Imported an externally made svg graphic
- **Design Achievement 2**: Layout designed for mobile phones
- **Design Achievement 3**: Render the board with softened edges using filters
- **Design Achievement 4**: Multiple ways to interact with the board while editing. Added click and drag for convenience.