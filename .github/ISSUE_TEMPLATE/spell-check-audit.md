---
name: Spell check audit web page
about: For checking spelling on a code file that contains text displayed on the website
title: Run VS Code Spell Checker on [INSERT FILE HERE]
labels: 'Complexity: Small, feature: spelling, ready for dev lead, role: back
  end/devOps, role: front end, size: 0.5pt'
assignees: ''

---

### Overview
We need to audit HfLA codebase files for spelling errors using the Code Spell Checker extension in VS Code in order to ensure site quality. Results will be categorized as misspellings or false positives in the HfLA spelling audit spreadsheet[^1] and will be resolved in later issues.  

### Action Items
- [ ] You must use VS Code as your local text editor and install the `Code Spell Checker` VS Code extension[^2]  
- [ ] Do not change any configuration settings or make any spell corrections
- [ ] Open the file '[INSERT FILE PATH]' and note any Code Spell Checker errors
- [ ] Locate the file in column A ("File") of the "Page Audit" sheet. In the column labeled "Result Summary", select the appropriate option: `No errors` or `At least one error`.
- [ ] If at least one error was reported, copy/paste each cSpell message into a separate row in the `Results` sheet
- [ ] In each new row, select the appropriate value: `misspelling` or `false positive` from the "Result type" column. A false positive is a term that is not a misspelling but is not recognized by the spell checker because it is a technical term, abbreviation, acronym, URL or proper noun (name of a person, place or organization).
- [ ] Move this issue to the Questions/In Review column and apply the label `ready for dev lead`

### Merge Team
- [ ] After this issue is closed, release the dependency on this issue in #5248
- [ ] After the last dependency has been released, close that issue

### Resources/Instructions
- This issue is part of #5248
[^1]: [HfLA spelling audit spreadsheet - Results](https://docs.google.com/spreadsheets/d/1c2C9zUF_LsLGrnJN_LAlPV4UObz-nYffJyOiB_M6oI0/edit#gid=69989048)
[^2]: The recommended installation method is to install Code Spell Checker directly from the VS Code text editor, and those instructions can be found [here](https://code.visualstudio.com/learn/get-started/extensions). The extension can also be installed via the VS Code Marketplace website [here](https://marketplace.visualstudio.com/items?itemName=streetsidesoftware.code-spell-checker).
