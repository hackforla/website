---
name: Alt Text Audit - Dev
about: Developer template to update an alt text
title: "[INSERT PAGE HERE]: Update alt text for [INSERT IMAGE NAME HERE] image to
  adhere to WCAG"
labels: 'Feature: Accessibility, good first issue, ready for dev lead, role: back
  end/devOps, role: front end, size: 1pt'
assignees: ''

---

### Prerequisite
1. Be a member of Hack for LA. (There are no fees to join.) If you have not joined yet, please follow the steps on our [Getting Started page](https://www.hackforla.org/getting-started).
2. Please make sure you have read our **[Hack for LA Contributing Guide](https://github.com/hackforla/website/blob/gh-pages/CONTRIBUTING.md)** before you claim/start working on an issue.

### Overview
As a developer, we need to provide clear and descriptive alt text on the `[INSERT PAGE NAME HERE]` page so that we adhere to the Web Content Accessibility Guidelines (WCAG) and we can achieve our mission of inclusivity.

### Action Items
- [ ] Change the image alt property value within `[INSERT PATH OF FILE HERE]`:

**From:**
```
[INSERT ORIGINAL LINE OF CODE HERE]
```

**To:**
```
[INSERT NEW LINE OF CODE HERE]
```

- [ ] Ensure that the corresponding `[INSERT PAGE NAME HERE]` stays the same after the change
- [ ] Using developer tools to inspect the image, ensure that the new alt text gets incorporated after the change.
  - **Note:** `alt=""` in code while show up as `alt` when using developer tools to inspect the image's alt text property.

**For PM, Merge Team, or Tech Lead**
- [ ] Once the pull request associated with this issue is approved and merged, please update and edit epic #`[INSERT EPIC NUMBER HERE]` by
  - [ ] Checking off the dependency for this issue
  - [ ] If all dependencies are checked off, please move issue #`[INSERT EPIC NUMBER HERE]` to the New Issue Approval column and remove the Dependency label

### Resources/Instructions
- `[INSERT LINK TO WEBPAGE HERE]`

#### File and Code links you will need to work on this issue
- Directory to find the page in once you have it in your IDE: `[INSERT PATH OF FILE HERE]`
- Click on the filename below to see the source file code:
`[INSERT LINK TO THE SOURCE CODE HERE]`
- This issue is part of epic #`[INSERT EPIC NUMBER HERE]`

#### Background information about the Jekyll framework (optional reading)
- [Jekyll Data Files](https://jekyllrb.com/docs/datafiles/)
- [Jekyll Front Matter](https://jekyllrb.com/docs/front-matter/)

#### Information about WCAG and alt text (optional reading)
- [WCAG](https://www.w3.org/WAI/standards-guidelines/wcag/)
- [Web Accessibility Tutorials: Decorative Images](https://www.w3.org/WAI/tutorials/images/decorative/)
- [WCAG section on alt text](https://www.w3.org/WAI/WCAG21/Techniques/html/H37.html)
- [Alt text decision Tree ](https://www.w3.org/WAI/tutorials/images/decision-tree/)
- [FAE rule 4: alt text should be less than 100 characters](https://fae.disability.illinois.edu/rulesets/IMAGE_4_EN/)
