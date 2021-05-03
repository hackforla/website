You should never blindly add all files that have been changed using ``git add .``. That being said, you should always double-check the files changed and make sure those are the intentional changes you planned on. You can do this using the Git GUI. 

1. Check if the Git GUI is visible in your left sidebar. If not you can right-click on the sidebar and confirm that Source Control is checked.

![Image of VS code sidebar](https://i.imgur.com/Kp5RYo8.png)

2. Click on the source control icon. 

3. Click on the file you made changes on and confirm they are the correct changes.

4. If they are the correct changes you can hover over the file and click on the ``+`` sign to stage your changes.
![Git gui](https://i.imgur.com/ygSR35n.png)

> * If you happen to make a mistake and added the wrong file or no longer want to add it you can hit the ``-`` sign to remove it.
> ![](https://i.imgur.com/0JnxTHd.png)

> * If desired you can also discard all the changes made to the file altogether by hovering over the file and clicking on the return arrow once it has been removed from the staged changes.

> ![](https://i.imgur.com/Kx7OH88.png)

5.  After checking and adding all the files you would like, you can double-check all files that are staged by using the command ``git status`` or looking at the Staged Changes header in the Git GUI sidebar.
![](https://i.imgur.com/xuGOJYC.png)

6. You can now proceed with the regular process and use the commands``git commit -m "changes made"``, ``git fetch upstream``, and ``git push`` outlined in the [contributing wiki](https://github.com/hackforla/website/blob/gh-pages/CONTRIBUTING.md#step-6-work-on-an-issue-using-git)




