Use this to describe a Community of Practice.  
Entries are placed in the _communities/ folder. Jekyll pulls them into the cards on the Communities of Practice page.

```yaml
---
# the name of the CoP
name: 
description: 
# if this is "true", it'll show up on the page. If "false", it'll be hidden
visible: 
# Common values: Active, On Hiatus, Seeking
status: 
location:
  - Remote

# There's flexibility in the size/ratio, but works best if 1200px W x 800px H or 600 x 400 JPG
image: /assets/images/communities-of-practice/group.jpg
alt: 'A person uses a laptop to review a data dashboard'

# Day X:00-Y:00 pm PT (frequency: every week, every other week)
meeting-times: 

# Common values: Mentor Led, Peer Led, Seeking
leadership-type: 
leadership:
  - name: First Last
    role: Co-lead
    links:
      slack: https://hackforla.slack.com/team/xxxxxx
      github: https://github.com/githubusername
    picture: https://avatars.githubusercontent.com/u/xxxxxxx

  - name: First Last
    role: Co-lead
    links:
      slack: https://hackforla.slack.com/team/xxxxxx
      github: https://github.com/githubusername
    picture: https://avatars.githubusercontent.com/u/xxxxxxx

links:
  - name: Slack
    url: https://www.example.com
  - name: Github
    url: https://www.example.com

# Fill this out if we're trying to recruit someone to start the CoP. It will only show up if CoP Status is "Seeking"
recruiting-message:
---
```

[Sample](https://github.com/hackforla/website/blob/gh-pages/_communities/data-science.md) CoP.md file for reference  

**Sample recruiting message:** 

If you've been working on a Hack for LA project for a month or more and are interested in organizing this group, join us at the Project/Product Management Community of Practice meeting to talk about how we can help you get this off the ground (the project leads will be able to get the word out to their project team).


**Slack link for leadership** (Copied from [project.md](https://github.com/hackforla/website/wiki/Template-of-a-project.md-file) wiki)  

To create a Slack link for each person, go to the project's Slack channel, find a message from that person. Click on their name; this should give you a popup window with the user's picture, name, and a link to "View full profile". Click on "View full profile". That pane gives you the options message, call, and more. Click on "more" and you should be shown "Copy member ID" followed by the actual id. This is the id you need to use in the slack url, e.g. https://app.slack.com/team/<member_id_here`