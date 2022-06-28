// packages
import github from '@actions/github'

// modules
import parse from './parse.js'
import config from './config.js'
import dependencies from './dependencies.js'
import { approve, comment } from './api.js'

const workspace = process.env.GITHUB_WORKSPACE || '/github/workspace'

export default async function (inputs) {
  // extract the title
  const { repo, payload: { pull_request } } = github.context // eslint-disable-line camelcase
  console.log('passed token ' , inputs.token)
  // init octokit
  const octokit = github.getOctokit(inputs.token)
  console.log('octokit object'  , octokit)
  // parse and determine what command to tell dependabot
  const proceed = parse({
    title: pull_request.title,
    labels: pull_request.labels.map(label => label.name.toLowerCase()),
    config: config({ workspace, inputs }),
    dependencies: dependencies(workspace)
  })

  if (proceed) {
    const command = comment
    // const botName = inputs.botName || 'dependabot'
    
    // await command(octokit, repo, pull_request, `All good should merge this pr `)
    // await command(octokit, repo, pull_request, `@${botName} ${inputs.command}`)

    await octokit.issues.createComment({
      repo,
      issue_number: pull_request.number,
      body: 'All good should merge this pr'
    })

  }
}
