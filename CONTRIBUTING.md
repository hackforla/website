# **How to Contribute to Hack for LA**

👍🥳 First off, thanks for taking the time to contribute! 🥳👍

The following is a set of guidelines for contributing to the website repository, which is hosted on GitHub. These are mostly guidelines, not rules. Use your best judgment, and feel free to propose changes to this document in the form of a pull request.

**The guide below assumes that you have completed the onboarding process which includes joining the Hack for LA Slack, GitHub, and Google Drive. If you have not been onboarded, please refer to the [Getting Started Page](https://www.hackforla.org/getting-started).**

**If you need a text editor to work on code, [VS Code](https://code.visualstudio.com/download) is recommended by the team, but feel free to use a text editor of your choice.**

**If you have any other questions about your contributing process, feel free to reach out to the team in the [#hfla-site](https://hackforla.slack.com/archives/C4UM52W93) slack channel.**
<br><br>

## **Table of Contents**
- [**How to Contribute to Hack for LA**](#how-to-contribute-to-hack-for-la)
  - [**Table of Contents**](#table-of-contents)
  - [**Part 1: Setting up the development environment**](#part-1-setting-up-the-development-environment)
    - [**1.1 Dev setup (1): Join the repository team**](#11-dev-setup-1-join-the-repository-team)
    - [**1.2 Dev setup (2): Installing Git**](#12-dev-setup-2-installing-git)
    - [**1.3 Dev setup (3): Fork the repository**](#13-dev-setup-3-fork-the-repository)
    - [**1.4 Dev setup (4): Clone (Create) a copy on your computer**](#14-dev-setup-4-clone-create-a-copy-on-your-computer)
      - [**1.4.a Clone repo (1): Create  `hackforla` folder**](#14a-clone-repo-1-create--hackforla-folder)
      - [**1.4.b Clone repo (2): Verify `origin` remote url**](#14b-clone-repo-2-verify-origin-remote-url)
      - [**1.4.c What if you accidentally cloned using the repository URL from the HackForLA Github (instead of the fork on your Github)?**](#14c-what-if-you-accidentally-cloned-using-the-repository-url-from-the-hackforla-github-instead-of-the-fork-on-your-github)
        - [**i. Resolve remote (1): reset `origin` remote url**](#i-resolve-remote-1-reset-origin-remote-url)
        - [**ii. Resolve remote (2): Add an `upstream` remote**](#ii-resolve-remote-2-add-an-upstream-remote)
    - [**1.5 Dev setup (5): Set up Docker**](#15-dev-setup-5-set-up-docker)
      - [**1.5.a Docker installation troubleshooting**](#15a-docker-installation-troubleshooting)
    - [**1.6 Dev setup (6): Build and serve the website locally**](#16-dev-setup-6-build-and-serve-the-website-locally)
      - [**1.6.a Starting Docker**](#16a-starting-docker)
      - [**1.6.b Stopping Docker**](#16b-stopping-docker)
  - [**Part 2: How the Website team works with GitHub issues**](#part-2-how-the-website-team-works-with-github-issues)
    - [**2.1 Hack for LA Contributor expectations**](#21-hack-for-la-contributor-expectations)
    - [**2.2 How Hack for LA organizes issues**](#22-how-hack-for-la-organizes-issues)
    - [**2.3 Where can I find GitHub issues to work on?**](#23-where-can-i-find-github-issues-to-work-on)
      - [**2.3.a Available issues for new members (front end/back end)**](#23a-available-issues-for-new-members-front-endback-end)
      - [**2.3.b Available issues for returning members (front end)**](#23b-available-issues-for-returning-members-front-end)
      - [**2.3.c Available issues for returning members (back end)**](#23c-available-issues-for-returning-members-back-end)
      - [**2.3.d Issues for Hacktoberfest contributors (Front-End/Back-End)**](#23d-issues-for-hacktoberfest-contributors-front-endback-end)
       - [**2.3.e What if you see bugs/errors that are not connected to an issue?**](#23e-what-if-you-see-bugserrors-that-are-not-connected-to-an-issue)
    - [**2.4 Claiming an Issue**](#24-claiming-an-issue)
      - [**2.4.a Assign & Unassign yourself to this issue**](#24a-assign--unassign-yourself-to-this-issue)
        - [**i. If you want to to self assign an issue:**](#i-if-you-want-to-to-self-assign-an-issue)
        - [**ii. If you want to to remove yourself an issue:**](#ii-if-you-want-to-to-remove-yourself-an-issue)
      - [**2.4.b Move this issue from the ‘Prioritized Backlog’ to the ‘In progress’ & back**](#24b-move-this-issue-from-the-prioritized-backlog-to-the-in-progress--back)
        - [**i. After you claim an issue:**](#i-after-you-claim-an-issue)
        - [**ii. After you unassign yourself from an issue:**](#ii-after-you-unassign-yourself-from-an-issue)
    - [**2.5 Reporting progress on your issue**](#25-reporting-progress-on-your-issue)
    - [**2.6 What to do when you need to stop mid issue**](#26-what-to-do-when-you-need-to-stop-mid-issue)
      - [**2.6.a Reasons for having to stop:**](#26a-reasons-for-having-to-stop)
      - [**2.6.b What to do if you have to stop working mid issue:**](#26b-what-to-do-if-you-have-to-stop-working-mid-issue)
    - [**2.7 Working on an issue**](#27-working-on-an-issue)
      - [**2.7.a Working on an issue (1): Verify current branch is `gh-pages`**](#27a-working-on-an-issue-1-verify-current-branch-is-gh-pages)
      - [**2.7.b Working on an issue (2): Create a new branch where you will work on your issue**](#27b-working-on-an-issue-2-create-a-new-branch-where-you-will-work-on-your-issue)
        - [**i. What if you cannot see your changes locally within Docker?**](#i-what-if-you-cannot-see-your-changes-locally-within-docker)
      - [**2.7.c Working on an issue(3): Prepare your changes to push to your repository**](#27c-working-on-an-issue3-prepare-your-changes-to-push-to-your-repository)
        - [**i. Prepare repo changes (1): Use the `git add` command to stage your changes.**](#i-prepare-repo-changes-1-use-the-git-add-command-to-stage-your-changes)
        - [**ii. Prepare repos changes (2): Use the `git status` command to see what files are staged.**](#ii-prepare-repos-changes-2-use-the-git-status-command-to-see-what-files-are-staged)
        - [**iii. Prepare repos changes (3): Use the `git reset HEAD` command to remove a staged file.**](#iii-prepare-repos-changes-3-use-the-git-reset-head-command-to-remove-a-staged-file)
        - [**iv. Prepare repos changes (4): Use the `git commit` command**](#iv-prepare-repos-changes-4-use-the-git-commit-command)
      - [**2.7.d Working on an issue (4): Check upstream before you push**](#27d-working-on-an-issue-4-check-upstream-before-you-push)
        - [**i. If there are no changes in the upstream repository**](#i-if-there-are-no-changes-in-the-upstream-repository)
        - [**ii. If there are conflicting changes in the upstream repository**](#ii-if-there-are-conflicting-changes-in-the-upstream-repository)
      - [**2.7.e Working on an issue (5): Incorporating changes from upstream**](#27e-working-on-an-issue-5-incorporating-changes-from-upstream)
        - [**i. Incorporating changes into your topic branch**](#i-incorporating-changes-into-your-topic-branch)
  - [**Part 3: Pull Requests**](#part-3-pull-requests)
    - [**3.1 How to make a pull request**](#31-how-to-make-a-pull-request)
      - [**3.1.a Push all changes to your issue branch**](#31a-push-all-changes-to-your-issue-branch)
      - [**3.1.b Complete pull request on Hack for LA `website` repo**](#31b-complete-pull-request-on-hack-for-la-website-repo)
        - [**i. Complete pull request (1): Update pull request title**](#i-complete-pull-request-1-update-pull-request-title)
        - [**ii. Complete pull request (2): Add issue number to the pull request**](#ii-complete-pull-request-2-add-issue-number-to-the-pull-request)
        - [**iii. Complete pull request (3): What changes did you make**](#iii-complete-pull-request-3-what-changes-did-you-make)
        - [**iv. Complete pull request (4): Include images (if available)**](#iv-complete-pull-request-4-include-images-if-available)
        - [**v. Complete pull request (5): How to add a pull request to the project board**](#v-complete-pull-request-5-How-to-add-a-pull-request-to-the-project-board)
        - [**vi. After pull request is submitted/merged**](#vi-after-pull-request-is-submittedmerged)
      - [**3.1.c Editing a submitted pull request**](#31c-editing-a-submitted-pull-request)
  - [**Part 4: Resources and Documentation**](#part-4-resources-and-documentation)
    - [**4.1 What do I do if I need help?**](#41-what-do-i-do-if-i-need-help)
    - [**4.2 Resources and Documentation**](#42-resources-and-documentation)
      - [**4.2.a Hack For LA resources**](#42a-hack-for-la-resources)
      - [**4.2.b Tools Documentation**](#42b-tools-documentation)

## **Part 1: Setting up the development environment**
### **1.1 Dev setup (1): Join the repository team**

In the `hfla-site` Slack channel, send an introductory message with your GitHub handle/username asking to be added to the Hack for LA website GitHub repository (this repository).

**NOTE:** Once you have accepted the GitHub invite (comes via email or in your GitHub notifications), **please do the following**:

1. Make your own Hack for LA GitHub organization membership public by following this [guide](https://help.github.com/en/articles/publicizing-or-hiding-organization-membership#changing-the-visibility-of-your-organization-membership).
2. Set up two-factor authentication on your account by following this [guide](https://docs.github.com/en/github/authenticating-to-github/configuring-two-factor-authentication).

<sub>[Back to Table of Contents](#table-of-contents)</sub>
***

### **1.2 Dev setup (2): Installing Git**

Before cloning your forked repository to your local machine, you must have Git installed. You can find instructions for installing Git for your operating system [**here**](https://git-scm.com/book/en/v2/Getting-Started-Installing-Git). Please note that if you have a Mac the page offers several options (see other option, if you need to conserve hard drive space) including:

- an “easiest” option (this version is fine for use at hackforla): This option would take just over 4GB.
- a “more up to date” option (not required but optional if you want it): This option prompts you to go to install an 8GB package manager called Homebrew. 
- Other option: If your computer is low on space, you can use this [tutorial](https://www.datacamp.com/community/tutorials/homebrew-install-use) to install XCode Command Tools and a lighter version of Homebrew and then install Git using this command: ```$ brew install git```  which in total only uses 300MB.

<sub>[Back to Table of Contents](#table-of-contents)</sub>
***

### **1.3 Dev setup (3): Fork the repository**

You can fork the hackforla/website repository by clicking <a href="https://github.com/hackforla/website/fork"> <button> <img src="https://user-images.githubusercontent.com/17777237/54873012-40fa5b00-4dd6-11e9-98e0-cc436426c720.png" width="8px"> Fork</button></a>
. A fork is a copy of the repository that will be placed on your GitHub account.

<details>
  <summary><strong>Click here</strong> to see a visual example of the `fork` button within the website repo</summary>
  <p><strong>First, you find the `fork` button on the top right hand side of the [Hack for LA website repo](https://github.com/hackforla/website)</strong></h4>
  <img src="https://user-images.githubusercontent.com/21162229/137044762-c80f18e8-b785-48fb-a286-81c1117c0178.jpg" />
  <p><strong>Next, a modal may open and request where you want to fork this website repo. Please click on your avatar or your GitHub username</strong></p>
  <img src="https://user-images.githubusercontent.com/21162229/137045294-3d46b28c-edbb-410c-98f1-13940ecc5c5f.jpg" />
</details><br>

**Note:** It should create a URL that looks like the following -> `https://github.com/<your_GitHub_user_name>/website`.

**For example** -> `https://github.com/octocat/website`.

**Be Aware:** What you have created is a forked copy in a remote version on GitHub. It is not yet on your local machine yet.

<sub>[Back to Table of Contents](#table-of-contents)</sub>
***

### **1.4 Dev setup (4): Clone (Create) a copy on your computer**

Before creating a copy to your local machine, you must have Git installed. You can find instructions for installing Git for your operating system [**here**](https://git-scm.com/book/en/v2/Getting-Started-Installing-Git). 

The following steps will clone (create) a local copy of the forked repository on your computer.

#### **1.4.a Clone repo (1): Create  `hackforla` folder**

Create a new folder in your computer that will contain `hackforla` projects.

In your command line interface (Terminal, Git Bash, Powershell), move to where you want your new folder to be placed and create a new folder in your computer that will contain `hackforla` projects. After that, navigate into the folder(directory) you just created.
      
For example: 
```bash
mkdir hackforla
cd hackforla
```
      
and run the following commands:
      
```bash
git clone https://github.com/<your_GitHub_user_name>/website.git
```
      
For example if your GitHub username was `octocat`:
```bash
git clone https://github.com/octocat/website.git
```

You should now have a new folder in your `hackforla` folder called `website`. Verify this by changing into the new directory:

```bash
cd website
```

#### **1.4.b Clone repo (2): Verify `origin` remote url**

Verify that your local cloned repository is pointing to the correct `origin` URL (that is, the forked repo on your own Github account):
```bash
git remote -v
```
You should see `fetch` and `push` URLs with links to your forked repository under your account (i.e. `https://github.com/<your_GitHub_user_name>/website.git`). You are all set to make working changes to the website on your local machine.

However, we still need a way to keep our local repo up to date with the deployed website. To do so, you must add an upstream remote to incorporate changes made while you are working on your local repo. Run the following to add an upstream remote URL & update your local repo with recent changes to the `hackforla` version:

```bash
git remote add upstream https://github.com/hackforla/website.git
git fetch upstream
```

After adding the upstream remote, you should now see it if you again run `git remote -v` :
```bash
origin  https://github.com/<your_GitHub_user_name>/website.git (fetch)
origin  https://github.com/<your_GitHub_user_name>/website.git (push)
upstream        https://github.com/hackforla/website.git (fetch)
upstream        https://github.com/hackforla/website.git (push)
```
#### **1.4.c What if you accidentally cloned using the repository URL from the HackForLA Github (instead of the fork on your Github)?**

##### **i. Resolve remote (1): reset `origin` remote url**

Set your forked repo on your Github as an `origin` remote:
```bash
git remote set-url origin https://github.com/<your_GitHub_user_name>/website.git
```

For example if your GitHub username was `octocat`:
```bash
git remote set-url origin https://github.com/octocat/website.git
```

##### **ii. Resolve remote (2): Add an `upstream` remote**

Add another remote called `upstream` that points to the `hackforla` version of the repository. This will allow you to incorporate changes later:
```bash
git remote add upstream https://github.com/hackforla/website.git
```

<sub>[Back to Table of Contents](#table-of-contents)</sub>
***

### **1.5 Dev setup (5): Set up Docker**

Docker is the recommended approach to quickly getting started with local development. Docker helps create a local/offline version of the hackforla.org website on your computer so you can test out your code before submitting a pull request.

The recommended installation method for your operating system can be found [here](https://docs.docker.com/install/). <strong><em>Feel free to reach out in the [Hack for LA Slack channel](https://hackforla.slack.com/messages/hfla-site/) if you have trouble installing docker on your system</em></strong>

More on using Docker and the concepts of containerization:

* [Get started with Docker](https://docs.docker.com/get-started/)

#### **1.5.a Docker installation troubleshooting**

If you are on Windows and get 'You are not allowed to use Docker, you must be in the "docker-users" group' as an error message, the following wiki page is a guide for solving te issue:
- [Windows docker-users group error guide](https://github.com/hackforla/website/wiki/Adding-local-user-accounts-to-the-docker-users-group-on-Windows-10)

Installing WSL2 on windows
- https://docs.microsoft.com/en-us/windows/wsl/install-win10

<sub>[Back to Table of Contents](#table-of-contents)</sub>
***

### **1.6 Dev setup (6): Build and serve the website locally**

#### **1.6.a Starting Docker**

**IMPORTANT:** Please make sure the `Docker Desktop` application is **running on your computer** before you run the bash commands below.

- This command starts a jekyll server locally. The server watches for changes to
the source files and rebuilds and refreshes the site automatically in your browser.

Navigate to within the `website` directory that you cloned earlier in your terminal then run the below command

```bash
 docker-compose up
```

Running the above command will result in the following output in your terminal

<details>
  <summary><strong>Click here</strong> to see an example terminal output</summary>

  ```bash
  Starting hfla_site ... done
  Attaching to hfla_site
  hfla_site    | ruby 2.7.1p83 (2020-03-31 revision a0c7c23c9c) [x86_64-linux-musl]
  hfla_site    | Configuration file: _config.yml       
  hfla_site    | Configuration file: _config.docker.yml
  hfla_site    |             Source: .
  hfla_site    |        Destination: /srv/jekyll/_site
  hfla_site    |  Incremental build: enabled
  hfla_site    |       Generating...
  hfla_site    |                     done in 33.641 seconds.
  hfla_site    |                     Auto-regeneration may not work on some Windows versions.
  hfla_site    |                     Please see: https://github.com/Microsoft/BashOnWindows/issues/216
  hfla_site    |                     If it does not work, please upgrade Bash on Windows or run Jekyll with --no-watch.
  hfla_site    |  Auto-regeneration: enabled for '.'
  hfla_site    | LiveReload address: http://0.0.0.0:35729
  hfla_site    |     Server address: http://0.0.0.0:4000/
  hfla_site    |   Server running... press ctrl-c to stop.
  ```

</details>

When you see the above output, it means the site is now running and now you can browse to http://localhost:4000

**NOTE:** If it takes longer than 2 minutes to build your website using `docker-compose up`, please let the [technical leads](https://github.com/hackforla/website/wiki/Meet-the-Team) know about this and add your website build time in a comment to [issue #1443](https://github.com/hackforla/website/issues/1443). Also, once you are part of the merge team, you can work on [issue #1443](https://github.com/hackforla/website/issues/1443) and fix it (if you want).

#### **1.6.b Stopping Docker**

 - To stop and completely remove the jekyll server (i.e. the running Docker container):

*(do this anytime Docker or jekyll configuration or other repository settings change)*

```bash
docker-compose down
```

To stop the server, but not destroy it (often sufficient for day-to-day work):

```bash
docker-compose stop
```

Bring the same server back up later with:

```bash
docker-compose up
```

<sub>[Back to Table of Contents](#table-of-contents)</sub>

***

## **Part 2: How the Website team works with GitHub issues**

### **2.1 Hack for LA Contributor expectations**

In order to join [another project within Hack for LA](https://www.hackforla.org/projects/) or work on a `Size: Small`/`Size: Medium`/`Size: Large` label issue within this repo, you need to complete the following:

1. `good first issue`
   * Self-assign an issue with the `good first issue` label. 
   * Complete steps in [**2.7 Working on an issue**](#27-working-on-an-issue) to create a solution for the issue
   * Complete steps in [**3.1 How to make a pull request**](#31-how-to-make-a-pull-request) to get your solution reviewed by the `website-merge` team.
   * Once your pull request is merged, you can work on your next issue.
2. `size: Good second issue`
  *  Self-assign an issue with the `Size: Good second issue` label. 
  * Complete steps in [**2.7 Working on an issue**](#27-working-on-an-issue) to create a solution for the issue
  * Complete steps in [**3.1 How to make a pull request**](#31-how-to-make-a-pull-request) to get your solution reviewed by the `website-merge` team
  * Once your pull request is merged, you can work on your next issue.

Progress through issues with increasing complexity in the following order:
  1. Good first issue
  2. Good second issue
  3. Small 
  4. Medium 
  5. Large

The reasons for this progression are:
  * The issues start out as being prescriptive and become less so as you gain more experience by working through increasingly complex issues.
  * We are trying to teach you the team methodology through the issues themselves.
  * It ensures you understand what we expect and the quality of contributions.
  
All website team members are required to attend at least 1 team meeting in a week (held on Tuesdays, Thursdays and Sundays). In case, you are unable in any given week, you should reach out to the tech leadership team. Exceptions to this requirement may be provided on a case-by-case basis.

All website team members are expected to devote a minimum of 6 hours per week while working on various assignments during their entire tenure at the website team (excluding week offs and vacations).

Also, please let the tech leadership team know (through a slack message in the hfla-site channel as well as an @ mention in a comment of the issue that you would be working on) if you are planning to take a week off or a longer vacation.

<sub>[Back to Table of Contents](#table-of-contents)</sub>
***

### **2.2 How Hack for LA organizes issues**

We currently have issues with the following **role** labels:

* `role: front end` 
* `role: backend/devOps`

And the following **size** labels:

* `good first issue` 
* `size: good second issue`
* `size: Small`
* `size: Medium`
* `size: Large`

**Note:** The Prioritized Backlog column is filtered so the first (top) issue has the highest priority and should be worked on next. <br />

**Note:** if you would like to learn more about our label system you can read this [wiki on how to read and interpret our repo labels](https://github.com/hackforla/website/wiki/How-to-read-and-interpret-labels)

<sub>[Back to Table of Contents](#table-of-contents)</sub>
***

### **2.3 Where can I find GitHub issues to work on?**

The best way to view the issues available is our [GitHub Project Board](https://github.com/hackforla/website/projects/7)

<details>
  <summary><strong>Click here</strong> to see a Project Board visual</summary>
  <h4>Our GitHub project board</h4>
  <img src="https://user-images.githubusercontent.com/21162229/137258967-93d1820e-7756-441a-9352-1e8a15a00e12.jpg"/>
</details>

There are only 2 columns that you will be consistently referencing:

1. `Onboarding infos/links` - Some helpful card information examples:
  * [Website team meeting times/links card](https://github.com/hackforla/website/projects/7#card-47984166)
  * [Website team leadership contact information card](https://github.com/hackforla/website/projects/7#card-69730135)
  * Filters to show the project issues by a specific size:
    * [`role: front end` size filters card](https://github.com/hackforla/website/projects/7#card-63001626)
    * [`role: back end` size filters card](https://github.com/hackforla/website/projects/7#card-65620159)
  * [Figma links (ui/ux design team) card](https://github.com/hackforla/website/projects/7#card-38820969)
  
2. `Prioritized Backlog` - This column contains all the available issues that can be worked on
**Note:** The column is filtered so the first (top) issue has the highest priority and should be worked on next.

#### **2.3.a Available issues for new members (front end/back end)**

We recommend you visit the `Prioritized Backlog` column in the filtered Project Board using the following links: [`good first issues` (front end)](https://github.com/hackforla/website/projects/7?card_filter_query=label%3A%22role%3A+front+end%22+label%3A%22good+first+issue%22#column-7198257) and [`good first issues` (back end)](https://github.com/hackforla/website/projects/7?card_filter_query=label%3A%22good+first+issue%22+label%3A%22role%3A+back+end%2Fdevops%22#column-7198257). These links will take you to a filtered Project Board and will only show issues with the `good first issue` label for both front end and back end respectively.

**Note:** The column is filtered so the first (top) issue has the highest priority and should be worked on next.

#### **2.3.b Available issues for returning members (front end)**

* `Prioritized Backlog` column in the [filtered Project Board - **size: Good second issues** label](https://github.com/hackforla/website/projects/7?card_filter_query=label%3A%22role%3A+front+end%22+label%3A%22size%3A+good+second+issue%22)
* `Prioritized Backlog` column in the [filtered Project Board - **size: Small** label](https://github.com/hackforla/website/projects/7?card_filter_query=label%3A%22size%3A+small%22+label%3A%22role%3A+front+end%22)
* `Prioritized Backlog` column in the [filtered Project Board - **size: Medium** label](https://github.com/hackforla/website/projects/7?card_filter_query=label%3A%22role%3A+front+end%22+label%3A%22size%3A+medium%22)
* `Prioritized Backlog` column in the [filtered Project Board - **size: Large** label](https://github.com/hackforla/website/projects/7?card_filter_query=label%3A%22role%3A+front+end%22+label%3A%22size%3A+large%22)

#### **2.3.c Available issues for returning members (back end)**

* `Prioritized Backlog` column in the [filtered Project Board - **size: Good second issues** label](https://github.com/hackforla/website/projects/7?card_filter_query=label%3A%22size%3A+good+second+issue%22+label%3A%22role%3A+back+end%2Fdevops%22)
* `Prioritized Backlog` column in the [filtered Project Board - **size: Small** label](https://github.com/hackforla/website/projects/7?card_filter_query=label%3A%22role%3A+back+end%2Fdevops%22+label%3A%22size%3A+small%22)
* `Prioritized Backlog` column in the [filtered Project Board - **size: Medium** label](https://github.com/hackforla/website/projects/7?card_filter_query=label%3A%22role%3A+back+end%22+label%3A%22size%3A+medium%22)
* `Prioritized Backlog` column in the [filtered Project Board - **size: Large** label](https://github.com/hackforla/website/projects/7?card_filter_query=label%3A%22role%3A+back+end%2Fdevops%22+label%3A%22size%3A+large%22)

#### **2.3.d Issues for Hacktoberfest contributors (Front-End/Back-End)**

Please use the `Prioritized Backlog` column in the [filtered Project Board - **Hacktoberfest** label](https://github.com/hackforla/website/projects/7?card_filter_query=label%3A%22role%3A+front+end%22+label%3Ahacktoberfest)

**Note:** You can only submit a pull request for one (1) issue with the `Hacktoberfest` label. Also leave a comment within the issue you would like to work on.
**Note:** If you would like to continue to contribute please join our team. You can find more information on our [Hack for LA Getting Started Page](https://www.hackforla.org/getting-started).

#### **2.3.e What if you see bugs/errors that are not connected to an issue?**

If you see any bugs/errors within the site and there is not an issue for it, please reach out to any of the [Website leadership/merge team](https://github.com/hackforla/website/projects/7#card-69730135) and they will help you create an issue you can resolve.

<sub>[Back to Table of Contents](#table-of-contents)</sub>
***

### **2.4 Claiming an Issue**

Once you find an issue you want to work on, you need to self-assign to claim it and then move the issue from the `Prioritized Backlog` to the `In progress`. Both of these tasks can be accomplished within the issue. Please see the examples below. (Note: Any issue that you are working on besides the pre-work issue should remain in the `In progress` column and stay open. Once a member of the merge team or a tech lead merges your pull request associated with that issue, there is automation through GitHub Actions that will take care of moving the issue to a different column and closing the issue.)

#### **2.4.a Assign & Unassign yourself to this issue**
<details>
  <summary><strong>Click here</strong> to see how you assign & unassign yourself to an issue</summary>
  <p><strong>Assign/Unassign demo</strong></p>
  <img src="https://user-images.githubusercontent.com/21162229/137636320-e96ef70d-3c85-405e-90d2-ee7b3bba071f.gif" />
</details>

##### **i. If you want to to self assign an issue:**
* Go to the issue you want to work on
* Go to the right hand menu under `Assignees`
   *  Click the `assign yourself` link

##### **ii. If you want to to remove yourself an issue:**
* Go to the issue you are assigned to
* Go to the right hand menu and click on the gear wheel (:gear:) to the right of `Assignees`
  * Click on the `X clear assignees` link
####  **2.4.b Move this issue from the ‘Prioritized Backlog’ to the ‘In progress’ & back**
<details>
  <summary><strong>Click here</strong> to see how to move an issue from the ‘Prioritized Backlog’ to the ‘In progress (actively working)’ & back</summary>
  <p><strong>Project Board column demo</strong></p>
  <img src="https://user-images.githubusercontent.com/21162229/137693338-97fe5f6c-820d-41c9-8e93-57b70827e0cf.gif" />
</details>

##### **i. After you claim an issue:**
* Click on the dropdown menu within the `Projects` section of the right-hand menu (value will show `Prioritized Backlog` if unclaimed)
  * Select `In progress (actively working)`

##### **ii. After you unassign yourself from an issue:**
* Click on the dropdown menu within the `Projects` section of the right-hand menu (value will show `In progress (actively working)` if unclaimed)
  * Select `Prioritized Backlog`

<sub>[Back to Table of Contents](#table-of-contents)</sub>
***

### **2.5 Reporting progress on your issue**
- Be sure to check the box when you finish an action item.
- Report your progress weekly in a comment below using the following format:
    1. `Progress`: "What is the current status of your project? What have you completed and what is left to do?"
    2. `Blockers`: "Difficulties or errors encountered."
    3. `Availability`: "How much time will you have this week to work on this issue?"
    4. `ETA`: "When do you expect this issue to be completed?"
    5. `Pictures` (**optional**): "Add any pictures of the visual changes made to the site so far."

**Note:** We currently have a GitHub action action that requests an update via a comment after 7 days of inactivity within an issue. Please be sure to provide weekly updates on progress and/or blockers so we can help you resolve them.

**Note:** If you would like to know more about how we provide updates within the website team, please read this [wiki on how to communicate with our website team](https://github.com/hackforla/website/wiki/How-to-communicate-with-the-team)

<sub>[Back to Table of Contents](#table-of-contents)</sub>
***

### **2.6 What to do when you need to stop mid issue**
#### **2.6.a Reasons for having to stop:**
- Got personally busy, can’t finish
- Only want to do a specific type of front end or back end task
- There is a blocker in the way of finishing and you would like the opportunity to work on other issues
#### **2.6.b What to do if you have to stop working mid issue:**
- For your issue, uncheck the checkboxes for any action items that have to be redone by the next developer picking up the issue.
- Add a note in the comments with details and progress for the next developer
- Move this issue from the ‘In progress’ to the ‘Prioritized Backlog’(see - [project board column example above](#ii-after-you-unassign-yourself-from-an-issue)) 
- Unassign yourself from this issue (see the [unassign example above](#24a-assign--unassign-yourself-to-this-issue)) 

<sub>[Back to Table of Contents](#table-of-contents)</sub>
***

### **2.7 Working on an issue**

- If you are using Visual studios code you can use the Git graphical user interface to stage your changes. For instructions check out the [Git gui wiki](https://github.com/hackforla/website/wiki/How-to-Use-Git-GUI-(Graphical-user-Interface)-in-Visual-Studios-Code)

**Note:** Alternatively you can follow the instructions below to stage changes through the terminal. We will be using [Update ‘Give’ image credit link and information - #2093](https://github.com/hackforla/website/issues/2093) as an example issue we will be following.

Create a new branch for each issue you work on. Doing all your work on topic branches leaves your repository's main branch (named `gh-pages`) unmodified and greatly simplifies keeping your fork in sync with the main project.

#### **2.7.a Working on an issue (1): Verify current branch is `gh-pages`**

The `git branch` command will let you know what branch you are in, and what branch names are already in use.

```bash
git branch
```

You will see a list of all of your branches. There will be a star (`*`) next to the branch that you are currently in. By default you should start on the `gh-pages` branch.

**Note:** When you work on future issues, you must always be in the `gh-pages` branch when creating a new branch.

If you are not currently in the `gh-pages` branch, run the following command to return to it:

```bash
git checkout gh-pages
```
<sub>[Back to Table of Contents](#table-of-contents)</sub>

#### **2.7.b Working on an issue (2): Create a new branch where you will work on your issue**

The `git checkout` command will create and change to a new branch where you will do the work on your issue.  In git, the checkout command lets you navigate between different branches.  Using the `-b` flag you can create a new branch and immediately switch into it. 

For example,if we creating a new issue branch off [Update ‘Give’ image credit link and information - #2093](https://github.com/hackforla/website/issues/2093):

```bash
git checkout -b update-give-link-2093
```

 The text after the `-b`, in the example `update-give-link-2093`, will be the name of your new branch. 
 
 **Note:** Choose a branch name that:
 * relates to the issue (No spaces!)
 * includes the issue number

**Note:** The format should look like the scheme above where the words are a brief description of the issue that will make sense at a glance to someone unfamiliar with the issue. 

**Note:** No law of physics will break if you don't adhere to this scheme, but laws of git will break if you add spaces.

When you've finished working on your issue, follow the steps below to prepare your changes to push to your repository. 

##### **i. What if you cannot see your changes locally within Docker?**

If you do not see the changes you applied when you run `docker-compose up`, **do the following**:

1. Stop running your Docker application (if still running).
2. Delete the `_site` directory in the root folder (`website`)
3. Delete the `.jekyll-metadata` file in the root folder (`website`)
4. Finally, restart docker (run `docker-compose up` in the terminal) and you should see your changes.
<br><br>

- If the above steps did not resolve your issue, run through the first three steps again, but try resetting your browser's cache before restarting docker (you can also try running http://localhost:4000 in another browser).
- If you still do not see your changes after trying these steps, please feel free to reach out to the team in the [#hfla-site](https://hackforla.slack.com/archives/C4UM52W93) slack channel, or bring up your issue in a dev meeting.

<sub>[Back to Table of Contents](#table-of-contents)</sub>

#### **2.7.c Working on an issue(3): Prepare your changes to push to your repository**

Once you are done with the work on your issue you will push it to your repository.  Before you can push your work to your repository, you will stage and commit your changes.  These two commands are similar to the save command that you have used to in other programs. 

**Note:** If you are using Visual studios code you can use the Git graphical user interface to stage your changes. For instructions check out the [Git Gui Wiki](https://github.com/hackforla/website/wiki/Using-Git-GUI-(Graphical-user-Interface)-in-Visual-Studios-Code)
   
##### **i. Prepare repo changes (1): Use the `git add` command to stage your changes.** 

This command prepares your changes before you commit them. You can stage files one at a time using the filename. 

Run this command if you want to **add changes from a specific file(s) to your commit record**: 
```bash
git add “filename.ext”
```

Run this command if you want to **add all changes to all file(s) to your commit record**: 
```bash
git add .
```

##### **ii. Prepare repos changes (2): Use the `git status` command to see what files are staged.**

This command will list the files that have been staged.  These are the files that will be committed (saved) when you run the next command, `git commit`. Please be sure all your staged changes are relevant to the issue you are working on. If you accidentally included unrelated changes, please unstage them before making this commit, and then make a new commit for the unrelated changes. (The commands for unstaging commits are provided in the output of your `git status` command.)
      
```bash
git status
```
##### **iii. Prepare repos changes (3): Use the `git reset HEAD` command to remove a staged file.**

This command will remove a file that has been staged.  This file will not be committed (saved) when you run the next command, `git commit`. This only works if the wrong files were added, but they were not yet committed. The file will be removed from the staging area, but not actually deleted:

```bash
git reset HEAD “filename.ext” 
```

##### **iv. Prepare repos changes (4): Use the `git commit` command**

This command saves your work, and prepares it to push to your repository.  Use the `-m` flag to quickly add a message to your commit. Your message should be a short description of the issue you are working.  It will be extremely helpful if other people can understand your message, so try to resist the temptation to be overly cryptic.

To commit your changes with a message, run:

```bash
git commit -m “insert message here”
```

* If you do not see the changes you applied when you run `docker-compose up`, delete `_site` directory and `.jekyll-metadata` file and restart docker. This will force docker to rebuild the whole site. 

<sub>[Back to Table of Contents](#table-of-contents)</sub>
  
#### **2.7.d Working on an issue (4): Check upstream before you push**

Before you push your local commits to your repository, check to see if there have been updates made in the main Hack For LA website repository. `git fetch` will check remote repositories for changes without altering your local repository.

```bash
git fetch upstream
```

##### **i. If there are no changes in the upstream repository**

If you do not see any output, there have not been any changes in the main Hack for LA website repository since the last time you
checked. So it is safe to push your local commits to your fork.

If you just type `git push` you will be prompted to create a new branch in your GitHub repository. The more complete command below will create a new branch on your copy of the website repository, and then push your local branch there. The name at the end of this command should be the same as the name of the local branch that you created back in step 3, as in the example below: 

```bash
git push --set-upstream origin update-give-link-2093
```

##### **ii. If there are conflicting changes in the upstream repository**

When you check the upstream repository, you may see output like this:

```bash
Fetching upstream
remote: Enumerating objects: 11, done.
remote: Counting objects: 100% (11/11), done.
remote: Compressing objects: 100% (7/7), done.
remote: Total 11 (delta 5), reused 7 (delta 4), pack-reused 0
Unpacking objects: 100% (11/11), 8.25 KiB | 402.00 KiB/s, done.
From https://github.com/hackforla/website
+ 770d667...14f9f46 Bonnie     -> hackforla/Bonnie  (forced update)
* [new branch]      bonnie     -> hackforla/bonnie
5773ebe..0c86ecd  gh-pages   -> hackforla/gh-pages
```


**Note:** You can safely ignore changes in other issue branches, such as `bonnie` above. But if you see changes in gh-pages, as in `5773ebe..0c86ecd  gh-pages   -> hackforla/gh-pages`, you should incorporate those changes into your repository before merging or rebasing your issue branch. Use the [instructions below](#27e-working-on-an-issue-5-incorporating-changes-from-upstream) to bring your fork up to date with the main repository.

<sub>[Back to Table of Contents](#table-of-contents)</sub>

#### **2.7.e Working on an issue (5): Incorporating changes from upstream**

Your fork of this repository on GitHub, and your local clone of that fork, will get out of sync with this (upstream) repository from time to time. (That's what has happened when you see something like "This branch is 1 commit behind hackforla:gh-pages" on the github website version of your hackforla repository.)

One way to keep your fork up to date with this repository is to follow these instruction: [Syncing your fork to the original repository via the browser](https://github.com/KirstieJane/STEMMRoleModels/wiki/Syncing-your-fork-to-the-original-repository-via-the-browser)

You can also update your fork via the local clone of your fork, using these instructions. Assuming you have a local clone with remotes `upstream` (this repo) and `origin` (your GitHub fork of this repo):

* First, you will need to create a local branch which tracks upstream/gh-pages.  You will only need to do this once; you do not need to do this every time you want to incorporate upstream changes. 

Run the following two commands: 

```bash
git fetch upstream
git checkout -b upstream-gh-pages --track upstream/gh-pages
```

If you have already created the branch upstream-gh-pages, the following commands will incorporate upstream changes: 

```bash
git checkout upstream-gh-pages # Move to the branch you want to merge with. 
git pull  # This updates your tracking branch to match the gh-pages branch in this repository
git checkout gh-pages  # Move back to your gh-pages branch
git merge upstream-gh-pages  # Merge to bring your gh-pages current. 
```
If you do all your work on topic branches (as suggested above) and keep gh-pages free of local modifications, this merge should apply cleanly.

Then push the merge changes to your GitHub fork:  

```bash
git push
```

If you go to your online github repository this should remove the message "This branch is x commit behind hackforla:gh-pages".

##### **i. Incorporating changes into your topic branch**

To incorporate these updates from the main GitHub repository into your topic branch, you can 'rebase' your branch onto your updated gh-pages branch. NOTE you should only rebase if you have never pushed your topic branch to GitHub (or shared it with another collaborator).

```bash
git checkout update-give-link-2093
git rebase gh-pages
```

If you receive warnings about conflicts, abort the rebase with `git rebase --abort` and instead merge gh-pages into your branch.

```bash
git checkout update-give-link-2093
git merge gh-pages
```

<sub>[Back to Table of Contents](#table-of-contents)</sub>
***

## **Part 3: Pull Requests**

### **3.1 How to make a pull request**

#### **3.1.a Push all changes to your issue branch**

Once you are satisfied with your changes, push them to the feature branch you made within your remote repository. 

```bash
git push --set-upstream origin update-give-link-2093
```

**Note:** We will use the pull request [Update Care Link in Credits Page - #2131](https://github.com/hackforla/website/pull/2131) as an example. This is tied to issue [Update ‘Give’ image credit link and information - #2093](https://github.com/hackforla/website/issues/2093)

#### **3.1.b Complete pull request on Hack for LA `website` repo**

<details>
  <summary><strong>Click here</strong> to see a notification for a pull request</summary>
  <img src="https://user-images.githubusercontent.com/21162229/137709888-77ccfd63-3921-4978-9fc0-6fbd703683b8.jpg" />
</details>
<br>
<details>
  <summary><strong>Click here</strong> to see pull request markdown template</summary>
  
  ```
  Fixes #replace_this_text_with_the_issue_number

  ### What changes did you make and why did you make them ?

  -
  -
  -

  ### Screenshots of Proposed Changes Of The Website  (if any, please do not screen shot code changes)
  <!-- Note, if your images are too big, use the <img src="" width="" length="" />  syntax instead of ![image](link) to format the images -->
  <!-- If images are not loading properly, you might need to double check the syntax or add a newline after the closing </summary> tag -->

  <details>
    <summary>Visuals before changes are applied</summary>

    ![image](Paste_Your_Image_Link_Here_After_Attaching_Files)

  </details>

  <details>
    <summary>Visuals after changes are applied</summary>
  
    ![image](Paste_Your_Image_Link_Here_After_Attaching_Files)

  </details>
  ```
</details>
<br>
<details>
  <summary><strong>Click here</strong> to see pull request #2131 example (gif)</summary>
  <img src="https://media.giphy.com/media/WT7SDqqKLWnjC1ppHV/giphy-downsized-large.gif" />
</details>
<br>

##### **i. Complete pull request (1): Update pull request title**

* When the pull request is opened, the title input box will be the where the cursor defaults to.
* The default title will be your last commit message from your branch. 
  * Please change it to provide a summary of what you did.
  * For our example (PR [Update Care Link in Credits Page - #2131](https://github.com/hackforla/website/pull/2131)), [@adrian-zaragoza](https://github.com/adrian-zaragoza) provided the following title:

  ```
  Update Care Link in Credits Page
  ``` 

**Advice:** Provide a 4-12 word summary of your resolution to the issue you are handling.

##### **ii. Complete pull request (2): Add issue number to the pull request**

We have a GitHub action that automatically closes all issues connected to a pull request. So for our example (PR [Update Care Link in Credits Page - #2131](https://github.com/hackforla/website/pull/2131)) we need to make the following changes:

**From**
```
Fixes #replace_this_text_with_the_issue_number
```
**To**
```
Fixes #2093
```

**Note:** This will now connect the issue and pull request both close when the pull request is successfully merged.

##### **iii. Complete pull request (3): What changes did you make**

In bullet point form, notate the changes you made to be in order to complete the action items within your issue. [@adrian-zaragoza](https://github.com/adrian-zaragoza) provided the following summary in PR [Update Care Link in Credits Page - #2131](https://github.com/hackforla/website/pull/2131):

```
### What changes did you make and why did you make them ?

- Updated title and alt to Care.
- Updated artist to Bharat
- Updated filename to care.yml

```

**Note:** All the bullet points addressed the action items within that issue.

##### **iv. Complete pull request (4): Include images (if available)**

in the gif example [near the top  of this part within the gif of completing pull request #2131](#31-how-to-make-a-pull-request), you will see 2 images get dragged into the text box and added within the `<details>/<summary>` tags like so:

```
### Screenshots of Proposed Changes Of The Website  (if any, please do not screen shot code changes)
<!-- Note, if your images are too big, use the <img src="" width="" length="" />  syntax instead of ![image](link) to format the images -->
<!-- If images are not loading properly, you might need to double check the syntax or add a newline after the closing </summary> tag -->

<details>
<summary>Visuals before changes are applied</summary>

![image](https://user-images.githubusercontent.com/77212035/130176122-aca18c1a-c883-48b3-987d-06342835017c.png)


</details>

<details>
<summary>Visuals after changes are applied</summary>
  
![image](https://user-images.githubusercontent.com/77212035/130176069-9c1cc306-f930-43a5-9f93-1249466c81dc.png)

</details>
```

**Note:** Not all pull requests will have significant changes to our website. **Please do not any screenshots of VSCode** If you do not have the ability to notate changes, please remove the `<details>/<summary` and replace it with an explanation for no images like:

```
### Screenshots of Proposed Changes Of The Website  (if any, please do not screen shot code changes)

Moving files to another directory. No visual changes to the website.
```
##### **v. Complete pull request (5): How to add a pull request to the project board**

**NOTE**: We are in the process of automating newly created pull requests being added to the Project Board. However, it still should be manually checked to make sure the pull request has been placed on the Project Board in case automation breaks.

After you have submitted your pull request, add it to the project board by clicking the gear icon on the right under Projects and selecting 'Project Board.'

<details>
  <summary><strong>Click here</strong> to see how to add a pull request to the project board</summary>
  <h4>Our GitHub project board</h4>
  <img src="https://user-images.githubusercontent.com/81049661/161181526-23ae511c-e991-4cc6-a0a4-d8db19dd69ca.png"/>
</details>

##### **vi. After pull request is submitted/merged**

**NOTE**: After completing your assignment and committing all of the changes, you must leave your current branch and return to the `gh-pages` branch. 

Run the following command to return to the `gh-pages` branch:

```bash
git checkout `gh-pages`
```
Once your pull request is merged you can delete your branch with the following command:
   
```bash
git branch -d update-give-link-2093
```
Now you can move on to your next issue and create a new branch. (This ensures you don’t accidentally include the changes from your previous branch in your new branch)

From here, once your pull request is approved and merged you can pull the recent merge from the Hack For LA repository and delete your local branch:

```bash
git pull upstream gh-pages
git branch -d update-give-link-2093
```

Managing branches this way will keep the commit logs cleaner on the Hack For LA repository, versus merging your completed feature branches into your local repo.

Now you are all set to work on a new PR. Start over at [**2.3 Where can I find GitHub issues to work on?**](#23-where-can-i-find-github-issues-to-work-on) and repeat completing parts 2 and 3.

#### **3.1.c Editing a submitted pull request**
If you find an error in your code or your reviewer asks you to make a change, please avoid editing your code directly from the pull request. Instead update it in your local branch first and then push it to your origin remote. This will update the original pull request.


For new volunteers, check this [wiki on completing pull request reviews](https://github.com/hackforla/website/wiki/How-to-Review-Pull-Requests) and our [wiki on creating issues](https://github.com/hackforla/website/wiki/How-to-create-issues) for more ways to contribute to the project.

<sub>[Back to Table of Contents](#table-of-contents)</sub>
***

## **Part 4: Resources and Documentation**

### **4.1 What do I do if I need help?**

The best way to ask for help and provide as much information to the team is to do the following:

<details>
  <summary><strong>Click here</strong> for visual comment example</summary>
  <img src="https://user-images.githubusercontent.com/21162229/137784250-96281332-9231-4c5d-aba2-0d4c36521b82.jpg" alt="Making a comment visual example" />
</details>

1. Write down your blocker as a comment within your issue
    * Describe the blocker and your approach to resolve the action items within the issue. 
2. Note which branch you are working on and make sure it has the changes you are referring to.

<details>
  <summary><strong>Click here</strong> to see how to copy a link that goes to an issue comment</summary>
  <img src="https://user-images.githubusercontent.com/21162229/137784791-30871703-48de-4836-91ef-1268d86662a4.jpg" alt="Visual example of how to copy the comment link" />
</details>

1. Click on the ellipsis (...) at the top right of the comment box
2. Click on `Copy Link`
3. Now paste that link in the [`hfla-site` Slack channel](https://hackforla.slack.com/archives/C4UM52W93)
4. The Website Leadership/Merge Team will do its best to help resolve any blockers and provide guidance.

<sub>[Back to Table of Contents](#table-of-contents)</sub>
***

### **4.2 Resources and Documentation**

#### **4.2.a Hack For LA resources**
* [Hack for LA's Wiki](https://github.com/hackforla/website/wiki)
* [Wiki - Hack for LA's Site Architecture](https://github.com/hackforla/website/wiki/Hack-for-LA's-Site-Architecture)
* [Wiki - Being a Part of the Hack For LA Team](https://github.com/hackforla/website/wiki/Being-a-Part-of-the-Hack-For-LA-Team)
* [Wiki - How to review pull requests](https://github.com/hackforla/website/wiki/How-to-Review-Pull-Requests)
* [Wiki - How to Create Issues](https://github.com/hackforla/website/wiki/How-to-create-issues)
* [Wiki - How to read and interpret issue labels](https://github.com/hackforla/website/wiki/How-to-read-and-interpret-labels)
* [Wiki - How to communicate with the HfLA Website Team](https://github.com/hackforla/website/wiki/How-to-communicate-with-the-team)

#### **4.2.b Tools Documentation**
* [GitHub Pages](https://pages.github.com/)
* [Jekyll Docs](https://jekyllrb.com/docs/)
* [Liquid Documentation](https://shopify.github.io/liquid/)
* [Github Guides](https://guides.github.com/) 
* [Docker](https://docs.docker.com/get-started/)
  - [Docker Compose](https://docs.docker.com/compose/gettingstarted/)
  - [Docker Desktop](https://docs.docker.com/install/)

<sub>[Back to Table of Contents](#table-of-contents)</sub>
***
