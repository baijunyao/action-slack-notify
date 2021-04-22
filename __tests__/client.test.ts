import { Client } from '../src/client';
import { readFileSync } from 'fs';
import { resolve } from 'path';
import nock from 'nock';

describe('slack', () => {
  it('send notify to Slack', async () => {
    const githubContext = JSON.parse(
      readFileSync(resolve(__dirname, '../__tests__/fixtures', 'github.context.json')).toString(),
    );

    const githubJobs = JSON.parse(
      readFileSync(resolve(__dirname, '../__tests__/fixtures', 'github.jobs.json')).toString(),
    );

    const slackResponse = JSON.parse(
      readFileSync(resolve(__dirname, '../__tests__/fixtures', 'slack.response.json')).toString(),
    );

    nock('https://api.github.com:443', {"encodedQueryParams":true})
      .get('/repos/baijunyao/laravel-bjyblog/actions/runs/37598099/jobs')
      .reply(200, githubJobs);

    nock('https://slack.com:443', {"encodedQueryParams":true})
      .post('/api/chat.postMessage')
      .reply(200, slackResponse);

    const client = new Client('githubToken', githubContext, 'slackChannelId', 'slackBotToken');

    client.send().then(response => {
      expect(response.ok).toEqual(true);
    })
  });
});
