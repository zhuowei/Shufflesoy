var nounReplacer = require("./nounreplacer");

var Twitter = require("ntwitter");

const FOLLOW_USER_NAME = "Shufflejoy";
//const FOLLOW_USER_NAME = "zhuowei";

var DEBUG = process.env.DEBUG == "true";

var twitter = new Twitter({
	consumer_key: process.env.CONSUMER_KEY,
	consumer_secret: process.env.CONSUMER_SECRET,
	access_token_key: process.env.OAUTH_TOKEN,
	access_token_secret: process.env.OAUTH_SECRET
});

var followUserId;

twitter.showUser(FOLLOW_USER_NAME, function(error, data) {
	if (error) {
		console.log(error);
		return;
	}
	followUserId = data[0].id_str;
	console.log(followUserId);
	setupStream();
});

function setupStream() {

	twitter.stream("statuses/filter", {"follow": followUserId}, function(stream) {
		stream.on("data", streamHandler);
		stream.on("error", function (errortype, errorid) {
			console.log(errortype, errorid);
		});
		stream.on("end", function(response) {
			console.log(response);
			attemptReconnect();
		});
		stream.on("destroy", function(response) {
			console.log(response);
			attemptReconnect();
		});
	});

}

function attemptReconnect() {
	setTimeout(setupStream, 1000 * 60);
}

function streamHandler(data) {
	//grab the message from the data
	if (!data.text || !data.user) {
		console.log(data);
		return;
	}
	var tweetMsg = data.text;
	var userId = data.user.id_str;
	if (userId != followUserId) return; //filter out retweets/replies
	if (DEBUG) console.log(data);
	var userMentions = data.entities.user_mentions;
	var urls = data.entities.urls;
	var soyMsg = nounReplacer.deNoun(tweetMsg);
	if (soyMsg == tweetMsg) {
		if (DEBUG) console.log("No substitutions made");
		return;
	}
	if (userMentions.length > 0 || urls.length > 0) {
		if (Math.random() < 0.5) return;
	}
	var opts = {};
	if (data.in_reply_to_status_id_str) {
		opts["in_reply_to_status_id"] = data["in_reply_to_status_id_str"];
	}
	twitter.updateStatus(soyMsg, opts, function(err, data){});
}
