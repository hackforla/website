# website

> Hack for LA's website https://www.hackforla.org

This is a standard [Jekyll][jekyll] site hosted right here on [GitHub pages][ghpages].

There are two options for developing the site locally: (1) Using the environment container "Docker" or (2) using Ruby and Jekyll directly ensuring you're using the same exact environment we're developing in. Therefore the first approach is recommended and very easy to use. The second approach is not supported. 

First you'll need the repository on your computer so you have a site to run when these development environments are installed.
For new Git users, see Git section below after we discuss the two development approaches. 

## Developing via Docker

This is the recommended approach to quickly getting started.

There are two pre-requisites: Docker and Docker Compose.
The recommended installation method is [Docker Desktop][dockerdesktop] for Windows 10 64-bit,
Mac, and Linux users. Users of unsupported operating systems may check out [Docker Toolbox][dockertoolbox] instead.

More on using Docker and the concepts of containerization:

* [Get started with Docker][docker]
* [Get started with Docker Compose][dockercompose]

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


# Git:

## Forking and Cloning the Repository with Proper Security

### Step 1: Get added as a member of the GitHub repository

In the hfla-website slack channel, send your GitHub name to the project manager (or on the slack channel thread) and we'll add you as a member to the GitHub repository.

Once you have accepted github invite (comes via email or in your GitHub.com inbox), please do the following:

Mark your own membership public
https://help.github.com/en/articles/publicizing-or-hiding-organization-membership#changing-the-visibility-of-your-organization-membership

Setup two factor authentication on your account
https://github.com/hackforla/governance/issues/20 (edited) 

### Step 2: Fork the Repository

In https://github.com/hackforla/website, look for the fork icon in the top right. Click it and create a fork of the repository.
For git beginners, this is a copy of the repository that will be placed on your GitHub account url. 
It should create a copy here: https://github.com/your_GitHub_user_name/website, where your_GitHub_user_name is replaced with exactly that.
Note that this copy is on a remote server on the GitHub website and not on your computer yet.
If you click the icon again, it will not create a new fork but instead give you the URL associated with your fork. 

### Step 3: Clone YOUR online repository to your local computer

For git beginners, this process will create a third copy of the repository on your local desktop.

First create a new folder on your desktop that will contain hackforla projects.
In your shell, navigate there then run the following commands:

```bash
git clone https://github.com/your_GitHub_user_name/website.git
```

You should now have a new folder in your hackforla folder called "website". 

If you accidentally cloned the hackforla/website.git then you can change your local copy to upload to YOUR fork by the following:

```bash
git remote set-url origin  https://github.com/your_user_name/website.git 
```

This will check if which URL you're pointing to:

```bash
git remote show origin
```

### Step 4: Change to a new branch

For each issue, we'll try to create a new branch for that issue.
This command will let you know available branches and which branch you're on. 
Star (*) indicates which branch you're on

```bash
git branch
```

By default you should start on the 'gh-pages' branch. 
This command will (create and) change to a new branch:

```bash
git checkout -b 140-fix-logo-width
```

We prefer that you work on a branch name that relates to the issue you're working on (or assigned).
The format should look like the scheme above where 140 is the issue number in GitHub, and the words are a brief description of the issue. 
No law of physics will break if you don't adhere to this scheme but laws of git will break if you add spaces. 

## Incorporating changes from upstream

Your fork of this repository on GitHub, and your local clone of that fork, will
get out of sync with this (upstream) repository from time to time.

A few `git` commands is all it takes to get your local clone up to date.
Assuming you have a local clone with remotes `upstream` (this repo) and `origin`
(your GitHub fork of this repo):

```bash
# WARNING: this will erase local pending changes!
# commit them to a different branch or use git stash
git checkout gh-pages
git fetch upstream
git reset --hard upstream/gh-pages
```

Creating a new branch for feature/bugfix work now results in a clean, easy merge
down the line.

Now that local is up to date with `upstream`, update your GitHub fork with:

```bash
git push --force origin/gh-pages
```
## Making changes, committing and pushing

The general process of making changes to the website is to make changes on your local repository of your fork in your own branch. 

Then commit those changes with a comment related to the issue it addresses to your local repository.

Then push that commit to YOUR online fork.

Then go to the hackforla repository and create a PULL request which asks hackforla to pull changes from YOUR fork into their repository.

Therefore all changes are made on your copy and only after the owner of the hackforla website approves and pulls your changes will updates be made. 

New git users: please ask around for guidance here. See the commit and push commands. 


[docker]: https://docs.docker.com/get-started/
[dockercompose]: https://docs.docker.com/compose/gettingstarted/
[dockerdesktop]: https://docs.docker.com/install/#supported-platforms
[dockertoolbox]: https://docs.docker.com/toolbox/overview/
[ghpages]: https://pages.github.com/
[jekyll]: https://jekyllrb.com
[jekyllcli]: https://jekyllrb.com/docs/usage/
