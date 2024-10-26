---
name: Review Inactive Team Members
about: Issue template used only by `schedule-monthly.yml`
title: "Review Inactive Team Members"
labels: ['Feature: Administrative', 'Feature: Onboarding/Contributing.md', 'role: dev leads', 'Complexity: Small', 'size: 0.5pt']
milestone: 8
assignees: ''
---

<!--
Note: This template is only for use by the `schedule-monthly.yml` workflow.
--> 

# Review of Inactive Website Team Members
## Inactive Members
Developers: If your name is on the following list, our team bot has determined that you have not been active with the Website team in the last 30 days. If you remain inactive or we don't hear back from you in the upcoming weeks, we will unassign you from any issues you may be working on and remove you from the 'website-write' team.  

${notifiedList}  

### How you can remain active
The bot is checking for the following activity:
- If you are assigned to an issue, that you have provided an update on the issue in the past 30 days. The updates are due weekly.
- If your issue is a `Draft` in the "New Issue Approval" column, that you have added to it within the last 30 days.
- If you are reviewing PRs, that you have posted a review comment within the past 30 days.
- If you are newly onboarded, that you are assigned to your "Skills Issue" and you have cloned the HfLA website repo to your personal repo.

If you have been inactive in the last 30 days (using the above measurements), you can become active again by doing at least one of the above actions. If you do not do at least one of the above actions, the bot will automatically remove you from the 'website-write' team in the next 30 days.  

### Did we make a mistake?
If you were active during the last 30 days (using the above measurements) and the bot made a mistake, let us know: Copy the following message into a comment below, add the pertinent issue or PR number, then select "Comment". Next, select "...", then "Reference in a new issue".  [Watch demo](https://github.com/t-will-gillis/website/assets/40799239/59d45792-6950-46f0-a310-7c1ecd0c87be)
```
The Hack for LA website bot made a mistake!
I am responding to Issue #${thisIssueNumber} because I have been active.
See my Issue #{_list issue_} or my review in PR #{_list PR_}

## Dev Leads
This member believes that the bot has made a mistake by placing them on the "Inactive Member" list. Please see the referenced issue.

```
After you leave the comment, please send us a Slack message on the "hfla-site" channel with a link to your comment.  

### Temporary leave
If you have taken a temporary leave, and you have been authorized to keep your assignment to an issue:  
- Your issue should be in the "Questions/ In Review" column, with the `ready for dev lead` label and a note letting us know when you will be back.
- We generally encourage you to unassign yourself from the issue and allow us to return it to the "Prioritized backlog" column. However, exceptions are sometimes made.
  
## Removed Members
Developers: If your name is on the following list, our team bot has determined that you have not been active with the Website team for over 60 days, and therefore you have been removed from the 'website-write' team.  

${removedList}  

If this is a mistake or if you would like to return to the Hack for LA Website team, let us know: Copy the following message into a comment below then select "Comment". Next, select "...", then "Reference in a new issue".  [Watch demo](https://github.com/t-will-gillis/website/assets/40799239/59d45792-6950-46f0-a310-7c1ecd0c87be)
```
The Hack for LA website bot removed me!
I am responding to Issue #${thisIssueNumber} because I want to come back.
Please add me back to the 'website-write' team, I am ready to work on an issue now.

## Dev Leads
This member was previously on the 'website-write' team and is now asking to be reactivated. Please see the referenced issue.

```
After you leave the comment, please send us a Slack message on the "hfla-site" channel with a link to your comment.  

## Dev Leads
This issue is closed automatically after creation. If a link referred you to this issue, check whether: 
- A "Removed Member" is requesting reactivation to the 'website-write' team. If so, confirm that the member is/was a part of HfLA, then reactivate and inform them via a comment on the referring issue as well as via Slack.
- An "Inactive Member" believes that the bot has made a mistake. If so, determine whether the member has or has not been active based on the issue or PR number provided in the member's comment. If multiple members are being inappropriately flagged as "inactive" by the bot, then submit an ER / Issue in order to deactivate the `schedule-monthly.yml` workflow so that the cause of the bug can be investigated and resolved. 
