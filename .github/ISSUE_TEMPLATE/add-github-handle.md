---
name: github-handle in project file
about: For adding github-handle to member data in a project file
title: Add github-handle for [INSERT NAME] in [INSERT PROJECT FILE]
labels: 'good first issue, P-Feature: Project Info and Page, ready for dev lead, role:
  back end/devOps, role: front end, size: 0.25pt'
assignees: ''

---

### Prerequisite
1. Be a member of Hack for LA. (There are no fees to join.) If you have not joined yet, please follow the steps on our [Getting Started Page](https://www.hackforla.org/getting-started).
2. Before you claim or start working on an issue, please make sure you have read our [How to Contribute to Hack for LA Guide](https://github.com/hackforla/website/blob/7f0c132c96f71230b8935759e1f8711ccb340c0f/CONTRIBUTING.md).

### Overview
We need to create a single variable `github-handle` to hold the github handle for each member of the leadership team. Eventually `github-handle` will replace the `github` and `picture` variables, reducing redundancy in the project file.

### Action Items
- [ ] Open the file `_projects/[PROJECT FILE]` in the IDE
- [ ] Replace:
```
- name: [INSERT MEMBER NAME]
```
with
```
- name: [INSERT MEMBER NAME]
  github-handle:
```
- [ ] Do not use a tab to indent `github-handle`. YAML doesn't allow tabs; it requires spaces.
- [ ] Using docker, confirm that the appearance of the project webpage is unchanged at all screen sizes. The project webpage URL can be found below under Resources.

### For Merge Team
- [ ] Release the dependency for this issue in #5441. If all the dependencies have been completed, close that issue.

### Resources/Instructions
https://github.com/hackforla/website/wiki/project.md-file-template
https://jekyllrb.com/
For QA to validate change: https://github.com/hackforla/website/blob/gh-pages/_projects/[INSERT_PROJECT_FILE]?plain=1
Project Webpage: https://www.hackforla.org/projects/[INSERT-PROJECT-FILENAME-WITHOUT-.MD-EXTENSION]

- This issue is part of #5441.
