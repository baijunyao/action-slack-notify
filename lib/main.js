"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
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
const web_api_1 = require("@slack/web-api");
function run() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const github_context = JSON.parse(core.getInput('github_context', { required: true }));
            const job_context = JSON.parse(core.getInput('job_context', { required: true }));
            const channel = core.getInput('channel', { required: true });
            const slack_bot_token = core.getInput('slack_bot_token', { required: true });
            const web = new web_api_1.WebClient(slack_bot_token);
            let message;
            let color;
            let title;
            if (job_context.status === 'Success') {
                title = 'GitHub Action Success';
                color = '#008000';
            }
            else {
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
            yield web.chat.postMessage(message);
        }
        catch (err) {
            console.log(err);
            core.setFailed(err.message);
        }
    });
}
run();
