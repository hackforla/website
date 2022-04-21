---
name: 'Credits file template: Edit content field and remove type field'
about: Template for editing content field and removing type field in a credits file
title: Edit content field and remove type field from [INSERT FILE NAME HERE].yml credits
  file
labels: 'good first issue, P-Feature: Credit, role: back end/devOps, role: front end,
  size: 0.5pt'
assignees: ''

---

### Prerequisite
1. Be a member of Hack for LA. (There are no fees to join.) If you have not joined yet, please follow the steps on our [Getting Started page](https://www.hackforla.org/getting-started).
2. Please make sure you have read our **[Hack for LA Contributing Guide](https://github.com/hackforla/website/blob/gh-pages/CONTRIBUTING.md)** before you claim/start working on an issue.

### Overview
As a developer, I want to edit the content field and remove the type field from a credit's yml file so that redundant code is removed and the code is easier to understand.

### Details
Currently, in each credit's yml file, there is a `content` field and a `type` field, which contains similar information. Since the fields are redundant, we decided to remove the `type` field.  

Also, we changed the `content` field to the `content-type` field to make it clearer what its purpose is. The possible values for `content-type` field are image, video, or audio; other types of content can be added if necessary. In the future, this will allow developers a way to differentiate easily between different types of content in order to show each credit's media file correctly on the website.

### Action Items
For the file `_data/internal/credits/[INSERT FILE NAME HERE].yml`, do the following:
- [ ] Change line [ADD LINE NUMBER WHICH HAS CONTENT] for the content field from
  ```
  content: [INSERT THE CURRENT TEXT ON THE FILE HERE]
  ```
  to
  ```
  content-type: image
  ```
- [ ] Remove line [ADD LINE NUMBER WHICH HAS TYPE] for the type field
  ```
  type: [INSERT THE CURRENT TEXT ON THE FILE HERE]
  ```
- [ ] Once the pull request associated with this issue is approved and merged, please update and edit epic #2775 by
  - [ ] Checking off the dependency for this issue
  - [ ] If all dependencies are checked off, please move issue #2775 to the New Issue Approval column and remove the Dependency label

### Resources/Instructions
- This issue is tracked in the epic #2775.

#### File and Code links you will need to work on this issue
- Directory to find the page in once you have it in your IDE: `_data/internal/credits/[INSERT FILE NAME HERE].yml`

- Click on the links below to see the source file code:
[INSERT PERMALINK FOR THE LINE NUMBER WHICH HAS THE CONTENT FIELD] 
[INSERT PERMALINK FOR THE LINE NUMBER WHICH HAS THE TYPE FIELD]

<!-- To see an example of a permalink for a line of code, uncomment the line below -->
<!-- https://github.com/hackforla/website/blob/598f33399cc81f3e095fe047a726eca09a595465/_data/internal/credits/act.yml#L4 -->
