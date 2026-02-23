---
name: Populate github-handle
about: 'For populating github-handle variable in project file'
title: Populate github-handle for [INSERT NAME] in [INSERT PROJECT FILE]
labels: 'good first issue, P-Feature: Project Info and Page,  role: front end, size: 0.25pt, role: back end/devOps'
assignees: ''

---

### Prerequisite
1. Be a member of Hack for LA. (There are no fees to join.) If you have not joined yet, please follow the steps on our [Getting Started Page](https://www.hackforla.org/getting-started).
2. Before you claim or start working on an issue, please make sure you have read our [How to Contribute to Hack for LA Guide](https://github.com/hackforla/website/blob/7f0c132c96f71230b8935759e1f8711ccb340c0f/CONTRIBUTING.md).

### Overview
We need to populate the 'github-handle' variable with the correct GitHub username for each member of the leadership team. Eventually `github-handle` will replace the `github` and `picture` variables, reducing redundancy in the project file.


### Action Items
- [ ] Open the file `_projects/[PROJECT FILE]` in the IDE [^1]
- [ ] Locate the GitHub username for [INSERT MEMBER NAME] in their existing `github` variable URL (e.g.,`https://github.com/githubusername`)
- [ ] Replace:
```
- name: [INSERT MEMBER NAME]
  github-handle:
```
with
```
- name: [INSERT MEMBER NAME]
  github-handle: [INSERT GITHUB USERNAME]
```
- [ ] Using docker, confirm that the appearance of the project webpage is unchanged at all screen sizes. The project webpage URL can be found below under Resources.

### For Merge Team
- [ ] Release the dependency for this issue in #8428. If all the dependencies have been completed, follow the Merge Team instructions on that issue.

### Resources/Instructions
- https://github.com/hackforla/website/wiki/project.md-file-template (all project markdown files use this format)
- Project Webpage: https://www.hackforla.org/projects/[INSERT-PROJECT-FILENAME-WITHOUT-.MD-EXTENSION] (the public URL of the file you are editing)
- This issue is part of #8428.
- https://jekyllrb.com/ (the whole site is built on Jekyll)
[^1]: https://github.com/hackforla/website/blob/gh-pages/_projects/[INSERT_PROJECT_FILE]?plain=1