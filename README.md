# Website

> Hack for LA's website: https://www.hackforla.org

This is a standard [Jekyll](https://jekyllrb.com/) site hosted right here on [GitHub pages](https://pages.github.com/).

To develop the site, you'll need to first clone the repository on to your computer. For new Git users, see the [Using Git](#using-git) section below. <br><br>

# OVERVIEW
**Set up**
1. [Join the Repo Team](#step-1-become-a-member-of-the-repository-team)

2. [Using Git](#using-git) and [Fork the Repo](#step-2-fork-the-repository)

3. [Clone to your local machine](#step-3-clone-your-online-repository-to-your-local-computer)

4. [Set up Docker](#step-4-setting-up-docker)

**Before you start working on an issue**

5. [Read Hack for LA's Site Architecture to get acquainted with how the website is structured](https://github.com/hackforla/website/wiki/Hack-for-LA's-Site-Architecture)

6. [Switch to new issue branch before you start making changes](#step-6-change-to-a-new-branch)


**After you've worked on your issue and before you make a pull request:**

7. [Check upstream before you push](#step-7-check-upstream-before-you-push).

8. [No changes in the upstream repo](#step-7a-no-changes-in-the-upstream-repository)

**Or**

9. [Conflicting changes in the upstream repo](#step-7b-conflicting-changes-in-the-upstream-repository) and how to resolve them
              
**Okay. You're good to go!**        
 
10. [Complete the pull request](#step-8-complete-the-pull-request)

---

### Forking and cloning the repository with proper security

#### Step 1: Become a member of the repository Team

In the `hfla-site` slack channel, send your GitHub name to the project manager (or on the slack channel thread) and we'll add you as a member to the GitHub repository Team.

Once you have accepted the GitHub invite (comes via email or in your GitHub notifications), please do the following:

1. Mark your own membership public https://help.github.com/en/articles/publicizing-or-hiding-organization-membership#changing-the-visibility-of-your-organization-membership

1. Setup two factor authentication on your account https://github.com/hackforla/governance/issues/20


## Using Git

This section discusses some tips and best practices for working with Git.

### Making changes, committing and pushing

1. Generally changes start on your local clone of your fork of this repository, in your own branch.

1. Commit your changes with a comment related to the issue it addresses to your local repository.

1. Push that commit(s) to your online GitHub fork.

1. From the `hackforla` repository, create a Pull Request which asks `hackforla` to pull changes from your fork into the main repository.

1. After the owner of the `hackforla` repository approves and merges your Pull Request, your changes will be live on the website. 

#### Step 2: Fork the repository

In https://github.com/hackforla/website, look for the fork icon in the top right. Click it and create a fork of the repository.

For git beginners, a fork is a copy of the repository that will be placed on your GitHub account url.

It should create a copy here: https://github.com/your_GitHub_user_name/website, where `your_GitHub_user_name` is replaced with exactly that.

Note that this copy is on a remote server on the GitHub website and not on your computer yet.

If you click the icon again, it will not create a new fork but instead give you the URL associated with your fork.

#### Step 3: Clone your online repository to your local computer

For git beginners, this process will create a third copy of the repository on your local desktop.

First create a new folder on your desktop that will contain `hackforla` projects.

In your shell, navigate there then run the following commands:

```bash
git clone https://github.com/your_GitHub_user_name/website.git
```

You should now have a new folder in your `hackforla` folder called `website`.

Verify which URL your `origin` remote is pointing to:

```bash
git remote show origin
```

If you accidentally cloned the `hackforla/website.git` then you can correct that with the following two commands: 

1) Change your local copy to upload to your fork with the following:

```bash
git remote set-url origin https://github.com/your_user_name/website.git
```

2) Add another remote called `upstream` that points to the `hackforla` version of the repository. This will allow you to incorporate changes later:

```bash
git remote add upstream https://github.com/hackforla/website.git
```

#### Step 4: Setting up Docker

Docker is the recommended approach to quickly getting started with local development. (ELI5: Docker helps create a local/offline version of the hackforla.org website on your computer so you can test out your code before submitting a pull request).

There are two pre-requisites: Docker and Docker Compose.
The recommended installation method is [Docker Desktop](https://docs.docker.com/install/) for Windows 10 64-bit,
Mac, and Linux users. Users of unsupported operating systems may check out [Docker Toolbox](https://docs.docker.com/compose/gettingstarted/) instead.

More on using Docker and the concepts of containerization:

* [Get started with Docker](#docker)
* [Get started with Docker Compose](https://docs.docker.com/compose/gettingstarted/)

*Ensure you run the `docker` commands below from a shell inside the local directory containing your clone of this repository.*

### Build and serve the website locally

This command starts a jekyll server locally. The server watches for changes to
the source files and rebuilds and refreshes the site automatically in your browser.

```bash
docker-compose up
```

Now browse to http://localhost:4000

### Tear down

To stop and completely remove the jekyll server (i.e. the running Docker container):

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
<br>

#### Step 5: Read [Hack for LA's Site Architecture](https://github.com/hackforla/website/wiki/Hack-for-LA's-Site-Architecture) to get acquainted with how the website is structured

#### Step 6: Work on an issue using git

Create a new branch for each issue you work on. Doing all your work on topic branches leaves your repository's main branch (named `gh-pages`) unmodified and greatly simplifies keeping your fork in sync with the main project.

a) Check current branch

The `git branch` command will let you know what branch you are in, and what branch names are already in use.

```bash
git branch
```

You will see a list of all of your branches. There will be a star (`*`) next to the branch that you are currently in. By default you should start on the `gh-pages` branch.

b) Create a new branch where you will work on your issue

The `git checkout` command will create and change to a new branch where you will do the work on your issue.  In git, the checkout command lets you navigate between different branches.  Using the `-b` flag you can create a new branch and immediately switch into it. 

To create a new issue branch, and switch into it: 

```bash
git checkout -b fix-logo-width-311
```

The text after the `-b`, in the example `fix-logo-width-311`, will be the name of your new branch. Choose a branch name that relates to the issue you're working on. (No spaces!)

The format should look like the scheme above where the words are a brief description of the issue that will make sense at a glance to someone unfamiliar with the issue. 

No law of physics will break if you don't adhere to this scheme, but laws of git will break if you add spaces.

When you've finished working on your issue, follow the steps below to prepare your changes to push to your repository. 

c) Prepare your changes to push to your repository

Once you are done with the work on your issue you will push it to your repository.  Before you can push your work to your repository, you will stage and commit your changes.  These two commands are similar to the save command that you have used to in other programs. 

-Use the `git add` command to stage your changes.  
This command prepares your changes before you commit them. You can stage files one at a time using the filename, or you can use the `.` to stage all of the files that you have added or made changes to. 

Run the command: 
```bash
git add .
```

-Use the `git status` command to see what files are staged. 

This command will list the files that have been staged.  These are the files that will be committed (saved) when you run the next command, `git commit`. Please be sure all your staged changes are relevant to the issue you are working on. If you find you have included unrelated changes, please unstage them before making this commit - and then make a new commit for the unrelated changes. (The commands for unstaging commits are provided in the output of your `git status` command.)
```bash
git status
```

-Use the `git commit` command

This command saves your work, and prepares it to push to your repository.  Use the `-m` flag to quickly add a message to your commit. Your message should be a short description of the issue you are working.  It will be extremely helpful if other people can understand your message, so try to reisst the temptation to be overly cryptic.

To commit your changes with a message, run:
```bash
git commit -m “insert message here”
```

Congratulations!  You are now ready to push your work to your repository. 

#### Step 7: Check upstream before you push

Before you push your local commits to your repository, check to see if there have been updates made in the main Hack For LA website repository. `git fetch` will check remote repositories for changes without altering your local repository.

```bash
git fetch upstream
```

##### Step 7a: No changes in the upstream repository

If you do not see any output, there have not been any changes in the
main Hack for LA website repository since the last time you
checked. So it is safe to push your local commits to your fork.

If you just type `git push` you will be prompted to create a new branch in your GitHub repository. The more complete command below will create a new branch on your copy of the website repository, and then push your local branch there. The name at the end of this command should be the same as the name of the local branch that you created back in step 6, as in the example below:  

```bash
git push --set-upstream origin fix-logo-width-311
```

##### Step 7b: conflicting changes in the upstream repository

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


### Incorporating changes from upstream

Your fork of this repository on GitHub, and your local clone of that fork, will
get out of sync with this (upstream) repository from time to time.  (That's what has happend when you see something like "This branch is 1 commit behind hackforla:gh-pages" on the github website version of your hackforla repository.)

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
git checkout gh-pages  # Move back to your gn-pages branch
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

#### Step 8: Complete the pull request

```bash
git push --set-upstream origin fix-logo-width-311
```

Now create a new pull request to ask for your updates to be
incorporated into the live web site. Go to
https://github.com/hackforla/website/pulls and click on "New pull
request". Please rename your pull request something descriptive i.e. "building a project card for civic opportunity project".
Also, since your changes are not in the hackforla/website
repostory, you need to click the "compare across forks" link in the
first paragraph to make you repository and your new branch
available. Review the changes that will be included in the pull
request and, if it fixes a specific issue, include `Fixes #140` in the
pull request message so the issue will be closed automatically once
your pull request is accepted and merged.

Once you have finished working on the issue you have chosen, commit
the changes to your local branch (e.g. `fix-logo-width-311`).

## Useful Links

### Supported Platforms

- [dockertoolbox](https://docs.docker.com/toolbox/overview/)
- [ghpages](https://pages.github.com/)
- [jekyll](https://jekyllrb.com)
- [jekyllcli](https://jekyllrb.com/docs/usage/)

### Tutorials

- [Github Guides](https://guides.github.com/) 
- [docker](https://docs.docker.com/get-started/)
- [dockercompose](https://docs.docker.com/compose/gettingstarted/)
- [dockerdesktop](https://docs.docker.com/install/)


[Back to Top](#overview)
