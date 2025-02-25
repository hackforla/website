---
name: 'Skills Issue: Developer'
about: Guides all developers through their time on the website team
title: 'Skills Issue: Developer: [replace brackets with your name]'
labels: 'Complexity: Prework, Feature: Board/GitHub Maintenance, role missing, size:
  3pt'
assignees: ''

---

### Prerequisite
We are looking forward to having you on our team. Please make sure to attend the general Hack for LA onboarding to get the process started https://meetup.com/hackforla/events.

### Overview
As a developer on the Website team this issue will be your companion and a place to track your progress with the path we have set out for you.

### Special Notes
1. This issue will stay open for as long as you are on the Website team.  Use it as a place to indicate that you have completed a level as well as get instructions on how to progress. 
2. Usually we don't want you to have more than one issue assigned to you at a time, this issue is the exception, because it is instructions on how to work on other issues.  Do not close this issue until you leave the team (please see to do items associated with leaving professionally).
3. The action items listed below should mostly be worked on in a sequential order. However, you don't have to wait on one if you can proceed with the others. For instance, you don't have to wait for attending a weekly meeting before setting up your dev environment.  
4. During the general Hack for LA onboarding, you will be directed to fill out a form that will add you to the Website team Google Drive and GitHub teams, and then you will add yourself to the roster.  If you have not done that yet, you will not be able to do the action items in section 1.
5. The template that this issue is made from is a work in progress.  We will be updating it, and possibly updating your issue.  It works through section 17.  But after that it's still a work in progress.  If any of the links don't work, please leave a note in the comments on this issue https://github.com/hackforla/website/issues/4944, and we will get you an update.

<a name="table-of=contents"></a>
### Action Items
#### Table of Contents
Sections
 1 - [Joining the website team](#section-1)
 2 - [Team Meetings (Options and Requirements)](#section-2)
 3 - [Development Environment Setup](#section-3)
 4 - [First GitHub Issue (GFI)](#section-4)
 5 - [Weekly Updates](#section-5)
 6 - [1st Pull Request](#section-6)
 7 - [Additional reading 1](#section-7)
 8 - [2nd good first issue](#section-8)
 9 - [Pull Request Reviews - GFI](#section-9)
10 - [Additional reading 2](#section-10)
11 - [Small Issue](#section-11)
12 - [Pull Request Reviews - Small](#section-12)
13 - [Issue Making - Level 1 (GFI & Small)](#section-13)
14 - [Medium Issue](#section-14)
14.1 [Issue Making - Level 2 (Medium)](#section-14.1)
15 - [Pull Request Reviews - Medium](#section-15)
16 - [Issue Making - Level 2 (GFI)](#section-16)
17 - [Merge Team Skills Review](#section-17)
[FAQ](#section-faq)
[Resources](#resources)

<a name="section-1"></a>
#### 1 - JOINING THE WEBSITE TEAM.
- [ ] Add yourself to the [#hfla-site](https://hackforla.slack.com/archives/C4UM52W93) and [#hfla-site-pr](https://hackforla.slack.com/archives/C025ERFDM4Y) Slack channels
- [ ] Self assign this issue (gear in right side panel).  
  - [ ] If there are no gears in the right side panel of this issue (next to Assignees, Labels, Projects, Milestone, Development): 
     - [ ] check to see if you are logged in to GitHub (if you are not logged in you will see a sign in button on the top right of this browser tab).  
         - if you are not logged in
            - [ ] log in and try to self assign again.  If that does not work, continue with the instructions below.
         - if you are logged in
            - [ ] contact a merge team member or technical lead on the hfla-site Slack channel with the following message
               ```
               Hi.  I don't see the gear on my issue, here are my details:
               - issue: #
               - GitHub handle:
               - date onboarded:
               - row on roster:               
               ```
            - [ ] add the following text to a comment on this issue
               ```
               I don't have access, I have messaged the merge team / technical lead in the hfla-site Slack channel.

               [return to section 1](#section-1)
               ```
- [ ] Register for Zoom meetings using the forms in the [Register for Meetings slide](https://docs.google.com/presentation/d/1jg2UusQkY4APKf6Jn-q-pRDYZrae1DzI5cH76GXsMKQ/edit?pli=1#slide=id.g26ea7b29f52_0_14)
- [ ] Add the `role: front end` or `role: back end/devOps` or both label(s) to this issue and remove the `role missing` label (gear in right side panel)
- [ ] Add this issue to the Project Board under the Projects section (gear in right side panel)
- [ ] Sign up for a [Figma](https://Figma.com) account
<a name="section-1-intake-self-test"></a>
- [ ] Fill out the [INTAKE  Self Test](#Intake_Skills_List) so that we can help you find issues that will match where you need to fill in.
- [ ] Post the following message in a comment below on this issue and then answer it.
    ```
    ### 1 - JOINING THE WEBSITE TEAM update
    >How many hours did it take you to finish this step?
    
    A:
   
    [return to section 1](#section-1)
    ```

[**⇧** Table of Contents](#table-of=contents)
 

<a name="section-2"></a>
#### 2 - TEAM MEETINGS (OPTIONS AND REQUIREMENTS)
- [ ] Attend weekly team meetings:
  - [ ] Developer (front-end/back-end) weekly team meeting, Tuesdays 7-8pm Pacific
  - [ ] (Optional) Office Hours, Thursdays 7-8pm Pacific
  - [ ] All team meeting (UX, Development, Product), Sunday 10am-12pm Pacific
- [ ] Note: The meetings on the 1st-7th of every month are planning meetings for leads and merge team. You are welcome to observe but we don't provide team member support.
- [ ] Note regarding weekly team meeting requirements: All website team members are required to attend at least 1 team meeting in a week (held on Tuesdays, Thursdays and Sundays). In case, you are unable in any given week, you should reach out to the tech leadership team. Exceptions to this requirement may be provided on a case-by-case basis. Also, please let the tech leadership team know through a Slack message in the #hfla-site Slack channel as well as an @ mention in a comment of the issue that you would be working on, if you are planning to take a week off or a longer vacation.
- [ ] Post the following message in a comment below on this issue and then answer it.
    ```
    ### 2 - TEAM MEETINGS update
    >which meetings did you register for
     - [ ] Developer (front-end/back-end)
     - [ ] (Optional) Office Hours
     - [ ] All team meeting 
    >When did you attend your first team meeting?
    
    A:
    
    [return to section 2](#section-2)
    ```

[**⇧** Table of Contents](#table-of=contents)

<a name="section-3"></a>
#### 3 - DEVELOPMENT ENVIRONMENT SETUP
- [ ] Complete steps 1.1 - 1.7 in [Part 1: Setting up the development environment within Contributing.md](https://github.com/hackforla/website/blob/gh-pages/CONTRIBUTING.md#part-1-setting-up-the-development-environment)
  - [ ] OPTIONAL: If you run into any issues, use [4.1 How do I ask for help within Contributing.md](https://github.com/hackforla/website/blob/gh-pages/CONTRIBUTING.md#41-what-do-i-do-if-i-need-help) 
<a name="section-3-ongoing-self-test"></a>
  - [ ] If you have never setup your development environment before, please update your [Ongoing Skills List](#Ongoing_Skills_List) to check off "Setting up your local environment from a contributing file"
- [ ] Post the following message in a comment below on this issue and then answer it.  While keeping in mind that this is just to get feedback on how long it took you to get to this point. There is no right or wrong answers. There is no judgement. It is ok if you take a long time or if you do it really fast or at any pace.  Getting your dev environment setup will be easier for some people because they might already have some experience or items installed on their computer and you may not. This is an important step, be patient with yourself and your computer but keep on it till you get it done.
    ```
    ### 3 - GETTING YOUR DEVELOPMENT ENVIRONMENT SETUP update
    >How many hours did it take you to finish this step?
    
    A:
    
    [return to section 3](#section-3)
    ```

[**⇧** Table of Contents](#table-of=contents)

<a name="section-4"></a>
#### 4 - FINDING AND ASSIGNING YOUR FIRST GITHUB ISSUE (GFI)
- [ ] Read section 2.1 - 2.2 in [Part 2: How the Website team works with GitHub issues within Contributing.md](https://github.com/hackforla/website/blob/gh-pages/CONTRIBUTING.md#part-2-how-the-website-team-works-with-github-issues)
- [ ] Take the first issue from this prefiltered view of the project board (status: prioritized backlog, good first issues = [dev: GFI](https://github.com/orgs/hackforla/projects/86/views/2))
  - [ ] Follow the steps in section [2.4 Claiming an Issue](https://github.com/hackforla/website/blob/gh-pages/CONTRIBUTING.md#24-claiming-an-issue) to assign yourself your first issue.
  - [ ] Move your issue from the Project Board's "Prioritized Backlog" column to the "In progress (actively working)" column and use [2.7 Working on a Issue within Contributing.md](https://github.com/hackforla/website/blob/gh-pages/CONTRIBUTING.md#27-working-on-an-issue) to start working on your issue
  - [ ] Read [2.6 What to do when you need to stop mid issue](https://github.com/hackforla/website/blob/gh-pages/CONTRIBUTING.md#26-what-to-do-when-you-need-to-stop-mid-issue)
- Once you self assign an issue, an automation will post a welcome message in a comment giving you additional guidance to manage your issue (includes how to provide estimates and progress reports there).  
   - [ ] On assignment, you will be prompted to estimate Availability and ETA.  
      >Availability for this week:
      >
      >My estimated ETA for completing this issue: 

      Once you have done that on your good first issue, check this box, above, on this issue to let us know you have completed that task and understand how to do it in future.  
          - If you have any questions about estimating the issue you choose, please add them to the issue, put the issue in the "Questions/ In Review" column, and add the labels `ready for merge team` and `Status: Help Wanted`
- [ ] Post the following message in a comment below on this issue and then answer it.
    ```
    ### 4 - FINDING AND ASSIGNING YOUR FIRST GITHUB ISSUE update
    >How many hours did it take you to finish this step?
    
    A:
    
    [return to section 4](#section-4)
    ```

[**⇧** Table of Contents](#table-of=contents)

<a name="section-5"></a>
#### 5 - GIVING WEEKLY UPDATES ON YOUR DEVELOPMENT ISSUES
- [ ] Progress Reports: Copy the below and put it in the issue once you have been assigned to the issue at least 5 days (we check weekly on Fridays), or sooner if you have something to report.  If you finish this issue before 5 days are reached, Yeah!!, do it on your next issue. **This update should be done every week for every issue that you are assigned to**. The checkbox here is meant for us to see if you understood the instructions when you end up doing your first weekly progress update.
    ```
    Provide Update
    1. Progress
    2. Blockers
    3. Availability
    4. ETA
    ```
- [ ] Post the following message in a comment below on this issue and then answer it.
    ```
    ### 5 - GIVING WEEKLY UPDATES ON YOUR DEVELOPMENT ISSUES update
    >on what issue did you give your first weekly update?
    
    - #
    
    [return to section 5](#section-5)
    ```

[**⇧** Table of Contents](#table-of=contents)

<a name="section-6"></a>
#### 6 - SUBMITTING YOUR FIRST PULL REQUEST
- [ ] Read sections 3.1.a - 3.1.c in [3.1 How to make a pull request](https://github.com/hackforla/website/blob/gh-pages/CONTRIBUTING.md#31-how-to-make-a-pull-request) to learn more about how to make a pull request (PR) for the issue that you are working on and how to make changes to your PR if changes are requested by the reviewer
 - Confirm you understand the following:
    - [ ] Please work on only one issue at a time and wait until your pull request is merged before picking up another issue.  
    - [ ] Please keep an eye on your PR, if someone leaves you a comment asking for a change, please respond in a timely way.
- [ ] Once your pull request has been accepted, post the following message in a comment below on this issue and then answer it.
   ```
   ### 6 - PULL REQUESTS update
   >What is the number of your first merged pull request?
   - #
   >Did you receive any reviews that required you to change anything on your PR? 
   - [ ] no
   - [ ] yes (if yes, describe what you learned)
   
   Comments: 
  
   [return to section 6](#section-6)
   ```

[**⇧** Table of Contents](#table-of=contents)

<a name="section-7"></a>
#### 7 - ADVANCED READING TO READY YOU FOR LARGER MORE COMPLEX ISSUES
- [ ] Read the [Start Here - Developers](https://www.figma.com/file/0RRPy1Ph7HafI3qOITg0Mr/Hack-for-LA-Website?node-id=8583%3A0) in Figma
- [ ] Go familiarize yourself with the [Hack for LA Design System page in Figma](https://www.figma.com/file/0RRPy1Ph7HafI3qOITg0Mr/Hack-for-LA-Website?node-id=3464%3A3) (where you can see components and their SCSS classes)
- [ ] Post the following message in a comment below on this issue and then answer it.
    ```
    ### 7 - ADVANCED READING TO READY YOU FOR LARGER MORE COMPLEX ISSUES update
    >How many hours did it take you to finish this step?
    
    A:
    >Do you have any questions about what you read?
       - [ ] yes, I had questions, and I left comments in the appropriate issues [WE NEED TO UPDATE THOSE TWO RESOURCES TO HAVE LINKS TO ISSUES WHERE PEOPLE CAN PUT QUESTIONS AND MOVE THE ISSUES TO THE QUESTIONS/REVIEW COLUMN]
       - [ ] no, I did not have any questions
       
    [return to section 7](#section-7)
    ```

[**⇧** Table of Contents](#table-of=contents)

<a name="section-8"></a>
#### 8 - MOVE ON TO 2ND GOOD FIRST ISSUE (AKA, IT GETS EASIER AND DID YOU BRANCH CORRECTLY?)
- Do another good first issue (two per person total).  We have you do another simple issue because this we want you to 
   - see the difference once you have successful setup your dev environment
   - see how each PR gets easier to do with repetition
   - make sure you know how to branch properly (most problems show up in the second commit)
- [ ] Take the first issue from this prefiltered view of the project board (status: prioritized backlog, good first issues = [dev: GFI](https://github.com/orgs/hackforla/projects/86/views/2))
- [ ] Submit your PR
- Once your pull request has been accepted
<a name="section-8-ongoing-self-test"></a>
   - [ ] Update your [Ongoing Skills List](#Ongoing_Skills_List) to check off "GitHub branching" &  "Pull Requests"
   - [ ] post the following message in a comment below on this issue and then answer it.
       ```
       ### 8 - MOVE ON TO 2ND GOOD FIRST ISSUE update
       >What is the number of your 2nd merged pull request?
       - #
       >Did you receive any reviews that required you to change anything on your PR? 
       - [ ] no
       - [ ] yes (if yes, describe what you learned)
       
       Comments: 
       
       [return to section 8](#section-8)
       ```

[**⇧** Table of Contents](#table-of=contents)

<a name="section-9"></a>
#### 9 - GOOD FIRST ISSUE (GFI) PULL REQUEST REVIEWS
Now that you have two merged `good first issue` PRs, you are eligible to review [good first issue PRs, Review Required](https://github.com/hackforla/website/pulls?q=is%3Apr+is%3Aopen+label%3A%22good+first+issue%22+review%3Arequired) from other people who are following in the same journey path as you.

See [How to review Pull Requests](https://github.com/hackforla/website/wiki/How-to-review-pull-requests) guide will teach you how to review pull requests.

Please review 5 `good first issue` PRs.  Each PR requires at least two reviews, so by reviewing 5 good first issue PRs you are repaying the effort that others did for you (provided 4 reviews for your 2 good first issues) plus 1 extra review to help us all make up the deficit for people who submit a PR but don't get this far.
- [ ] reviewed 1st `good first issue` pr
- [ ] reviewed 2nd `good first issue` pr
- [ ] reviewed 3rd `good first issue` pr
- [ ] reviewed 4th `good first issue` pr
- [ ] reviewed 5th `good first issue` pr
   - [ ] After each `good first issue` PR that your review, please paste the following text in a comment below
      ```
      ### 9 - PULL REQUEST REVIEWS - GFI - Update
      I have reviewed a `good first issue` PR #
      >Did you catch anything?

       - [ ] yes
       - [ ] no
      >If you did't catch anything, did anyone else who reviewed it after you, catch anything?

       - [ ] no
       - [ ] yes

           >if yes, describe what you learned:
   
          A: 
 
      [return to section 9](#section-9)
      ```
      <a name="section-9-ongoing-self-test"></a>      
      - [ ] Once all 5 good first PRs have been merged, check of the box for "good first issue" under "Reviewed other people's Pull Requests" on the [Ongoing Skills List](#Ongoing_Skills_List)
   - [ ] If there are no `good first issue` PRs to review right now, paste this comment instead and check back later.  You can also go onto section 10.
      ```
      ### 9 - PULL REQUEST REVIEWS - GFI - Update
      There are currently no `good first issue` PRs to review, but ill check back later.
      
      [return to section 9](#section-9)
      ```

[**⇧** Table of Contents](#table-of=contents)

<a name="section-10"></a>
#### 10 - UNDERSTAND HOW TO PROGRESS THROUGH ISSUES IN THE PRIORITIZED BACKLOG AND ON ISSUE MAKING AND TEMPERATURE CHECK
Congrats on making it this far.  Issues get more complicated from here, either they include more changes, or have several files to change or you have to research something that we are unsure how to do, or there is complicated logic that needs writing or rewriting. Each issue size that you take on will guide you to a more complicated level in sequence, and you can see from the labels and overviews what they are about.  

Its important that you try to work on issues that fill in gaps in your knowledge (see the self tests for a reminder about what to look for).  
- [INTAKE  Self Test](#Intake_Skills_List)
- [ONGOING Skills List](#Ongoing_Skills_List)

So keep going, the fun stuff is about to start.

Having said that, we are also going to have you take on some issue making (surprise! There is no issue making fairy, only volunteers like you that created issues for the people that come after them).  Pay attention to how the issues you have already worked on are constructed and how they change as they go up the ladder. That way when we start you on the issue making portion of the team work, you will know what you are shooting for when its your time to make issues.

Also, we want you on the Merge team.  This will ensure you are a competent developer and an awesome collaborative contributor to any team you join in the future.

- [ ] Let us know that you have re-reviewed your issues, have read the above and are continuing on the team
    ```
    ### 10 - UNDERSTAND HOW TO PROGRESS THROUGH ISSUES IN THE PRIORITIZED BACKLOG AND ON ISSUE MAKING update
    >Up to now we have just been getting you ready.  Now the fun starts.  Are you continuing?
    - [ ] I'm so ready, bring it on (continuing)
    - [ ] I am worn out from the setup and the good first issues but still game (continuing)
    - [ ] I won't be continuing, (please let us know why and close this issue)
    
    Comments:
    
    [return to section 10](#section-10)
    ```

[THIS WHOLE THING COULD BE MOVED TO A WIKI PAGE THAT EXPLAINS THE VALUE TO THEIR CAREER AND HAVE A TLDR HERE]

[**⇧** Table of Contents](#table-of=contents)

<a name="section-11"></a>
#### 11 - MOVING ON TO A SMALL ISSUE
- [ ] Assign yourself a small issue, for the role you have indicated, from this prefiltered view of the project board (status: prioritized backlog, small = [dev: small](https://github.com/orgs/hackforla/projects/86/views/3))
- [ ] Follow the instructions the bot adds as comments on the issue
- [ ] Submit your PR  
- [ ] Once your pull request has been merged post the following message in a comment below on this issue and then answer it:
    ```
    ### 11 - SMALL update
    >What is the number of your small merged pull request?
    - #
    >Did you receive any reviews that required you to change anything on your PR? 
    - [ ] no
    - [ ] yes (if yes, describe what you learned)

    Comments: 
    
    [return to section 11](#section-11)
    ```

[**⇧** Table of Contents](#table-of=contents)

<a name="section-12"></a>
#### 12 - PULL REQUEST REVIEWS - SMALL
Now that you have your small PR merged, you are eligible to review [small PRs, Review Required](https://github.com/hackforla/website/pulls?q=is%3Aopen+is%3Apr+label%3A%22Complexity%3A+Small%22+review%3Arequired) from other people who are following in the same journey path as you.

Please review 3 `small` PRs.  Each PR requires at least two reviews, so by reviewing 3 small PRs you are repaying the effort that others did for you (provided 2 reviews for your 1 small issue PR) plus 1 extra review to help us all make up the deficit for people who submit small PRs and then drop off the team.
- [ ] reviewed 1st `small` pr
- [ ] reviewed 2nd `small` pr
- [ ] reviewed 3rd `small` pr
   - [ ] When you have reviewed a `small` PR, please paste the following text in a comment below
      ```
      ### 12 - PULL REQUEST REVIEWS - Small - Update
      I have reviewed a `small` PR #
  
      >Did you catch anything?

       - [ ] yes
       - [ ] no
      >If you did't catch anything, did anyone else who reviewed it after you, catch anything?

       - [ ] no
       - [ ] yes
  
         >if yes, describe what you learned:
         
         A: 
         
      [return to section 12](#section-12)
      ```
      <a name="section-12-ongoing-self-test"></a>  
      - [ ] Once all 3 good first PRs have been merged, check off the box for "small" under "Reviewed other people's Pull Requests" on the [Ongoing Skills List](#Ongoing_Skills_List)
   - [ ] If there are no `small` PRs to review right now, paste this comment instead and check back later.  You can also go onto section 13.
      ```
      ### 12 - PULL REQUEST REVIEWS - Small - Update
      There are currently no `small` PRs to review, but i'll check back later.
      
      [return to section 12](#section-12)
      ```

[**⇧** Table of Contents](#table-of=contents)

<a name="section-13"></a>
#### 13 - GET EXPERIENCE MAKING ISSUES - LEVEL 1 (GFI & Small)
Creating issues from templates will give you experience on how issues
- are constructed
- are queued up for review
- are queued up for approval
- are prioritized (milestones)
- and appear in the prioritzed backlog

and like the good first and small issues you have already done, they are perscritive enough to do with no prior experience issue making.
- [ ] Take the first issue from this prefiltered view of the project board (status: ERs and epics that are ready to be turned into issues, good first & small = [IM: 1 + extra filters](https://github.com/orgs/hackforla/projects/86/views/8?filterQuery=status%3A%22ERs+and+epics+that+are+ready+to+be+turned+into+issues%22+label%3A%22Issue+Making%3A+Level+1%22+label%3A%22good+first+issue%22%2C%22complexity%3A+small%22))
- [ ] Assign yourself
- [ ] Move the issue to the in progress column
- [ ] Follow the instructions in the issue
- [ ] create the issue(s) it calls for.  These new issues will end up in the new issue approval column with the label `ready for merge team`
- Once the ER or Epic has been accepted by the Merge team and closed and the issue(s) you created have been moved into the prioritized backlog
   - [ ] Post the following message in a comment below on this issue and then answer it.  
       ```
       ### 13 - GET EXPERIENCE MAKING ISSUES - LEVEL 1 (GFI & Small) update
       >Which EPIC or ER did you work on (provide the issue number)

       #

       >How many hours did it take you to make the issue(s)?
    
       Number of hours: 
    
       >Did you find anything required clarification or anything we could improve about the instructions?
    
       Suggestions for improvement: 
       
       [return to section 13](#section-13)
       ```

[**⇧** Table of Contents](#table-of=contents)

<a name="section-14"></a>
#### 14 - MOVING ON TO A MEDIUM ISSUE
- [ ] Take the first issue from this prefiltered view of the project board (status: prioritized backlog, medium issues = [dev: medium](https://github.com/orgs/hackforla/projects/86/views/4))
   - [ ] If there are no medium size issues in the prioritized backlog column, skip the rest of this section and go to [Section 14.1](#section-14.1)
   - [ ] If there is medium size issue in the prioritized backlog column 
      - [ ] Assign yourself a medium for the role you have indicated (front/backend or both)
      - [ ] Follow the instructions the bot adds as comments on the issue
      - [ ] Submit your PR  
      - [ ] Once your pull request has been merged, post the following message in a comment below on this issue and then answer it
         ```
         ### 14 - MEDIUM update
         >What is the number of your medium merged pull request?
         - #
         >Did you receive any reviews that required you to change anything on your PR? 
          - [ ] no
          - [ ] yes (if yes, describe what you learned)

         Comments: 
         
         [return to section 14](#section-14)
         ```

[**⇧** Table of Contents](#table-of=contents)

<a name="section-14.1"></a>
#### 14.1 MAKE A MEDIUM ISSUE FROM AN ER OR EPIC
Only work on this section if you needed a medium issue and one is not available from the prioritized backlog
- [ ] add the label `needs issue: medium` to this issue, so that we can notify you when new medium size issues are released
- [ ] add the following comment to this issue
   ```
   There are no medium issues right now.  Please let me know if one becomes available.
         
   [return to section 14](#section-14.1)
   ```
- [ ] Take the first issue from this prefiltered view of the project board (status: ERs and epics that are ready to be turned into issues, medium = [IM: Level 1 + Complexity: Medium](https://github.com/orgs/hackforla/projects/86/views/8?filterQuery=status%3A%22ERs+and+epics+that+are+ready+to+be+turned+into+issues%22+label%3A%22Issue+Making%3A+Level+1%22+label%3A%22complexity%3A+medium%22)
   - If you find any results in the column
      - [ ] assign yourself to the first issue in that column
      - [ ] move the ER or EPIC to the in progress column
      - [ ] create the issue(s) it calls for.  These new issues will end up in the new issue approval column with the label `ready for merge team`
      - [ ] once you have made the issues and added the labels, move the issue making ER or Epic issue into the questions column
      - [ ] add a comment, letting the merge team know that you have made the issues (include a link to each of the new issues)
      - [ ] add the label `ready for merge team`
      - [ ] there will likely be some back and forth with the merge team, until your issue(s)s are approved and a `ready for prioritization` label is added.  When the new issue(s) are approved, the issue making issue will be closed and you are welcome to move onto the next checkbox
- [ ] Check this prefiltered view of the project board (status: prioritized backlog, medium issues = [dev: medium](https://github.com/orgs/hackforla/projects/86/views/4)
   - If there still is no medium issue to work in the Priortized Backlog column.
     - [ ] Leave the following message as a comment one of the Medium issues you just created and when the issue is prioritized we will assign the issue to you if there are no other medium issues you have picked up.
        ```
        - I created this issue, so I could have a medium issue to work on.  Please assign to me once approved.  My Skills Issue is #
        ``` 
        - once you get assigned, 
           - [ ] hide the comment below that says "There are no medium issues right now.  Please let me know if one becomes available." 
           - [ ] remove from this issue, the label `needs issue: medium`
           - [ ] circle back to [Section 14](#section-14) and check off the first 4 boxes, and continue from there.

[**⇧** Table of Contents](#table-of=contents)

<a name="section-15"></a>
#### 15 - PULL REQUEST REVIEWS - Medium
Now that you have your medium PR merged, you are eligible to review [medium PRs, Review Required](https://github.com/hackforla/website/pulls?q=is%3Aopen+is%3Apr+label%3A%22Complexity%3A+Medium%22+review%3Arequired) from other people who are following in the same journey path as you.

Please review 3 `medium` PRs.  Each PR requires at least two reviews, so by reviewing 3 medium PRs you are repaying the effort that others did for you (provided 2 reviews for your 1 medium issue PR) plus 1 extra review to help us all make up the deficit for people who submit medium PRs and then drop off the team.
- [ ] reviewed 1st `medium` pr
- [ ] reviewed 2nd `medium` pr
- [ ] reviewed 3rd `medium` pr
   - [ ] When you have reviewed a `medium` PR, please paste the following text in a comment below
      ```
      ### 15 - PULL REQUEST REVIEWS - Medium - Update
      I have reviewed a `medium` PR #
  
      >Did you catch anything?

       - [ ] yes
       - [ ] no
      >If you did't catch anything, did anyone else who reviewed it after you, catch anything?

       - [ ] no
       - [ ] yes
  
         >if yes, describe what you learned:
         
         A:
         
      [return to section 15](#section-15)
      ```
   - [ ] If there are no `medium` PRs to review right now, paste this comment instead and check back later.  You can also go onto section 16.
      ```
      ### 15 - PULL REQUEST REVIEWS - Medium - Update
      There are currently no `medium` PRs to review, but i'll check back later.
      
      [return to section 15](#section-15)
      ```

[**⇧** Table of Contents](#table-of=contents)

<a name="section-16"></a>
#### 16 - ISSUE MAKING - LEVEL 2, GFI
- [ ] Take the first issue from this prefiltered view of the project board (status: ERs and epics that are ready to be turned into issues, good first issue = [IM: Level 2 + good first issue](https://github.com/orgs/hackforla/projects/86/views/9?filterQuery=status%3A%22ERs+and+epics+that+are+ready+to+be+turned+into+issues%22+label%3A%22Issue+Making%3A+Level+2%22+label%3A%22good+first+issue%22)
   - If you find any results in the make issues column
      - [ ] assign yourself to the first issue in that column
      - [ ] move the ER or EPIC to the in progress column
      - [ ] create the issue(s) it calls for.  These new issues will end up in the new issue approval column with the label `ready for merge team`
      - [ ] once you have made the issues and added the labels, move the issue making ER or Epic issue into the questions column
      - [ ] add a comment, letting the merge team know that you have made the issues (include a link to each of the new issues)
      - [ ] add the label `ready for merge team`
      - [ ] there might be some back and forth with the merge team, until your issues are ready to be prioritized.  When it is, the issue making issue will be closed and you are welcome to move onto the next checkbox

[**⇧** Table of Contents](#table-of=contents)

<a name="section-17"></a>
#### 17 - MERGE TEAM SKILLS REVIEW
We want everyone who joins this team to get onto the merge team so that you can get experience running meetings and office hours, mentoring, creating sufficent workflow for the team, escalations, and ultimately being responsible for final approval and merging of pull requests made by team members on lower sections.  At this point we will check to see if you are ready to join the merge team, or what your next steps are to get you closer to ready.

- [ ] When you get to this point, please paste the following message into a comment below
```
I  have finished sections 1-16 and am ready to have my activity reviewed by the merge team

      [return to section 17](#section-17)
```
- [ ] Copy the link your comment into the #hfla-site Slack channel

[**⇧** Table of Contents](#table-of=contents)

<a name="section-faq"></a>
#### FAQ section

<details><summary>Are there exceptions to which size issues I work on?</summary>

   - Medium (<s>you can work on one medium issue, but only one at a time</s>one per person, with some exceptions, see below) 
   - Large (you can work on more than one large issue, but only one at a time)
- The reasons for this progression are:
      - The issues start out as being prescriptive and become less so as you gain more experience by working through increasingly complex issues.
      - We are trying to teach you the team methodology through the issues themselves.
      - It ensures you understand what we expect and the quality of contributions.
    - You can work on back-to-back small issues if it meets the following criteria:
      - You are learning something new and need to work on an issue of a lesser complexity
      - Since we have a limited number of these, you must get approval from lead or pm
    - You can work on a second medium issue if it meets the following criteria:
      - You are learning something new and need to work on an issue of a lesser complexity
      - Since we have a limited number of these, you must get approval from lead or pm
</details> 

<details><summary>What should I do if I have a question about an issue I'm working on, and I haven't gotten a response yet?</summary>

- First, you should post the question or blocker as a comment on your assigned issue, so it can be easily referred to in the next bullet points.
- Then, add the label `Status: Help Wanted` so other developers can see it and potentially help answer your question. In addition, you will still need to post a Slack message or bring it up in meeting so we know you need help; see below for how to do that.
- Also, you can post your question on the hfla-site Slack channel and link the issue you're working on, so other developers can see and respond.
- Lastly, you can add the issue to the <s>"Development team meeting discussion items"</s> "Questions/In Review" column of the Project Board so that it can be addressed in the next development meeting. Please bring it during the meeting that you need help.
</details> 

<details><summary>If you need to take some time off from the team</summary>

- For this Skills Issue, please do the following:
   - Copy and customize this response, and leave it in a comment on this issue
      ```
      I need to take some time off from the team.  I believe I will be back on [Replace with DATE YOU WILL BE BACK]
       ```
   - Apply the label `away on hold`.
   - Move your Skills Issue to the `Questions / In Review` column.
- In the [roster](https://docs.google.com/spreadsheets/d/11u71eT-rZTKvVP8Yj_1rKxf2V45GCaFz4AXA7tS_asM/edit?gid=0#gid=0), find the line with your information on it and fill in your info for the following columns:
   - Find Column N / "Hiatus". Put `TRUE` in that column.
   - Find column O / "If on Hiatus, return date (YY-MM-DD)". Fill in your expected return date in YY-MM-DD format. 
- In addition, if you are assigned to an open issue (other than your Skills Issue), do the following for that issue:
   - If you have done some work on the issue, please write thorough documentation in a comment in that issue so that the issue can be handed off to another person, who can pick up working where you left off based on your notes.
   - Apply a `ready for prioritization` label.
   - Move it to the 'New Issue Approval` column.
   - Then, unassign yourself from that issue.
</details> 

[**⇧** Table of Contents](#table-of=contents)

### Resources/Instructions
- [Contributing.md - Hack for LA](https://github.com/hackforla/website/blob/gh-pages/CONTRIBUTING.md)
- [GitHub Project Board - Hack for LA](https://github.com/orgs/hackforla/projects/86)
- [Figma - Hack for LA](https://www.figma.com/file/0RRPy1Ph7HafI3qOITg0Mr/Hack-for-LA-Website)
- [Google Drive - Hack for LA website team](https://drive.google.com/drive/folders/1p76K0FgfiAWeIIEyoyJ_Iik8FVj8cBjT?usp=sharing)
- [Agenda / Notes - Dev Team Tuesday meeting](https://github.com/hackforla/website/issues/2010)
- [Agenda / Notes - All Team meeting](https://github.com/hackforla/website/issues/2027)
- [How to review Pull Requests](https://github.com/hackforla/website/wiki/How-to-review-pull-requests)
- To find contact information for the merge team members and technical leads, please take a look at our [Meet the Team wiki page](https://github.com/hackforla/website/wiki/Meet-the-Team)

[**⇧** Table of Contents](#table-of=contents)

---
<a name="Intake_Skills_List"></a>

### Skills List - INTAKE
Skills List, self test on Intake, fill out when you join the team, don't update

   Front End
   - [ ] Setting up your local environment from a contributing file
   - [ ] GitHub branching
   - [ ] Pull Requests

   Back End
   - [ ] API requests
   - [ ] Cron Job Scripting
   - [ ] CRUD operations

   All Developers
   - [ ] Reviewed other people's Pull Requests
   - [ ] Resolved Merge Conflicts
   - [ ] Written documentation for other Developers (Architecture, etc.)
   - [ ] Mentored other developers

Return to 
[section 1](#section-1-intake-self-test)
[section 10](#section-10)


<a name="Ongoing_Skills_List"></a>

### Skills List - ONGOING
Skills List, update as you do work on this team

   Front End
   - [ ] Setting up your local environment from a contributing file ([section 3](#section-3-ongoing-self-test))
   - [ ] GitHub branching (done in section 8)
   - [ ] Pull Requests ([section 8](#section-8-ongoing-self-test))

   Back End
   - [ ] API requests
   - Cron Job Scripting
      - [ ] edit GitHub Action
      - [ ] write GitHub Action
   - [ ] CRUD operations

   All Developers
   - Reviewed other people's Pull Requests
      - [ ] good first issue ([section 9](#section-9-ongoing-self-test))
      - [ ] smal ([section 12](#section-12-ongoing-self-test))
      - [ ] medium
      - [ ] large
      - [ ] x-large
   - [ ] Resolved Merge Conflicts
   - [ ] Written documentation for other Developers (Architecture, etc.)
   - [ ] Mentored other developers


[**⇧** Table of Contents](#table-of=contents)
