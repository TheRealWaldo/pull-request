import { getInput, setOutput, setFailed, info, group } from '@actions/core';
import { context } from '@actions/github';
import { Octokit } from '@octokit/action';

const octokit = new Octokit();
const [owner, repo] = (process.env.GITHUB_REPOSITORY || '').split('/');
if (!owner || !repo) {
  setFailed('GITHUB_REPOSITORY environment variable not present or correct.');
  process.exit(1);
}

info(`Firing from ${context.eventName} on ${context.ref}`);

try {
  const head = getInput('head', { required: true });
  const base = getInput('base', { required: true });
  const title = getInput('title', { required: true });
  const body = getInput('body', { required: true });
  const draft = getInput('draft') === 'true';
  const assignee = getInput('assignee');

  group('pull-request', async () => {
    info('Checking if open pull request for branch already exists...');

    const { data } = await octokit.request('GET /repos/{owner}/{repo}/pulls', {
      owner,
      repo,
      head: owner.concat(':', head),
      state: 'open',
    });

    let pullNumber = 0;

    if (data.length > 0) {
      pullNumber = data[0].number;
      setOutput('pull-number', pullNumber);
      info(`PR #${pullNumber} exists, updating...`);
      await octokit
        .request('PATCH /repos/{owner}/{repo}/pulls/{pull_number}', {
          owner,
          repo,
          pull_number: pullNumber,
          title,
          body,
        })
        .then(() => {
          info(`Updated #${pullNumber}`);
        });
    } else {
      info('PR does not already exist, creating...');
      await octokit
        .request('POST /repos/{owner}/{repo}/pulls', {
          owner,
          repo,
          title,
          body,
          head,
          base,
          draft,
        })
        .then((response) => {
          pullNumber = response.data.number;
          setOutput('pull-number', pullNumber);
          info(`Created #${pullNumber}`);
        });
    }
    if (assignee && pullNumber) {
      await octokit.request('POST /repos/{owner}/{repo}/issues/{issue_number}/assignees', {
        owner,
        repo,
        issue_number: pullNumber,
        assignees: [assignee],
      });
    }
  });
} catch (error) {
  setFailed(error.message);
}
