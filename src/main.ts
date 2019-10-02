import * as core from '@actions/core';
import { WebClient, ChatPostMessageArguments } from '@slack/web-api'

async function run() {
  try {
    const status: string = core.getInput('status', { required: true });
    const channel: string = core.getInput('channel', { required: true });
    const slack_bot_token: string = core.getInput('slack_bot_token', { required: true });
    const web = new WebClient(slack_bot_token);
    let message: ChatPostMessageArguments;

    if (status === 'success') {
      message = {
        channel: channel,
        text: 'Success',
      };
    } else {
      message = {
        channel: channel,
        text: 'Failure',
      };
    }

    await web.chat.postMessage(message);
  } catch (err) {
    console.log(err)
    core.setFailed(err.message);
  }
}

run();
