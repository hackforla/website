# Welcome to HackForLA
This is the contributing guide, it is going to assist you with

- Getting Your Local Git Setup Ready
- Setting Up Docker
- Working On Your First Issue

You should also read [this](https://github.com/hackforla/website/wiki/Being-a-Part-of-the-Hack-For-LA-Team) article in the wiki in tandem with this guide

## Getting Your Local Git Setup Ready
1. [Fork](https://github.com/hackforla/website/for) the repository
2. Clone the forked repository from your terminal by running 
```bash
git clone https://github.com/<replace_with_your_github_username>/website.git
```
3. Create a branch called upstream-gh-pages
```
git branch upstream-gh-pages
```
4. Then run the following commands one after another
```bash
git remote add upstream https://github.com/hackforla/website.git
git remote set-url origin https://github.com/your_user_name/website.git
git checkout -b upstream-gh-pages --track upstream/gh-pages
```

At this point in time if you run the command `git branch` you will notice that you will have two branches. gh-pages and upstream-gh-pages.
For the most part you can forget about the gh-pages branch, and you only really need to care about the upstream-gh-pages branch only
<p align="center">
NEVER MAKE ANY CHANGES TO THE UPSTREAM-GH-PAGES BRANCH AND TREAT IT AS YOUR SOURCE OF TRUTH
</p>


<details>
  <summary><i>note</i></summary>

After running the above commands running `git remote -v` will result in
  ```bash
  origin  https://github.com/YOURUSERNAME/website.git (fetch)
  origin  https://github.com/YOURUSERNAME/website.git (push)
  upstream        https://github.com/hackforla/website.git (fetch)
  upstream        https://github.com/hackforla/website.git (push)
  ```

</details>

## Setting Up Docker
1. [Download and Install](https://www.docker.com/products/docker-desktop) Docker
2. Go to the cloned hackforla website repository on your machine and run `docker compose up`(do make sure that you have docker running)
3. Then browse to http://localhost:4000, to see the website
4. To stop the container from running press `cntrl/cmd + c`
5. To tear down and destory the contrainer run: `docker compose down`

## Working On Your First Issue

1. Ensure you local is code is up to date with the hackforla/website code 
```bash
git checkout upstream-gh-pages
git pull
```
2. Create and checkout a new branch
```bash
get checkout -b <issue-number>-<branch-name>
```
3. Make nessecary code changes
4. Add , Commit and Push your code changes
```bash
# to look at the files changed
git status

# Add the files changed
git add <file_name>

# Commit the changes
git commit -m "A short and conscice commit message"

# Push the changes
git push --set-upstream origin <your_branch_name>
```
5. Create a pull request by going to the following url: 
```bash
https://github.com/<your_github_username>/website/pull/new/<name_of_the_branch_you_are_working_on>
```
