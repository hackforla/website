# How to Contribute

👍🎉 First off, thanks for taking the time to contribute! 🎉👍

The following is a set of guidelines for contributing to the website repository, which is hosted on GitHub. These are mostly guidelines, not rules. Use your best judgment, and feel free to propose changes to this document in a pull request.

** <sub>The guide below assumes that you have completed the onboarding process which includes joining the Hack for LA Slack, GitHub, and Google Drive. If you have not been onboarded, please refer to the [Getting Started Page](https://www.hackforla.org/getting-started).</sub>

** <sub>If you need a text editor to work on code, [VS Code](https://code.visualstudio.com/download) is recommended by the team, but feel free to use a text editor of your choice.</sub>

** <sub>If you have any other questions about your contributing process, feel free to reach out to the team in the [#hfla-site](https://hackforla.slack.com/archives/C4UM52W93) slack channel.</sub>
<br><br>


# Table of Contents
### Setting up the development environment
1. [Join the repository team](#Join-the-repository-team)
2. [Installing Git](#Installing-Git)
3. [Fork the repository](#Fork-the-repository)
4. [Clone the forked repository](#Clone-the-forked-repository)
5. [Set up Docker](#Set-up-Docker-[4])
6. [Build and serve the website locally](#Build-and-serve-the-website-locally)
### Working on an issue and making a pull request
1. [Working on an issue](#Working-on-an-issue)
   - [Check current branch](#Check-current-branch)
   - [Create a new branch where you will work on your issue](#Create-a-new-branch-where-you-will-work-on-your-issue)
     - [What if you cannot see your changes locally within Docker?](#what-if-you-cannot-see-your-changes-locally-within-docker)
   - [Prepare your changes to push to your repository](#Prepare-your-changes-to-push-to-your-repository)
   - [Check upstream before you push](#Check-upstream-before-you-push)
2. [Making a pull request](#Making-a-pull-request)
### Resources and Documentation
1. [Hack for LA's Site Architecture](https://github.com/hackforla/website/wiki/Hack-for-LA's-Site-Architecture)
2. [GitHub Pages](https://pages.github.com/)
3. [Jekyll Docs](https://jekyllrb.com)
4. [Github Guides](https://guides.github.com/) 
5. [Docker](https://docs.docker.com/get-started/)
   - [Docker Compose](https://docs.docker.com/compose/gettingstarted/)
   - [Docker Desktop](https://docs.docker.com/install/)


# Setting up the development environment
## Join the repository team

In the `hfla-site` Slack channel, send an introductory message with your GitHub handle/username asking to be added to the Hack for LA website GitHub repository (this repository).

Once you have accepted the GitHub invite (comes via email or in your GitHub notifications), please do the following:

1. Make your own Hack for LA GitHub organization membership public by following this [guide](https://help.github.com/en/articles/publicizing-or-hiding-organization-membership#changing-the-visibility-of-your-organization-membership).

2. Set up two-factor authentication on your account by following this [guide](https://docs.github.com/en/github/authenticating-to-github/configuring-two-factor-authentication).


## Installing Git

Before cloning your forked repository to your local machine, you must have Git installed. You can find instructions for installing Git for your operating system [**here**](https://git-scm.com/book/en/v2/Getting-Started-Installing-Git). Please note that if you have a Mac the page offers several options (see other option, if you need to conserve hard drive space) including:

- an “easiest” option (this version is fine for use at hackforla): This option would take just over 4GB.
- a “more up to date” option (not required but optional if you want it): This option prompts you to go to install an 8GB package manager called Homebrew. 
- Other option: If your computer is low on space, you can use this [tutorial](https://www.datacamp.com/community/tutorials/homebrew-install-use) to install XCode Command Tools and a lighter version of Homebrew and then install Git using this command: ```$ brew install git```  which in total only uses 300MB.

## Fork the repository

You can fork the hackforla/website repository by clicking <a href="https://github.com/hackforla/website/fork"> <button> <img src="https://user-images.githubusercontent.com/17777237/54873012-40fa5b00-4dd6-11e9-98e0-cc436426c720.png" width="8px"> Fork</button></a>
. A fork is a copy of the repository that will be placed on your GitHub account.

It should create a URL that looks like the following -> `https://github.com/<your_GitHub_user_name>/website`.

For example -> `https://github.com/octocat/website`.

Note that this forked copy is a remote version on GitHub. It is not yet on your local machine.

## Clone the forked repository

Before cloning your forked repository to your local machine, you must have Git installed. You can find instructions for installing Git for your operating system [**here**](https://git-scm.com/book/en/v2/Getting-Started-Installing-Git). 

The following steps will create a local copy of the repository on your machine.

   1. Create a new folder on your machine that will contain `hackforla` projects.

      In your command line interface (Terminal, Git Bash, Powershell), navigate into the folder(directory) you just created.
      
      For example: 
      ```bash
      cd Desktop
      cd hackforla
      ```
      
      and run the following commands:
      
      ```bash
      git clone https://github.com/<your_GitHub_user_name>/website.git
      ```
      
      For example:
      ```bash
      git clone https://github.com/octocat/website.git
      ```

      You should now have a new folder in your `hackforla` folder called `website`. Verify this by changing into the new directory:
      ```bash
      cd website
      ```

  2. Verify that your local cloned repository is pointing to the correct `origin` URL (that is, the forked repo on your own Github account):

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
      <details>
      <summary><i>If you accidentally cloned using the repository URL from the HackForLA Github (instead of the fork on your Github)</i> 
      </summary>

      1) Set your forked repo on your Github as an `origin` remote:

      ```bash
      git remote set-url origin https://github.com/<your_GitHub_user_name>/website.git
      ```

      2) Add another remote called `upstream` that points to the `hackforla` version of the repository. This will allow you to incorporate changes later:

      ```bash
      git remote add upstream https://github.com/hackforla/website.git
      ```
      </details>
## Set up Docker

Docker is the recommended approach to quickly getting started with local development. Docker helps create a local/offline version of the hackforla.org website on your computer so you can test out your code before submitting a pull request.

The recommended installation method for your operating system can be found [here](https://docs.docker.com/install/). <sub><i>Feel free to reach out in the hfla slack channel if you have trouble installing docker on your system</i></sub>

More on using Docker and the concepts of containerization:

* [Get started with Docker](https://docs.docker.com/get-started/)

<details>
<summary>Docker Installation Troubleshooting</summary>

If you are on Windows and get 'You are not allowed to use Docker, you must be in the "docker-users" group' as an error message, the following wiki page is a guide for solving te issue:
- [Windows docker-users group error guide](https://github.com/hackforla/website/wiki/Adding-local-user-accounts-to-the-docker-users-group-on-Windows-10)

Installing WSL2 on windows
- https://docs.microsoft.com/en-us/windows/wsl/install-win10
</details>

## Build and serve the website locally
### Build Up

- This command starts a jekyll server locally. The server watches for changes to
the source files and rebuilds and refreshes the site automatically in your browser.

  Navigate to within the `website` directory that you cloned earlier in your terminal then run the below command

   ```bash
   docker-compose up
   ```

   Running the above command will result in the following output in your terminal

  <details>
  <summary>Terminal Output</summary>

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

### Tear Down

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
# Working on an issue and making a pull request

## Working on an issue

  > - If you are using Visual studios code you can use the Git graphical user interface to stage your changes. For instructions check out the [Git gui wiki] (https://github.com/hackforla/website/wiki/Using-Git-GUI-(Graphical-user-Interface)-in-Visual-Studios-Code)
  > Alternatively you can follow the instructions below to stage changes through the terminal.

Create a new branch for each issue you work on. Doing all your work on topic branches leaves your repository's main branch (named `gh-pages`) unmodified and greatly simplifies keeping your fork in sync with the main project.

1. ### Check current branch

   The `git branch` command will let you know what branch you are in, and what branch names are already in use.

   ```bash
   git branch
   ```

   You will see a list of all of your branches. There will be a star (`*`) next to the branch that you are currently in. By default you should start on the `gh-pages` branch.

   <sub>** *when you work on future issues, you must always be in the `gh-pages` branch when creating a new branch.*</sub>

   If you are not currently in the `gh-pages` branch, run the following command to return to it:

   ```bash
   git checkout gh-pages
   ```

2. ### Create a new branch where you will work on your issue

   The `git checkout` command will create and change to a new branch where you will do the work on your issue.  In git, the checkout command lets you navigate between different branches.  Using the `-b` flag you can create a new branch and immediately switch into it. 

   To create a new issue branch, and switch into it: 

   ```bash
   git checkout -b fix-logo-width-311
   ```

   The text after the `-b`, in the example `fix-logo-width-311`, will be the name of your new branch. Choose a branch name that relates to the issue you're working on. (No spaces!)


   The format should look like the scheme above where the words are a brief description of the issue that will make sense at a glance to someone unfamiliar with the issue. 

   <sub>*No law of physics will break if you don't adhere to this scheme, but laws of git will break if you add spaces.*</sub>

   When you've finished working on your issue, follow the steps below to prepare your changes to push to your repository. 

   ### What if you cannot see your changes locally within Docker?

   If you do not see the changes you applied when you run docker-compose up, **do the following**:

   1. Stop running your Docker application (if still running).
   2. Delete the `_site` directory in the root folder (`website`)
   3. Delete the `.jekyll-metadata` file in the root folder (`website`)
   4. Finally, restart docker (run `docker-compose up` in the terminal) and you should see your changes.
   <br><br>
   - If the above steps did not resolve your issue, run through the first three steps again, but try resetting your browser's cache before restarting docker (you can also try running http://localhost:4000 in another browser).
   - If you still do not see your changes after trying these steps, please feel free to reach out to the team in the [#hfla-site](https://hackforla.slack.com/archives/C4UM52W93) slack channel, or bring up your issue in a dev meeting.
   <br><br>
3. ### Prepare your changes to push to your repository

   Once you are done with the work on your issue you will push it to your repository.  Before you can push your work to your repository, you will stage and commit your changes.  These two commands are similar to the save command that you have used to in other programs. 

   <sub>** *If you are using Visual studios code you can use the Git graphical user interface to stage your changes. For instructions check out the [Git Gui Wiki](https://github.com/hackforla/website/wiki/Using-Git-GUI-(Graphical-user-Interface)-in-Visual-Studios-Code)*</sub>
   

   - Use the `git add` command to stage your changes.  
      This command prepares your changes before you commit them. You can stage files one at a time using the filename. 

      Run the command: 
      ```bash
      git add “filename.ext”
      ```

   - Use the `git status` command to see what files are staged.

      This command will list the files that have been staged.  These are the files that will be committed (saved) when you run the next command, `git commit`. Please be sure all your staged changes are relevant to the issue you are working on. If you accidentally included unrelated changes, please unstage them before making this commit, and then make a new commit for the unrelated changes. (The commands for unstaging commits are provided in the output of your `git status` command.)
      
      ```bash
      git status
      ```


   - Use the `git reset HEAD` command to remove a staged file. 

      This command will remove a file that has been staged.  This file will not be committed (saved) when you run the next command, `git commit`. This only works if the wrong files were added, but they were not yet committed. The file will be removed from the staging area, but not actually deleted:
      ```bash
      git reset HEAD “filename.ext” 
      ```

    - Use the `git commit` command

      This command saves your work, and prepares it to push to your repository.  Use the `-m` flag to quickly add a message to your commit. Your message should be a short description of the issue you are working.  It will be extremely helpful if other people can understand your message, so try to resist the temptation to be overly cryptic.

      To commit your changes with a message, run:
      ```bash
      git commit -m “insert message here”
      ```
** If you do not see the changes you applied when you run `docker-compose up`, delete `_site` directory and `.jekyll-metadata` file and restart docker. This will force docker to rebuild the whole site. 
  
4. ### Check upstream before you push

   Before you push your local commits to your repository, check to see if there have been updates made in the main Hack For LA website repository. `git fetch` will check remote repositories for changes without altering your local repository.

   ```bash
   git fetch upstream
   ```

    - <details>
      <summary>No changes in the upstream repository</summary>

      If you do not see any output, there have not been any changes in the
      main Hack for LA website repository since the last time you
      checked. So it is safe to push your local commits to your fork.

      If you just type `git push` you will be prompted to create a new branch in your GitHub repository. The more complete command below will create a new branch on your copy of the website repository, and then push your local branch there. The name at the end of this command should be the same as the name of the local branch that you created back in step 3, as in the example below:  

      ```bash
      git push --set-upstream origin fix-logo-width-311
      ```
      </details>
    - <details>
      <summary>Conflicting changes in the upstream repository</summary>

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


        You can safely ignore changes in other issue branches, such as
        `bonnie` above. But if you see changes in gh-pages, as in
        `5773ebe..0c86ecd  gh-pages   -> hackforla/gh-pages`, you should
        incorporate those changes into your repository before merging or
        rebasing your issue branch. Use the [instructions below](#incorporating-changes-from-upstream)
        to bring your fork up to date with the main repository.
      </details>
  
Your fork of this repository on GitHub, and your local clone of that fork, will
get out of sync with this (upstream) repository from time to time.  (That's what has happened when you see something like "This branch is 1 commit behind hackforla:gh-pages" on the github website version of your hackforla repository.)

5.  ### Incorporating changes from upstream

      Your fork of this repository on GitHub, and your local clone of that fork, will
      get out of sync with this (upstream) repository from time to time.  (That's what has happened when you see something like "This branch is 1 commit behind hackforla:gh-pages" on the github website version of your hackforla repository.)

      One way to keep your fork up to date with this repository is to follow
      these instruction: [Syncing your fork to the original repository via the browser](https://github.com/KirstieJane/STEMMRoleModels/wiki/Syncing-your-fork-to-the-original-repository-via-the-browser)

      You can also update your fork via the local clone of your fork, using
      these instructions. Assuming you have a local clone with remotes
      `upstream` (this repo) and `origin` (your GitHub fork of this repo):

      First, you will need to create a local branch which tracks upstream/gh-pages.  You will only need to do this once; you do not need to do this every time you want to incorporate upstream changes. 

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

      #### Incorporating changes into your topic branch

      To incorporate these updates from the main GitHub repository into your
      topic branch, you can 'rebase' your branch onto your updated gh-pages
      branch. NOTE you should only rebase if you have never pushed your
      topic branch to GitHub (or shared it with another collaborator).

      ```bash
      git checkout fix-logo-width-311
      git rebase gh-pages
      ```

      If you receive warnings about conflicts, abort the rebase with `git
      rebase --abort` and instead merge gh-pages into your branch.

      ```bash
      git checkout fix-logo-width-311
      git merge gh-pages
      ```

## Making a pull request

Start with pushing your changes to your remote repository

```bash
git push --set-upstream origin fix-logo-width-311
```

Now create a new pull request to ask for your updates to be
incorporated into the live web site. Go to
https://github.com/hackforla/website/pulls and click on "New pull
request". Please rename your pull request something descriptive i.e. "building a project card for civic opportunity project".
Also, since your changes are not in the hackforla/website
repository, you need to click the "compare across forks" link in the
first paragraph to make your repository and your new branch
available. Make sure to include pictures of any visual changes made to the site and document your edits on the pull request so that the reviewer can understand the changes made. Review the changes that will be included in the pull
request and, if it fixes a specific issue, include `Fixes #140` in the
pull request message so the issue will be closed automatically once
your pull request is accepted and merged.

Once you have finished working on the issue you have chosen, commit
the changes to your local branch (e.g. `fix-logo-width-311`).

<p align="center"><i><b>NOTE</b>: After completing your assignment and committing all of the changes, you must leave your current branch and return to the `gh-pages` branch. 

Run the following command to return to the `gh-pages` branch:

```bash
git checkout `gh-pages`
```
Once your pull request is merged you can delete your branch with the following command:
   
```bash
git branch -d fix-logo-width-311
```
Now you can move on to your next issue and create a new branch. (This ensures you don’t accidentally include the changes from your previous branch in your new branch) </i></p>

From here, once your pull request is approved and merged you can pull the recent merge from the Hack For LA repository and delete your local branch:
```bash
git pull upstream gh-pages
git branch -d <your-feature-branch>
```
Managing branches this way will keep the commit logs cleaner on the Hack For LA repository, versus merging your completed feature branches into your local repo.

Now you are all set to work on a new PR. Start over [here](#Working-on-an-issue).

#### Edits to a pull request
If you find an error in your code or your reviewer asks you to make a change, please avoid editing your code directly from the pull request. Instead update it in your local branch first and then push it to your origin remote. This will update the original pull request.


- [ghpages](https://pages.github.com/)
- [jekyll](https://jekyllrb.com)
- [jekyllcli](https://jekyllrb.com/docs/usage/)

</details>

For new volunteers, check this [Wiki](https://github.com/hackforla/website/wiki/How-to-Review-Pull-Requests) for more ways to contribute to the project.

[Back to Top](#overview)
