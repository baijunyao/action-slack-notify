import * as core from '@actions/core';
import { Client } from './client';

async function run() {
  try {
    const githubToken: string = core.getInput('github_token', { required: true });
    const githubContext: any = JSON.parse(core.getInput('github_context', { required: true }));
    const slackChannelId: string = core.getInput('slack_channel_id', { required: true });
    const slackBotToken: string = core.getInput('slack_bot_token', { required: true });

    const client = new Client(githubToken, githubContext, slackChannelId, slackBotToken);
    await client.send();

  } catch (err) {
    core.setFailed(err.message);
  }
}

run();
