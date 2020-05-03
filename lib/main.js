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
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const core = __importStar(require("@actions/core"));
const github_1 = require("@actions/github");
const web_api_1 = require("@slack/web-api");
function run() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const github_token = core.getInput('github_token', { required: true });
            const github_context = JSON.parse(core.getInput('github_context', { required: true }));
            const slack_channel_id = core.getInput('slack_channel_id', { required: true });
            const slack_bot_token = core.getInput('slack_bot_token', { required: true });
            const branch = github_context.ref.slice(11);
            const repositoryUrl = github_context.event.repository.url + "/";
            const commitUrl = github_context.event.head_commit.url + "/";
            const github = new github_1.GitHub(github_token);
            const jobs = yield github.actions.listJobsForWorkflowRun({
                owner: github_context.event.repository.owner.name,
                repo: github_context.event.repository.name,
                run_id: github_context.run_id
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
            const message = {
                channel: slack_channel_id,
                text: '',
                attachments: [{
                        blocks,
                        color
                    }]
            };
            const web = new web_api_1.WebClient(slack_bot_token);
            yield web.chat.postMessage(message);
        }
        catch (err) {
            console.log(err);
            core.setFailed(err.message);
        }
    });
}
run();
