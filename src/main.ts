import * as core from '@actions/core';
import { WebClient, ChatPostMessageArguments } from '@slack/web-api'

async function run() {
  try {
    const github_context = JSON.parse(core.getInput('github_context', { required: true }));
    const job_context = JSON.parse(core.getInput('job_context', { required: true }));
    const channel: string = core.getInput('channel', { required: true });
    const slack_bot_token: string = core.getInput('slack_bot_token', { required: true });

    const branch: string = github_context.ref.slice(11);
    const repositoryUrl = github_context.event.repository.url + "/";
    const commitUrl = github_context.event.head_commit.url + "/";

    const message: ChatPostMessageArguments = {
      channel: channel,
      text: '',
      attachments: [
        {
          blocks: [
            {
              type: "section",
              text: {
                type: "mrkdwn",
                text: "*Status:* " + job_context.status
              }
            },
            {
              type: "section",
              text: {
                type: "mrkdwn",
                text: "*Commit Message:* <" + commitUrl + '|' + github_context.event.head_commit.message + ">"
              }
            },
            {
              type: "section",
              text: {
                type: "mrkdwn",
                text: "*Commit ID:* " + github_context.event.head_commit.id
              }
            },
            {
              type: "section",
              fields: [
                {
                  type: "mrkdwn",
                  text: "*Branch:*\n <" + repositoryUrl + "tree/" + branch + "|" + branch + ">"
                },
                {
                  type: "mrkdwn",
                  text: "*Workflow:*\n <" + commitUrl + "checks|" + github_context.workflow + ">"
                }
              ]
            }
          ],
          color: job_context.status === 'Success' ? '#008000' : '#FF0000'
        }
      ]
    };

    const web = new WebClient(slack_bot_token);
    await web.chat.postMessage(message);
  } catch (err) {
    console.log(err)
    core.setFailed(err.message);
  }
}

run();
