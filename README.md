### Simple Translator Bot

This code will power a bot user on Slack, listening for the phrase `translate to <language>:` and performing a translation on the text using the [Yandex Translator API](https://tech.yandex.com/translate/).

To run this bot on your Slack:
1. clone this repo: `git clone git@github.com:kylestetz/simple-translate-bot.git`
2. `npm install`
3. Sign up for a [Yandex Translator API key](https://tech.yandex.com/translate/) key, which requires making a Yandex account
4. [Create a new bot integration](https://my.slack.com/services/new) in your Slack
5. Run the `index.js` file with your tokens:

```bash
SLACK_TOKEN=xoxb-123456 YANDEX_TOKEN=trnsl.1.1.123456 node index.js
```

:robot_face: :v: