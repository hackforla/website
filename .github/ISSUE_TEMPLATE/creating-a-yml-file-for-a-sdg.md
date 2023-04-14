---
name: Creating a yml file for a SDG
about: Creating a yml file for a SDG (Sustainable Development Goal)
title: Creating a yml file for SDG [INSERT SDG NUMBER HERE]
labels: 'Complexity: Small, p-feature: SDGs, role: front end, size: 0.25pt'
assignees: ''

---

### Overview
We want to create a yml file for a Sustainable Development Goal (SDG) so that information is not repeated in multiple files.

### Action Items
- [ ] In `_data/internal/sdg`, add a file called `sdg[INSERT SDG NUMBER HERE].yml`
- [ ] In the file you just created, add the following:
```
# The Sustainable Development Goal (SDG) number (e.g. 16)
sdg: [INSERT SDG NUMBER HERE]
# The SCSS color variable that matches the color of the SDG image 
color-variable: [INSERT COLOR VARIABLE HERE]
# The path to the SDG image
image: [INSERT IMAGE PATH HERE]
# The alt text for the SDG image
image-alt: [INSERT ALT TEXT HERE]
targets:
    # The SDG target (e.g. 1, 2, or a, b, ...)
  - target: [INSERT SDG TARGET HERE]
    # The SDG target statement 
    statement: [INSERT SDG TARGET STATEMENT HERE]
  - target:
    statement:
  - target:
    statement:
```

### Resources/Instructions
- [_data/internal/sdgs](https://github.com/hackforla/website/tree/gh-pages/_data/internal/sdgs)
- This issue is tracked in epic #4153
