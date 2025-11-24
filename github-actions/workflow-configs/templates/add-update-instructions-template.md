<!-- Message template used with the "Add Update Label Weekly" workflow -->
<!-- This file to be installed at: `github-actions/workflow-configs/templates/add-update-instructions-template.md` -->

Hello ${assignees}-

Please add an update using the below template (even if you have a pull request). Afterwards, remove
the `${label}` label and add the `${statusUpdated}` label.

1. Progress: "What is the current status of this issue? What have you completed and what is left to do?"
2. Blockers: "Explain any difficulties or errors encountered."
3. Availability: "How much time will you have this week to work on this issue?"
4. ETA: "When do you expect this issue to be completed?"
5. Pictures (optional): "Add any pictures of the visual changes made to the site so far."

If you need help, be sure to either: 1) place your issue in the "${questionsStatus}" status-column of the 
Project Board and ask for help at your next meeting; 2) put a `${statusHelpWanted}` label on your issue 
and pull request; or 3) put up a request for assistance on the team's ${teamSlackChannel} Slack channel.  

Please note that including your questions in the issue comments- along with screenshots, if applicable- 
will help us to help you. [Here](https://github.com/hackforla/website/issues/1619#issuecomment-897315561) and [here](https://github.com/hackforla/website/issues/1908#issuecomment-877908152) are examples of well-formed questions.  

<sub>You are receiving this comment because your last update was before ${cutoffTime} PST.</sub>
