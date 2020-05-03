import * as core from '@actions/core';
import { GitHub } from '@actions/github';
import { WebClient, ChatPostMessageArguments } from '@slack/web-api'
import { SectionBlock } from "@slack/types";

async function run() {
  try {
    const github_token = core.getInput('github_token', { required: true });
    const github_context = JSON.parse(core.getInput('github_context', { required: true }));
    const slack_channel_id: string = core.getInput('slack_channel_id', { required: true });
    const slack_bot_token: string = core.getInput('slack_bot_token', { required: true });

    const branch: string = github_context.ref.slice(11);
    const repositoryUrl = github_context.event.repository.url + "/";
    const commitUrl = github_context.event.head_commit.url + "/";

    const github = new GitHub(github_token);

    const jobs = await github.actions.listJobsForWorkflowRun({
      owner: github_context.event.repository.owner.name,
      repo: github_context.event.repository.name,
      run_id: github_context.run_id
    });

    let failed_job_links:string = '';
    let color:string = '#008000';

    jobs.data.jobs.forEach((job) => {
      if (job.conclusion === 'failure') {
        failed_job_links += ", <" + job.html_url + '|' + job.name + ">";
      }
    })

    failed_job_links = failed_job_links.substring(2)

    const blocks:SectionBlock[] = [
      {
        type: "section",
        fields: [
          {
            type: "mrkdwn",
            text: "*Status:* " + (failed_job_links === '' ? 'Success' : 'Failure')
          },
          {
            type: "mrkdwn",
            text: "*Workflow:* <" + commitUrl + "checks|" + github_context.workflow + ">"
          }
        ]
      },
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: "*Branch:* <" + repositoryUrl + "tree/" + branch + "|" + branch + ">"
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
    ];

    if (failed_job_links !== '') {
      blocks.push({
        type: "section",
        text: {
          type: "mrkdwn",
          text: "Failed Jobs: " + failed_job_links
        }
      });

      color = '#FF0000';
    }

    const message: ChatPostMessageArguments = {
      channel: slack_channel_id,
      text: '',
      attachments: [{
        blocks,
        color
      }]
    };

    const web = new WebClient(slack_bot_token);
    await web.chat.postMessage(message);
  } catch (err) {
    console.log(err)
    core.setFailed(err.message);
  }
}

run();
