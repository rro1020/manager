//
// Initializing the variables for the enviorment
var express = require("express");
var app = express();
var port = process.env.PORT || 2000;
var io = require('socket.io').listen(app.listen(port));

var fs = require("fs"),
	url = require("url"),
	emitter = require("events").EventEmitter,
	assert = require("assert"),
	mongo = require("mongodb"),
	config = require("./config").config,
	QueryCommand = mongo.QueryCommand,
	Cursor = mongo.Cursor,
	Collection = mongo.Collection;
var notemplate = require('express-notemplate');
app.set('statics', process.cwd() + '/public');
app.set('views', process.cwd() + '/views');
app.engine('html', notemplate.__express);
app.set('view engine', 'html');
app.use(express.static(app.get('statics')));

app.get('/', function(req, res){
	res.render('manager'); 
}); 

console.log("Listening on port " + port);
// Heroku-style environment variables
var uristring = process.env.MONGOLAB_URI || "mongodb://localhost/testdatabase";
var mongoUrl = url.parse(uristring);

//
// Opens up a connection to the pre existing MongoLab Database 
// A capped collection is needed to use tailable cursors
// for it to work there must be a database existing and it must be capped
// From here it will initiate the functions for connection
// and pass the database connection to the next function
// if connecting to multiple databases action must be repeated
// with the db.collection (<name>) changing to fit what it is connecting to
mongo.Db.connect(uristring, function (err, db) { 
    console.log("Attempting connection to " + mongoUrl.protocol + "//" + mongoUrl.hostname + " (complete URL supressed).");
    db.collection("messages", function (err, collection) {
	    collection.isCapped(function (err, capped) { 
	   		if (err) {
				console.log("Error when detecting capped collection.  Aborting.  Capped collections are necessary for tailed cursors.");
				process.exit(1);
		    }
		    if (!capped) {
				console.log(collection.collectionName + " is not a capped collection. Aborting.  Please use a capped collection for tailable cursors.");
				process.exit(2);
		    }
		    console.log("Success connecting to " + mongoUrl.protocol + "//" + mongoUrl.hostname + ".");
		    startIOServer(collection);
		});
    });
});


//
//	This will create a socket Server and will let it poll
//	Upon confirming connection with the client 
//	(io.sockets.on("connection") the next step in the database 
//	writer/reader happens
//	since not all enviorments can take all transports sockets
//	we make it set to the safe xhr polling
function startIOServer ( collection ) {
	console.log("Starting the IO Server..");
	io.configure( function () {
		io.set("transports", config[platform].transports);
		io.set("polling duration", 10);
		io.set("log level", 2);
	});
	io.sockets.on("connection", function(socket) {
		console.log("connection established with socket: "+socket);
		readerAndWriter(socket, collection);
	});
};

// function to split up where the places are going 
function readerAndWriter (socket, collection) {
	var orderid = 0;
	recieveAndSave(socket,collection, orderid);
	readAndPush(socket,collection, orderid);
};

//	function polls the database for an entry fiting its description 
//	upon the finding of this new item in the database it is emited
//	to the client for its usage. It uses the cursor function to keep
//	continous polling of the database without issues
//	to manipulate we change the attributes in collection.find({"attributes"}
//	to then search for a specific type of entity
// (known bug: if there are no documents in the collection, it doesn't work.)
function readAndPush (socket, collection, orderid) {
	console.log("Looking for items matching Description");
	collection.find({}, {"tailable": 1, "sort": [["$natural", 1]]}, function(err, cursor) {
		cursor.intervalEach(300, function(err, item) { // intervalEach() is a duck-punched version of each() that waits N milliseconds between each iteration.
		    if(item != null) {
		    	console.log("item found, pushing it to client");
			socket.emit("manager", item); // sends to clients subscribed to type "all"
		    }
		});
	});
};

function recieveAndSave (socket, collection) {
	socket.on("order", function (data) {
		console.log("message recieved...Attempting to save");
		time = new Date();
		var doc =[{"orderType":data.user[1].value,"OrdererName":data.user[0].value, "totalPrice" : data.user[2].value, "orders": []}];
		for (i in data.orders){ 
			doc[0].orders.push(data.orders[i]);
		}
		collection.insert(doc, function (err, inserted) {
			//check error
			if(err === null)
			{
				console.log("item was successfully saved");
			}
		});
	});
};
// Duck-punching mongodb driver Cursor.each.  This now takes an interval that waits 
// "interval" milliseconds before it pushes and calls again
Cursor.prototype.intervalEach = function(interval, callback) {
    var self = this;
    if (!callback) {
		throw new Error("callback is mandatory");
    }
   	if(this.state != Cursor.CLOSED) {
		setTimeout(function(){
	    	// Fetch the next object until there is no more objects
	    	self.nextObject(function(err, item) {        
				if(err != null) return callback(err, null);
				if(item != null) {
		    		callback(null, item);
		    		self.intervalEach(interval, callback);
				}
				else {
		    		self.state = Cursor.CLOSED;
		    		callback(err, null);
				}
				item = null;
	    	});
		}, interval);
    } 
    else {
		callback(new Error("Cursor is closed"), null);
    }
};