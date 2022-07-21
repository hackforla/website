---
title: Update GitHub Actions' Depencendies
labels: "Feature: Board/GitHub Maintenance, role: back end/devOps, Size: Medium"
---
### Overview
As a GitHub Action, I want to ensure that all of my fellow GitHub Actions' dependencies are up-to-date so that they don't unexpectedly break.

### Action Items
- [ ] Check all GitHub actions' dependencies for updates
  - All actions can be found in YAML files under [.github/workflows](https://github.com/hackforla/website/tree/gh-pages/.github/workflows)
- [ ] Create issues to update any out-of-date dependencies

### Resources/Instructions
How to check a GitHub action's dependencies for updates:
- Open the workflow YAML file under `.github/workflows/`
- Search for lines that contain `uses:`, for example: https://github.com/hackforla/website/blob/3d0107ce1df13cb647bc09605499667cb851b2f5/.github/workflows/github-data.yml#L15
- Search Google for the name of the dependency and click on the GitHub Marketplace result
- Look at the version tag underneath the action name and make sure if says "Latest Version" next to it
- If the version number on the marketplace site is greater than the version number in the workflow file, it is out-of-date (for example: `actions/checkout@v2` is on version 2 but the marketplace shows that version 3 is the latest version)