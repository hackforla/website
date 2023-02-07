---
name: 'Project md file: Removing unused `alt-hero` field'
about: Issue template for removing unused `alt-hero` field from a project md file
title: Remove unused `alt-hero` field from [INSERT FILE NAME HERE].md project file
labels: 'P-Feature: Project Info and Page, role: back end/devOps, role: front end,
  Size: Good second issue, size: 0.5pt'
assignees: ''

---

### Overview
As a developer, I want to make sure unused code is removed from the codebase in project cards so that
- time to load the website is as low as possible,
- it's easier to understand the code, and
- time to review the code is reduced.

### Details
In project md files, `image-hero` is a decorative background image and `alt-hero` is the alt text associated with `image-hero`. However, `alt-hero` text is not used anywhere in our codebase since the `image-hero` is used as an SCSS background image.

Moreover, if the `image-hero` were to be used in an img HTML tag in the future, the alt text for all the `image-hero` images would be `alt=""`, which could be set programmatically for all the alt properties associated with each `image-hero`.   

### Action Items
- [ ] For the file `_projects/[INSERT FILE NAME HERE].md`, remove line [INSERT LINE NUMBER HERE] for the alt-hero
```
alt-hero: [INSERT CURRENT ALT-HERO TEXT HERE]
```
- [ ] Once the pull request associated with this issue is approved and merged, please update and edit epic #2722 by
  - [ ] Checking off the dependency for this issue
  - [ ] If all dependencies are checked off, please move issue #2722 to the New Issue Approval column and remove the Dependency label

### Resources/Instructions
- This issue is part of epic #2722 

#### File and code links you will need to work on this issue
- Directory to find the page once you have it in your IDE: `_projects/[INSERT FILE NAME HERE].md`
- Click on the link below to see the source file code:
[INSERT PERMALINK TO THE LINE OF CODE HERE]

<!-- To see an example of a permalink for a line of code, uncomment the line below -->
<!-- https://github.com/hackforla/website/blob/598f33399cc81f3e095fe047a726eca09a595465/_data/internal/credits/act.yml#L4 -->

#### Information about WCAG
- [WCAG](https://www.w3.org/WAI/standards-guidelines/wcag/)
- [Web Accessibility Tutorials: Decorative Images](https://www.w3.org/WAI/tutorials/images/decorative/)
