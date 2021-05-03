Template of a project.md file

```yaml
---
# 'identification' is the 9 digit ID for your repo in the GitHub API.
identification: ''
title:
description:
# card image should be 600px wide x 400px high
image: /assets/images/projects/[project repo name + .jpg or .png]
alt: 'description of the card image'
# hero image should be 1500px wide x 700px high
image-hero: /assets/images/projects/[project repo name + -hero + .jpg or .png]
alt-hero: 'description of the hero image'
leadership:
  - name: First Last
    role: Product Manager
    links:
      slack: 'https://hackforla.slack.com/team/xxxxxx'
      github: 'https://github.com/githubusername'
    picture: https://avatars.githubusercontent.com/githubusername
  - name: Given Surname
    role: Lead
    links:
      slack: 'https://hackforla.slack.com/team/xxxxxx'
      linkedin" 'https://linkedin.com/linkedin-username'
    picture: https://avatars.githubusercontent.com/githubusername
links: 
  - name: Github
    url: 'https://www.example.com'
  - name: Slack
    url: 'https://www.example.com'
  - name: Test Site
    url: 'https://test.example.com'
  - name: Demo Site
    url: 'https://demo.example.com'
  - name: Site
    url: 'https://live.example.com'
  - name: Overview
    url: https://github.com/hackforla/product-management/blob/master/project-one-sheets/[REPLACE WITH PROJECT NAME]-Project-One-Sheet.pdf
  # unused links can be commented out
  # - name: Showcase deck
  #   url: ''
  #   alt: ''
looking:
  - category: Development
    skill: one skill
  - category: UI/UX
    skill: another skill
  - category: Content
    skill: Researcher
technologies: 
  - Node.js 
  - ReactJS 
  - Ruby on Rails
  - other etc.
location: 
  - Downtown LA
  - Santa Monica
  - South LA
  # must choose one of the above (closest)
partner:
tools: figma, photoshop, sketch, phone calls.
vertical:
status:
# If the card should not be included on the site, change visible to "false"
visible: true
# If the project should not have a project homepage for any given reason, add the following line (uncommented):
# project-homepage: false
# For completed projects. Uncomment and add contact info if provided
# completed-contact:
---
```
Data for the 'languages' and 'contributors' sections is pulled from the project's GitHub main repository using the GitHub API. In order to merge the GitHub API data into the finished card, you need to put the project's GitHub id in the 'identification field'. To find the id, go to the GitHub homepage for the project's main repository and search the page source for `<meta name="name="octolytics-dimension-repository_id" content="#####">`; the number in the 'content' field is the id you want.

[Sample](https://raw.githubusercontent.com/hackforla/website/gh-pages/_projects/hellogov.md) project .md file for reference 

[image naming decision record](https://github.com/hackforla/website/issues/233)

### Links
On the project homepage:

* Links with the names "GitHub", "Site", "Demo Site", and "Test Site" displayed in the "Links" section in the left half of the Project Overview.
* Links named Wiki and Readme are displayed under the "Getting Started" dropdown
* All links are also displayed in the "Resources" section at the bottom of the project homepage

On the project card on HfLA homepage:

* all links are displayed

### Leadership
To create a Slack link for each person, go to the project's Slack channel, find a message from that person. Click on their name; this should give you a popup window with the user's picture, name, and a link to "View full profile". Click on "View full profile". That pane gives you the options message, call, and more. Click on "more" and you should be shown "Copy member ID" followed by the actual id. This is the id you need to use in the slack url, e.g. https://app.slack.com/team/<member_id_here