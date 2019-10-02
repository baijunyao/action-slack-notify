## Usage

```yaml
- name: Notify slack
  uses: baijunyao/action-slack-notify@master
  with:
    - slack_bot_token: ${{ secrets.SLACK_BOT_TOKEN }}
      status: success
      channel: CEWJP77BP
```

## Setup
1. [Creating a Slack App](https://github.com/pullreminders/slack-action/blob/master/README.md#creating-a-slack-app)
2. [Using the action](https://github.com/pullreminders/slack-action/blob/master/README.md#using-the-action)
