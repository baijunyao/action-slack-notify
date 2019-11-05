## Usage

```yaml
- name: Notify slack
  uses: baijunyao/action-slack-notify@master
  if: always()
  with:
    channel: GN87KBVDG
    slack_bot_token: ${{ secrets.SLACK_BOT_TOKEN }}
    github_context: ${{ toJson(github) }}
    job_context: ${{ toJson(job) }}
```

## Setup
1. [Creating a Slack App](https://github.com/pullreminders/slack-action/blob/master/README.md#creating-a-slack-app)
2. [Using the action](https://github.com/pullreminders/slack-action/blob/master/README.md#using-the-action)
