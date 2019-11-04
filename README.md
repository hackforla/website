# website

> Hack for LA's website https://www.hackforla.org

This is a standard [Jekyll][jekyll] site hosted right here on [GitHub pages][ghpages].

To develop the site, you'll need to first clone the repository on to your computer. For new Git users, see the [Using Git](#using-git) section below.

## Developing via Docker

Docker is the recommended approach to quickly getting started with local development.

There are two pre-requisites: Docker and Docker Compose.
The recommended installation method is [Docker Desktop][dockerdesktop] for Windows 10 64-bit,
Mac, and Linux users. Users of unsupported operating systems may check out [Docker Toolbox][dockertoolbox] instead.

More on using Docker and the concepts of containerization:

* [Get started with Docker][docker]
* [Get started with Docker Compose][dockercompose]

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

## Using Git

This section discusses some tips and best practices for working with Git.

### Making changes, committing and pushing

1. Generally changes start on your local clone of your fork of this repository, in your own branch.

1. Commit your changes with a comment related to the issue it addresses to your local repository.

1. Push that commit(s) to your online GitHub fork.

1. From the `hackforla` repository, create a Pull Request which asks `hackforla` to pull changes from your fork into the main repository.

1. After the owner of the `hackforla` repository approves and merges your Pull Request, your changes will be live on the website. 

### Forking and cloning the repository with proper security

#### Step 1: Become a member of the repository Team

In the `hfla-site` slack channel, send your GitHub name to the project manager (or on the slack channel thread) and we'll add you as a member to the GitHub repository Team.

Once you have accepted the GitHub invite (comes via email or in your GitHub notifications), please do the following:

1. Mark your own membership public https://help.github.com/en/articles/publicizing-or-hiding-organization-membership#changing-the-visibility-of-your-organization-membership

1. Setup two factor authentication on your account https://github.com/hackforla/governance/issues/20

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

If you accidentally cloned the `hackforla/website.git` then you can change your local copy to upload to your fork with the following:

```bash
git remote set-url origin https://github.com/your_user_name/website.git
```

Add another remote called `upstream` that points to the `hackforla` version of the repository. This will allow you to incorporate changes later:

```bash
git remote add upstream https://github.com/hackforla/website.git
```

#### Step 4: Change to a new branch

For each issue, create a new branch to work in.

This command will let you know available branches and which branch you're on.

Star (`*`) indicates which branch you're on

```bash
git branch
```

By default you should start on the `gh-pages` branch.

This command will (create and) change to a new branch:

```bash
git checkout -b 140-fix-logo-width
```

We prefer that you work on a branch name that relates to the issue you're working on.

The format should look like the scheme above where `140` is the issue number in GitHub, and the words are a brief description of the issue.

No law of physics will break if you don't adhere to this scheme but laws of git will break if you add spaces. 

### Incorporating changes from upstream

Your fork of this repository on GitHub, and your local clone of that fork, will
get out of sync with this (upstream) repository from time to time.

Assuming you have a local clone with remotes `upstream` (this repo) and `origin`
(your GitHub fork of this repo):

```bash
# WARNING: this will erase local pending changes!
# commit them to a different branch or use git stash
git checkout gh-pages
git fetch upstream
git reset --hard upstream/gh-pages
```

Creating a new branch for a feature/bugfix from this reset `gh-pages` will lead to a clean, easy merge down the line.


[docker]: https://docs.docker.com/get-started/
[dockercompose]: https://docs.docker.com/compose/gettingstarted/
[dockerdesktop]: https://docs.docker.com/install/#supported-platforms
[dockertoolbox]: https://docs.docker.com/toolbox/overview/
[ghpages]: https://pages.github.com/
[jekyll]: https://jekyllrb.com
[jekyllcli]: https://jekyllrb.com/docs/usage/
