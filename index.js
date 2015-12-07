// We need both the web and rtm clients in order to create a bot.
var Web_Client = require('slack-client').WebClient;
var Rtm_Client = require('slack-client').RtmClient;

// We need some tokens for this to work.
if (!process.env.SLACK_TOKEN || !process.env.YANDEX_TOKEN) {
	console.error('Oops! You need to provide tokens to this script via the SLACK_TOKEN and YANDEX_TOKEN env variables.');
	process.exit(0);
}

var slack_token = process.env.SLACK_TOKEN;
var yandex_token = process.env.YANDEX_TOKEN;

// Grab our languages file for easy reference.
var languages = require('./languages');

// Create a web client with our Slack token.
var web_client = new Web_Client(slack_token);
// Create an rtm client with our web client.
var rtm = new Rtm_Client(web_client);
// Uncomment this line to see the rtm event stream in the console.
// var rtm = new Rtm_Client(web_client, { log_level: 'verbose' });

// This is the call that starts up our connection with Slack.
rtm.start();

// Start up the Yandex Translation API.
var translate = require('yandex-translate')(yandex_token);

// We'll use regex to match messages that are going to be translated.
// The message should start with "translate to <language>:".
var search_regex = /^(T|t)ranslate to (\w+)\:/;

// Add an event handler for messages. These messages can be fired in any channel
// that our bot is in. It will also fire when the bot receives a direct message.
rtm.on('message', function(message) {
	// If this message doesn't have a `text` property, we're not interested in it.
	if (!message.text) return;

	// Look for matches to our search string. If we don't find any, take no action.
	var matches = message.text.match(search_regex);
	if (!matches) return;

	// We have a match! Trim out the prefix and colon, which should leave us
	// with a string containing the language.
	var language = matches[0]
		.toLowerCase()
		.replace('translate to ', '')
		.replace(':', '')
		.trim();

	// Look up the language. If we don't find it, send some feedback to the user
	// before returning.
	if (!languages[language]) {
		rtm.send({
			type: 'message',
			// send it back to the channel we received it in
			channel: message.channel,
			// present all text from the bot as a quote
			text: '>>> _Oops, I don\'t understand that language!_'
		});
		return;
	}

	// We've got a language. Get rid of the prefix so it doesn't get translated.
	var text_to_translate = message.text.replace(search_regex, '');

	// Translate!
	translate.translate(text_to_translate, { to: languages[language] }, function(err, res) {
		// The translated message should be in a `text` property.
		var msg = res && res.text;

		// The Yandex module sometimes gives us back the error in the `res` object.
		// Check for both possibilities.
		if (res && !res.text) msg = res.message;
		if (err) msg = err.message;

		rtm.send({
			type: 'message',
			// send it back to the channel we recieved it in
			channel: message.channel,
			// present all text from the bot as a quote. Add a warning emoji if
			// we're passing an error through the user.
			text: '>>> ' + ((!res || !res.text) ? ' :warning: ' : '') + msg
	    });
	});
});
