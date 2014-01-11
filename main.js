var nounReplacer = require("./nounreplacer");

var Twitter = require("ntwitter");

const FOLLOW_USER_NAME = "Shufflejoy";
//const FOLLOW_USER_NAME = "zhuowei";

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
	console.log(data);
	//grab the message from the data
	var tweetMsg = data.text;
	var userId = data.user.id_str;
	if (userId != followUserId) return; //filter out retweets/replies
	var userMentions = data.entities.user_mentions;
	var urls = data.entities.urls;
	if (userMentions.length > 0 || urls.length > 0) {
		if (Math.random() < 0.8) return;
	}
	var soyMsg = nounReplacer.deNoun(tweetMsg);
	if (soyMsg == tweetMsg) return;
	twitter.updateStatus(soyMsg, function(err, data){});
}
