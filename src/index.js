import {
  getInput, setOutput, setFailed, info, group,
} from '@actions/core';
import { context } from '@actions/github';

const { Octokit } = require('@octokit/action');

const octokit = new Octokit();
const [owner, repo] = process.env.GITHUB_REPOSITORY.split('/');

const head = getInput('head');
const base = getInput('base');
const title = getInput('title');
const body = getInput('body');
const draft = (getInput('draft') === 'true');

info(`Firing from ${context.eventName} on ${context.ref}`);

try {
  group('pull-request', async () => {
    info('Checking if open pull request for branch already exists...');
    const { data } = await octokit.request('GET /repos/{owner}/{repo}/pulls', {
      owner,
      repo,
      head: owner.concat(':', head),
      state: 'open',
    });

    if (data.length > 0) {
      const pullNumber = data[0].number;
      setOutput('pull-number', pullNumber);
      info(`PR #${pullNumber} exists, updating...`);
      await octokit.request('PATCH /repos/{owner}/{repo}/pulls/{pull_number}', {
        owner,
        repo,
        pull_number: pullNumber,
        title,
        body,
      });
      info(`Updated #${pullNumber}`);
    } else {
      info('PR does not already exist, creating...');
      const response = await octokit.request('POST /repos/{owner}/{repo}/pulls', {
        owner,
        repo,
        title,
        body,
        head,
        base,
        draft,
      });
      const pullNumber = response.number;
      setOutput('pull-number', pullNumber);
      info(`Created #${pullNumber}`);
    }
  });
} catch (error) {
  setFailed(error.message);
}
