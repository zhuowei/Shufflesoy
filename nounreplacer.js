"use strict";
var fs = require("fs");
var dicts = [];
var wordsForReplacementSingle = ["soybean", "legume", "soy sauce", "bean"];
var wordsForReplacementPlural = ["soybeans", "legumes", "soy sauces", "beans"];
var wordsForReplacementUncountable = ["soy", "tofu"];

var exclusionSet;

function readDicts(path) {
	console.log("Read dicts");
	readExclusionList(".");
	var filelist = fs.readdirSync(path);
	for (var i = 0; i < filelist.length; i++) {
		var filename = filelist[i];
		if (filename.indexOf("words.v") == 0) {
			readDict(path, filename, true);
		}
	}
	for (var i = 0; i < filelist.length; i++) {
		var filename = filelist[i];
		if (filename.indexOf("words.n") == 0) {
			readDict(path, filename, false);
		}
	}
}

function readDict(path, name, excludeMode) {
	var contents = fs.readFileSync(path + "/" + name, {
		"encoding": "utf8"
	});
	var words = contents.replace(/\n/g, " ").replace(/  /g, " ").trim().split(" ");
	var endWords = new Set();
	if (excludeMode) endWords = exclusionSet;
	for (var i = 0; i < words.length; i++) {
		var word = words[i].substring(0, words[i].lastIndexOf("."));
		if (!exclusionSet.has(word)) {
			endWords.add(word);
		}
	}
	if (excludeMode) return;
	var replacementList;
	switch(name.split(".")[2]) {
		case "2":
			replacementList = wordsForReplacementPlural;
			break;
		case "3":
		case "4":
			replacementList = wordsForReplacementUncountable;
			break;
		case "1":
		default:
			replacementList = wordsForReplacementSingle;
			break;
	}
	dicts.push({
		"n": name,
		"w": endWords,
		"r": replacementList
	});
}

function readExclusionList(path) {
	var name = "donotreplace.txt";
	var contents = fs.readFileSync(path + "/" + name, {
		"encoding": "utf8"
	});
	var words = contents.replace(/\n/g, " ").replace(/  /g, " ").trim().split(" ");
	var endWords = new Set();
	for (var i = 0; i < words.length; i++) {
		endWords.add(words[i]);
	}

	exclusionSet = endWords;
}

function deNoun(str) {
	return str.replace(/[a-zA-Z']+/g, function(word) {
		for (var i = 0; i < dicts.length; i++) {
			if (dicts[i].w.has(word.toLowerCase())) {
				return generateReplacement(dicts[i], word);
			}
		}
		return word;
	});
}

function generateReplacement(dict, orig) {
	var word = dict.r[Math.floor(Math.random() * dict.r.length)];
	var isUppercase = orig.toUpperCase() == orig;
	if (isUppercase) return word.toUpperCase();
	var firstUppercase = orig.substring(0, 1).toUpperCase() == orig.substring(0, 1);
	if (firstUppercase) return word.substring(0, 1).toUpperCase() + word.substring(1);
	return word;
}

readDicts("/usr/share/link-grammar/en/words");

//var n = deNoun("I am a weatherproof balloon, specially made for John McCain's use as an agricultural specimen. I hate spiders?! You hate spiders and me.");

/*var n = deNoun(fs.readFileSync("in.txt", {
	"encoding": "utf8"
	}));

console.log(n);*/

exports.deNoun = deNoun;
