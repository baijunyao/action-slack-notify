import { GitHub } from '@actions/github';
import { WebClient, ChatPostMessageArguments } from '@slack/web-api'
import { SectionBlock } from "@slack/types";

export class Client {
  constructor(
    private readonly githubToken: string,
    private readonly githubContext: any,
    private readonly slackChannelId: string,
    private readonly slackBotToken: string,
  ) {
    this.githubToken = githubToken;
    this.githubContext = githubContext;
    this.slackChannelId = slackChannelId;
    this.slackBotToken = slackBotToken;
  }

  async send() {
    const branch: string = this.githubContext.ref.slice(11);
    const repositoryUrl = this.githubContext.event.repository.url + "/";
    const commitUrl = this.githubContext.event.head_commit.url + "/";

    const github = new GitHub(this.githubToken);

    const jobs = await github.actions.listJobsForWorkflowRun({
      owner: this.githubContext.event.repository.owner.name,
      repo: this.githubContext.event.repository.name,
      run_id: this.githubContext.run_id
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
            text: "*Workflow:* <" + commitUrl + "checks|" + this.githubContext.workflow + ">"
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
          text: "*Commit Message:* <" + commitUrl + '|' + this.githubContext.event.head_commit.message.split("\n")[0] + ">"
        }
      },
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: "*Commit ID:* " + this.githubContext.event.head_commit.id
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
      channel: this.slackChannelId,
      text: '',
      attachments: [{
        blocks,
        color
      }]
    };

    const web = new WebClient(this.slackBotToken);
    return await web.chat.postMessage(message);
  }
}
