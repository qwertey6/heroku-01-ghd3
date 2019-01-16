
function getID() {//gets the "ID=___" part of the URL
    var id;
    window.location.href.replace(/[?&]+([^=&]+)=([^&]*)/gi, function(m,key,value) {
        if(key=="ID"){id=value};
    });
    return id;
}

//converts the board back into a server friendly string
function getBoardState(){
	alltiles = [];
	board.selectAll("rect").each(function(d){alltiles[d.x + d.y*16] = this})
	return 	alltiles.map(function(d){return d.className.baseVal.includes("B")})
			.map(function(d){return d ? "B" : "W";}).join("");
}

//Tile states: B=unnavigable W=navigable F=already navigated
function MazeNavigationHandler(){
	var tilehistory = [];// a list of recently visited tiles
	
	return function(){
		if(tilehistory[0] == undefined){
			firstTile = board.selectAll("rect").filter(function(d){return d.x+d.y ==0});//select the element at 0,0
			firstTile.attr("class", firstTile.attr("class").replace("W","F"));
			tilehistory.push(firstTile);

		}
		curtile = d3.select(this);
		prevtile =tilehistory[tilehistory.length-1];
		//only proceed if the currently moused over tile is adjacent to the previously selected tile:
		if	(((curtile.datum().x == prevtile.datum().x-1) && (curtile.datum().y == prevtile.datum().y  )) ||
			 ((curtile.datum().x == prevtile.datum().x+1) && (curtile.datum().y == prevtile.datum().y  )) ||
			 ((curtile.datum().x == prevtile.datum().x  ) && (curtile.datum().y == prevtile.datum().y+1)) ||
			 ((curtile.datum().x == prevtile.datum().x  ) && (curtile.datum().y == prevtile.datum().y-1))){
			
			console.log(curtile);
			//Do not do anything if the current tile's state is unnavigable
			if (curtile.attr("class") == "B"){return;}
			
			//If we are moving back a tile, unmark/unnavigate the previous tile
			if (curtile.attr("class") == "F"){
				prevtile.attr("class", prevtile.attr("class").replace("F","W"));
				if(tilehistory.length == 1){return;}//don't pop our origin
				tilehistory.pop();//remove the most recent tile from history
			}

			//If we are moving into a new, unnavigated tile, then set the previous tile to the new tile and navigate to it.
			if (curtile.attr("class") == "W"){
				curtile.attr("class", curtile.attr("class").replace("W","F"));
				tilehistory.push(curtile);//add the current tile to the top of our tile history
				if(curtile.datum().x == 15 && curtile.datum().y == 15){
					alert("Winrar is you!")
				}
			}
		}
	}
}

width  = document.body.clientWidth;
height = document.body.clientHeight;

menu = d3.select("#menu");
menu.attr("width", width)
	.attr("height", height);//set the SVG bounding box to the whole available area

board = menu.append("g").attr("class","board");

xhr = new XMLHttpRequest();
xhr.addEventListener("load", function(){
	console.log(this.responseText);
	data = JSON.parse(this.responseText);
	h = height*0.5/16;//tile height
	w = (d3.select(".logo").node().width.animVal.value-20)/16;// tile width
	handler = MazeNavigationHandler();//set 1 handler to handle all mouse over events

	for(i=0; i<16; i++){//load columns
		for(j=0; j<16; j++){//load rows
			tile = data.maze[16*i + j];

			board.append("rect")
				.data([{x:j, y:i, state:tile}])
				.attr("width", w)
				.attr("height", h)
				.attr("x", w*j)
				.attr("y", h*i)
				.attr("class", tile)
				.on("mouseover", handler)
		}
		//board.transform()
	}
});
xhr.open("GET", "/getMaze?id="+getID());//ask to GET a new maze (we are asking the server to create a new ID for us, which on load, we will go to the "play/edit" page for.)
//NOTE: WE ONLY SEND THE XHR REQUEST AFTER LOADING THE SVG GRAPHIC BELOW!

//Load our ever-imporant krazy mazey graphicz
d3.xml("MAZECRAZE.svg").mimeType("image/svg+xml").get(function(error, xml) {
	if (error){throw error;}
	xml.documentElement.setAttribute("height", height*0.1);
	xml.documentElement.setAttribute("width" , width);
	xml.documentElement.setAttribute("class", "logo")
	menu.node().appendChild(xml.documentElement);
	xhr.send();
	board.attr("transform","translate(10,"+menu.node().clientHeight/3+")")
});


function makeControlBox(){
	ypad = height*0.02;//let our y-margin be 2% of the height
	mheight = height*0.10;
	index = 1;
	return "<rect class='ControlBox' "+
	" width="+(width-20)+
	" height="+(mheight)+
	" x=10 y="+(mheight*index + ypad*index)+
	" stroke=black fill=none />"+
	" <text class='Edit Play' x="+(10)+" y=" + (mheight*index + ypad*index + (mheight+ypad)/2) + " font-family='Verdana' font-size="+(mheight/2)+" fill=blue>Edit</text>"+
	" <text class='Save' x="+((width-10)-3*(mheight/2))+" y=" + (mheight*index + ypad*index + (mheight+ypad)/2) + " font-family='Verdana' font-size="+(mheight/2)+" fill=blue>Save</text>";
}


//Create the controls box. I used illustrator to quickly whip it up
controls = menu.append("g").html(makeControlBox());

//add the controls for Editing and Saving
controls.select(".Save")
	.on("click", function(d){//if a user clicks on the save button, then
		xhr = new XMLHttpRequest();
		if(Math.random() > 0.5){
			xhr.open("PATCH", `/${getID()}?maze=${getBoardState()}`);//ask the server to Update this maze
		}else{
			xhr.open("POST", `/${getID()}?maze=${getBoardState()}`);
		}
		xhr.send();
	});

GAMESTATE = "PLAY"

controls.select(".Play").on("click", function(){
	if(GAMESTATE == "PLAY"){
		board.selectAll("rect")
			.attr("class", function(d){return d.state == "B"? "B" : "W"})
			.on("mouseover", function(d){
				mouse = d3.event;
				if (mouse.buttons>0) {
					if(d.state == "B"){
						d.state = "W"
						d3.select(this).attr("class", "W");
					}else{
						d.state = "B"
						d3.select(this).attr("class", "B")
					}
				}
			})//replace the mouse-over handler with one which allows the user to drag-select
			.on("click", function(d){
				if(d.state == "B"){
					d.state = "W"
					d3.select(this).attr("class", "W");
				}else{
					d.state = "B"
					d3.select(this).attr("class", "B")
				}
			})

		d3.select(".Play").text("Edit")
		GAMESTATE = "EDIT"
	}else{
		handler = MazeNavigationHandler();
		board.selectAll("rect")
			.attr("class", function(d){return d.state == "B"? "B" : "W"})
			.on("mouseover", handler)
			.on("click", null)//disable the editing control
		tilehistory = [];

		d3.select(".Edit").text("Play")
		GAMESTATE = "PLAY"
	}

});

