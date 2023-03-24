---
name: Creating a yml file for a SDG
about: Creating a yml file for a SDG (Sustainable Development Goal)
title: Creating a yml file for SDG [INSERT SDG NUMBER HERE]
labels: 'Complexity: Small, Feature Missing, role: front end, size: 0.25pt'
assignees: ''

---

### Overview
We want to create a yml file for a Sustainable Development Goal (SDG) so that information is not repeated in multiple files.

### Action Items
- [ ] In `_data/internal/sdgs`, add a file called `sdg[INSERT SDG NUMBER HERE].yml`
- [ ] In the file you just created, add the following:
```
# The Sustainable Development Goal (SDG) number (e.g. 16)
sdg: [INSERT SDG HERE]
# The color name of the SDG image. This is based on its associated color variable without the `$color-` portion. For example, SDG 16's color variable is $color-royalblue, so its color would be royalblue. 
color: [INSERT COLOR HERE]
# The path to the SDG image
image: [INSERT IMAGE PATH HERE]
# The alt text for the SDG image
image-alt: [INSERT ALT TEXT HERE]
targets:
  # The SDG target (e.g. 8) and its statement in key-value pair format.
  [INSERT TARGET HERE]: [INSERT STATEMENT HERE]
```

### Resources/Instructions
- [_data/internal/sdgs](https://github.com/hackforla/website/tree/gh-pages/_data/internal/sdgs)
- This issue is tracked in epic #4153
