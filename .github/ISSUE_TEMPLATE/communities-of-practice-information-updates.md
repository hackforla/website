---
name: Communities of Practice information updates
about: Template for CoP leads to review and update the Name, Description. Leadership   Type,
  Leadership members, Slack in order keep the community of practice page on   the
  website up to date.
title: 'Communities of Practice information updates: [INSERT NAME OF Community of   Practice]'
labels: 'role: product'
assignees: ''

---

body:
- type: markdown
    attributes:
      value: "### Overview"
  - type: markdown
    attributes:
      value: "As a Community of Practice Co-Lead, I need my CoP's details to be up to date on the HackforLA website."
  - type: markdown
    attributes:
      value: "### Action Items"
  - type: markdown
    attributes:
      value: "Change CoP name: NO"
  - type: markdown
    attributes:
      value: "Change Description: NO"
  - type: markdown
    attributes:
      value: "Change Leadership Type: NO"
  - type: markdown
    attributes:
      value: "Change Slack Link: NO"
  - type: dropdown
    id: remove-person-yes-no
    attributes:
      label: "Remove person(s) and info from CoP file?"
      options:
        - "YES"
        - "NO"
    validations:
      required: true
  - type: textarea
    id: remove-person
    attributes:
      label: "If YES on remove person(s) edit the below to provide the information required. If NO, delete the template in the field below:"
      value: "Name:"
  - type: dropdown
    id: add-person-yes-no
    attributes:
      label: "Add person(s) and info to CoP file?"
      options:
        - "YES"
        - "NO"
    validations:
      required: true
  - type: textarea
    id: add-persons
    attributes:
      label: "If YES on add person(s), edit the below to provide the information required. If NO, delete the template in the field below:"
      value: |
        Name:
        Title:
        GitHub Handle:
        Slack Member ID:
  - type: markdown
    attributes:
      value: "### Resources"
  - type: markdown
    attributes:
      value: |
        folder where files are in the repo: https://github.com/hackforla/website/tree/gh-pages/_data/internal/communities
        where you can see the live page: https://www.hackforla.org/communities-of-practice
