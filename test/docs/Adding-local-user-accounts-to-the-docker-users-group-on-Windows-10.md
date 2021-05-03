This is applicable only if you are on Windows 10 and get the error message 'You are not allowed to use Docker, you must be in the "docker-users" group’ when trying to run Docker.

Check what Windows 10 edition you are using.

### For Windows 10 editions other than Home:
The instructions with images are found at this [link](https://icij.gitbook.io/datashare/faq-errors/you-are-not-allowed-to-use-docker-you-must-be-in-the-docker-users-group-.-what-should-i-do). The steps are as follows:
1. Search and open "Computer Management."
2. Go to "Local Users and Groups."
3. Go to "Users" and add yourself to the "docker-users" group.

### For Windows 10 Home edition
1. Open command prompt as an administrator. This is called elevated command prompt.
2. Run the following command, replacing USER with your own:
```net localgroup docker-users USER /add```

You're good to go!

### Extra notes
If you're curious as to why the instructions are different for Windows 10 Home, it's because [Windows 10 Home is the only edition of Windows 10 without the "Local Users and Groups" snap-in](https://stackoverflow.com/questions/41093714/why-local-users-and-groups-is-missing-in-computer-management-on-windows-10-home). Instead, access "User Accounts" following the instructions in this [link](https://www.tenforums.com/tutorials/6917-change-account-type-windows-10-a.html#option3). Note that this does not allow you to add a local user account to multiple groups, which is a problem because you want to remain a Standard User or an Administrator. What's funny is that [the first search result I found for how to add the same user to multiple groups](https://answers.microsoft.com/en-us/windows/forum/all/how-can-we-add-the-same-existing-user-to-multiple/41067af2-caee-4998-9e2b-373e51ffb1bd) got the response that the question was too complicated for the forum.

