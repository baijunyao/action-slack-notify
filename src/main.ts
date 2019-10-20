import * as core from '@actions/core';
import { WebClient, ChatPostMessageArguments } from '@slack/web-api'

async function run() {
  try {
    const github_context = JSON.parse(core.getInput('github_context', { required: true }));
    const job_context = JSON.parse(core.getInput('job_context', { required: true }));
    const channel: string = core.getInput('channel', { required: true });
    const slack_bot_token: string = core.getInput('slack_bot_token', { required: true });
    const web = new WebClient(slack_bot_token);
    let message: ChatPostMessageArguments;
    let color: string;
    let title: string;

    if (job_context.status === 'Success') {
      title = 'GitHub Action Success';
      color = '#008000';
    } else {
      title = 'GitHub Action Failure';
      color = '#FF0000';
    }

    message = {
      channel: channel,
      text: '',
      attachments: [
        {
          mrkdwn_in: ['fields'],
          color: color,
          author_name: github_context.event.head_commit.author.username,
          author_link: 'https://github.com/' + github_context.event.head_commit.author.username,
          title: title,
          title_link: github_context.event.head_commit.url + '/checks',
          fields: [
            {
              title: 'Commit',
              value: '<' + github_context.event.head_commit.url + '|' + github_context.event.head_commit.message + '>',
              short: false
            }
          ]
        }
      ]
    };

    await web.chat.postMessage(message);
  } catch (err) {
    console.log(err)
    core.setFailed(err.message);
  }
}

run();
