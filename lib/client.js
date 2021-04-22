"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const github_1 = require("@actions/github");
const web_api_1 = require("@slack/web-api");
class Client {
    constructor(githubToken, githubContext, slackChannelId, slackBotToken) {
        this.githubToken = githubToken;
        this.githubContext = githubContext;
        this.slackChannelId = slackChannelId;
        this.slackBotToken = slackBotToken;
        this.githubToken = githubToken;
        this.githubContext = githubContext;
        this.slackChannelId = slackChannelId;
        this.slackBotToken = slackBotToken;
    }
    send() {
        return __awaiter(this, void 0, void 0, function* () {
            const branch = this.githubContext.ref.slice(11);
            const repositoryUrl = this.githubContext.event.repository.url + "/";
            const commitUrl = this.githubContext.event.head_commit.url + "/";
            const github = new github_1.GitHub(this.githubToken);
            const jobs = yield github.actions.listJobsForWorkflowRun({
                owner: this.githubContext.event.repository.owner.name,
                repo: this.githubContext.event.repository.name,
                run_id: this.githubContext.run_id
            });
            let failed_job_links = '';
            let color = '#008000';
            jobs.data.jobs.forEach((job) => {
                if (job.conclusion === 'failure') {
                    failed_job_links += ", <" + job.html_url + '|' + job.name + ">";
                }
            });
            failed_job_links = failed_job_links.substring(2);
            const blocks = [
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
            const message = {
                channel: this.slackChannelId,
                text: '',
                attachments: [{
                        blocks,
                        color
                    }]
            };
            const web = new web_api_1.WebClient(this.slackBotToken);
            return yield web.chat.postMessage(message);
        });
    }
}
exports.Client = Client;
