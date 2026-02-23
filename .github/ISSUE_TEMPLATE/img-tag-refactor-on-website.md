---
name: img Tag Refactor on Website
about: 'For removing the ending slash in img tags on the website, so that `<img.../>`
  becomes `<img..>` '
title: 'img Tag Refactor: [INSERT PAGE HERE] page(s)'
labels: 'Feature: Refactor HTML, good first issue, ready for merge team, role: back
  end/devOps, role: front end, size: 0.25pt'
assignees: ''

---

### Prerequisite
1. Be a member of Hack for LA. (There are no fees to join.) If you have not joined yet, please follow the steps on our [Getting Started page](https://www.hackforla.org/getting-started) and attend an onboarding session.
2. Before you claim or start working on an issue, please make sure you have read our [How to Contribute to Hack for LA Guide](https://github.com/hackforla/website/blob/gh-pages/CONTRIBUTING.md).

### Overview
We want to change an img HTML tag ending with a slash (<img.../>) to an img tag without an ending slash (<img...>) so that the codebase is consistent with how we use img HTML tags.

### Action Items
- [ ] In your local IDE, navigate to `[INSERT PATH TO FILE HERE]`
- [ ] Remove the ending slash in the img HTML tag by changing
```
[INSERT LINE OF CURRENT CODE HERE]
```
to
```
[INSERT DESIRED LINE OF CODE HERE]
```
- [ ] Using Docker, check the page remains the same in mobile, tablet, and desktop views as on the current website (See 2 in the Resources/Instructions section below)

### Resources/Instructions
1. For QA to validate change: [INSERT LINK TO FILE]
2. Webpage(s): [INSERT LINK TO PAGE ON WEBSITE HERE]
3. This issue is tracked in [HfLA-Website: img Tag Audit spreadsheet's img with Ending Slash tab](https://docs.google.com/spreadsheets/d/1cq8iLOYQkAbho2GsRAxVJYgjxDeJ9KLdx2NuL4G6vu4/edit#gid=0), which is part of #4362
