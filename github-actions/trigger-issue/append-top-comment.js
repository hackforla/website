const {Octokit} = require('@octokit/rest');

var github
var context

/**
 * @description
 * @param {Object} g
 * @param {Object} c
 */
async function main({g, c}) {
	github = g
	context = c

	const octokit = new Octokit({ auth: process.env.HFLA_PROJECT_BOARD_TOKEN })
	const issueNum = context.payload.issue.number
	const wikiLink =
		"https://github.com/hackforla/website/wiki/How-to-work-off-of-a-feature-branch";
	
	await octokit.request("PATCH /repos/{owner}/{repo}/issues/{issue_number}", {
		owner: "hackforla",
		repo: "website",
		issue_number: issueNum,
		title: "Instructions for Feature Branch",
		body: `This issue involves working off of a feature branch. 
		
		Check out this [wiki](${wikiLink}) and follow the outlined steps.
		
		Note: Do not manually remove this instruction at the bottom.`,
		state: "open",
		headers: {
			"X-GitHub-Api-Version": "2022-11-28"
		}
	});
}

module.exports =  main;
