
function makeMenuEntry(datum, index){
	index += 2;//take into account the banner at the top of the page, and the "make new maze" button
	console.log(datum);
	ypad = height*0.02;//let our y-margin be 2% of the height
	mheight = height*0.10;
	return "<rect class='menuEntry' "+
	" width="+(width-20)+
	" height="+(mheight)+
	" x=10 y="+(mheight*index + ypad*index)+
	" stroke=black fill=none />"+
	" <text class=playButton   id="+datum.id+" x=20 y=" + (mheight*index + ypad*index + (mheight+ypad)/2) + " font-family='Verdana' font-size="+(mheight/2)+" fill=blue>"+datum.name+"</text>"+
	" <text class=deleteButton id="+datum.id+" x="+(width-20-mheight/2)+" y=" + (mheight*index + ypad*index + (mheight+ypad)/2) + " font-family='Verdana' font-size="+(mheight/2)+" fill=red>X</text>"
}

function makePlayButton(){
	ypad = height*0.02;//let our y-margin be 2% of the height
	mheight = height*0.10;
	index = 1;
	text = "Make New Maze!"
	return "<rect class='newMaze' "+
	" width="+(width-20)+
	" height="+(mheight)+
	" x=10 y="+(mheight*index + ypad*index)+
	" stroke=black fill=none />"+
	" <text class=playButton x="+((width-20 - text.length*(mheight/2)/2)/2)+" y=" + (mheight*index + ypad*index + (mheight+ypad)/2) + " font-family='Verdana' font-size="+(mheight/2)+" fill=blue>Make New Maze!</text>";
}

width  = document.body.clientWidth;
height = document.body.clientHeight;

menu = d3.select("#menu");
menu.attr("width", width)
	.attr("height", height);//set the SVG bounding box to the whole available area

//Load our ever-imporant krazy mazey graphicz
d3.xml("MAZECRAZE.svg").mimeType("image/svg+xml").get(function(error, xml) {
	if (error){throw error;}
	xml.documentElement.setAttribute("height", height*0.1);
	xml.documentElement.setAttribute("width" , width);
	menu.node().appendChild(xml.documentElement);
});

d3.json("Mazes.json").get(function(error, json){
	if (error){throw error;}
	console.log(json)
	menu.selectAll(".MazeButton")
		.data(json)
		.enter()
		.append("g")
		.attr("class", "MazeButton")
		.html(makeMenuEntry);//Making multi-element single data things with D3 has always been tricky. Let's just make the HTML and pass it in to our new group.
	
	menu.selectAll(".playButton")
		.on("click", function(d){// if a user clicks on the name of a maze, then ...
			if(this.id == ""){return;}
			window.location.href = window.location.origin + "/Maze.html?ID="+this.id;//navigate to the maze
		})

	menu.selectAll(".deleteButton")
		.on("click", function(d){//if a user clicks on the X to delete a maze, then
			xhr = new XMLHttpRequest();
			xhr.open("DELETE", this.id);//ask the server to DELETE this maze. Note that we kind of hacked the maze ID into the DOM
			xhr.send();
			this.parentElement.remove();//remove this menu entry
		});
});


menu.append("g").html(makePlayButton())//our "make a new maze" button
	.on("click", function(){
		xhr = new XMLHttpRequest();
		xhr.addEventListener("load", function(){
			if(this.responseText == ''){return;}//only navigate if we have succeeded at making a new maze
			window.location.href = window.location.origin + "/Maze.html?ID="+this.responseText;//after getting the response, if it is an ID, then navigate to the newly made maze
		});
		var mazeName = prompt("Name for your New Maze:", "Untitled");
		if (mazeName != null){
			xhr.open("GET", "/newMaze?name="+mazeName);//ask to GET a new maze (we are asking the server to create a new ID for us, which on load, we will go to the "play/edit" page for.)
			xhr.send();
		}
	});
