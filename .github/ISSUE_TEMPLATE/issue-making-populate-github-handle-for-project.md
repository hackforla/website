---
name: Issue Making Populate github-handle
about: 'To make Issue Making: Level 1 issues for populating each member''s github-handle in a project file'
title: Create issues to populate 'github-handle' variables in [INSERT PROJECT FILE] 
labels: 'Issue Making: Level 1, Complexity: See issue making label, good first issue, P-Feature: Project Info and Page,  role: front end, size: 0.5pt, role: back end/devOps, epic'
assignees: ''
---

## Title: Create issues to populate github-handle variable for members in [INSERT-PATH-TO-PROJECT-FILE]

### Prerequisites

1. You must be a member of Hack for LA to work on an issue. If you have not joined yet, please follow the steps on our [Getting Started](https://www.hackforla.org/getting-started) page.
2. Please make sure you have read our Hack for LA [Contributing Guide](https://github.com/hackforla/website/blob/gh-pages/CONTRIBUTING.md) before you claim/start working on an issue.

### Overview
We need to create issues to populate the `github-handle` variable for each project team member in [INSERT-PATH-TO-PROJECT-FILE] with the correct GitHub handle. 

`github-handle` will eventually replace the `github` and `picture` variables, reducing redundancy in the project file, but that will not be done in this issue.

### Action Items
- [ ] For each team member listed in [INSERT PATH TO PROJECT FILE], create an issue using the [template](https://github.com/hackforla/website/issues/new?template=populate-github-handle.md)
- [ ] For each issue:
   - [ ] In the title, replace [INSERT NAME] with the member's name
   - [ ] In the title, replace [INSERT PROJECT FILE] with the project file name, e.g. 'website.md'
   - [ ] Under Action Items, replace [INSERT MEMBER NAME] with the member's name  (in 3 places)
   - [ ] Under Action Items, replace [INSERT PROJECT FILE] with the project file name
     - Please note, you do not have to replace the [INSERT GITHUB USERNAME] placeholder
   - [ ] Under Resources, replace [INSERT-PROJECT-FILENAME-WITHOUT-.MD-EXTENSION] with the project name without the extension, e.g. 'website'
   - [ ] Apply the following labels: "ready for merge team", "good first issue", "role: front end", "role: back end/devOps", "size: 0.25pt", "P-Feature: Project Info and Page"
   - [ ] When the issue has been created, add this issue as the parent issue under "Relationships"
   - [ ] List the issue number in #8428 under 'Good First Issues'
- [ ] When all issues have been created and listed, move this issue to the "Questions/In Review" column of the Project Board, and apply the label "ready for merge team"
  

### Resources/Instructions
- https://github.com/hackforla/website/wiki/project.md-file-template (all project markdown files use this format)
- Project Webpage: https://www.hackforla.org/projects/[INSERT-PROJECT-FILENAME-WITHOUT-.MD-EXTENSION] (the public URL of the file you are editing)
- This issue is part of #8428.
- https://jekyllrb.com/ (the whole site is built on Jekyll)