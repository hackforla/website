## **Overview**

We are standardizing the buttons, page cards, and other reusable components across all pages on the HfLA website. This is to:

1. Prevent the slight differences we found between components on different pages during our site audit
1. Make the site’s code more scalable and easier to manage
1. Help designers pull from existing standard designs when creating new pages
1. Help developers build new pages with existing styles instead of starting from scratch on each new page

We are following bootstrap and other class standards and naming conventions, as well as input from the HfLA team.

This is a work in progress and we want to make sure this is actually useful and usable, so please feel free to provide any feedback on the #hfla-site slack channel or DM **@daniellenedivi** who worked on the design system.

<br />

### **Reusability**

<br />

To make our reusable components available across the site, we made their CSS classes more universal and less page-specific. 

These reusable classes now live in common .scss files (`_buttons,scss`,  `_page-cards.scss`,  etc), instead of in specific pages’ scss files (`_wins-page.scss`, etc), to make them easier to find and available for all pages.

<br />

![Image of Buttons CSS Code](https://i.imgur.com/nWaiLaw.png)

<br />

Each of the reusable components on our site now have several class names - one for their size, one for color, etc. This way if any style changes need to be made later on - i.e. to change every pink button to blue - the change can be made only to the CSS color class and will update all of the buttons that share that class, without having to edit every single button’s unique class separately. 

For this reason the class names are also more generic. Similar to Bootstrap, the button class related to color is called .btn-primary instead of .btn-pink to allow for future color changes.

Now the style of a specific button is also easy to quickly adjust, by switching class names in the html depending on the component size, color, etc. that you want. If you want to switch from a pink to a black button, change the class names attached to that button in the HTML from `.btn-primary` (pink) to `.btn-dark` (black).

<br />

![Example of standardized button CSS classes ](https://i.imgur.com/btlqxzC.png)

<br />

Reusable component class names include:

* **Base class:** used in every single instance of a component, this is the foundational class with properties they all share (ex: `.btn`, `.page-card`)

* **Size class:** from xs to xl, this class sets and relates to the size of the component (ex: `.btn-xl`, `.page-card-lg`)

* **Color class:** Sets the color of the component (ex: `.btn-primary`, `.page-card-secondary`)

* **Page-specific class:** Includes any features that are unique to a component on a specific page - usually its placement (ex: `.btn--about-us`)

Additional standard classes may be added in the future as new components and variations are created.

<br />

## **Getting started** 

Insert all of the class names that apply to the button component you are building in HTML. This often leads to a long list of classes, but this is common when working with reusable components.

<br />

### **Base class**

<br />

Start with adding the base class of the component. Using buttons as an example, the base class `.btn` should be used in all buttons and includes the properties they all share, no matter the size or color:

<br />

![Base button CSS class](https://i.imgur.com/i3feJ3w.png)

<br />

Next, add the standard button classes (that currently relate to **color** and **size**) :

<br />

### **Size Class**

<br />

Continuing with the button example, the size classes `.btn-xl`, `.btn-lg`, `.btn-md` etc. should be used depending on the standard size of the button in the page you are developing:

<br />

![Button Size Classes](https://i.imgur.com/nmo4cJc.png)

<br />

### **Color Class**

<br />

The color classes `.btn-primary`, `.btn-primary-on-dark`, and `.btn-dark` etc. should be used depending on the color of the button in the page you are developing:

<br />

![Button Color Classes](https://i.imgur.com/irAoLiZ.png)

<br />

### **Page-Specific Class**

<br />

Finally, add the page-specific class name, which in this case usually relates to the placement of the button on the page. The class naming standard `.btn--page-name` should be used in the dedicated scss file for a specific page, for instance in `_wins-page.scss`. 

If there is more than one type of the same component in a page and they both require different page-specific classes, the class names can also include more specifics about the components- i.e. `.btn--wins-page-submit` and `.btn--wins-page-survey`.

<br />

![Page-specific button class](https://i.imgur.com/riRgHgj.png)

<br />

In the end, the classes you selected and added to your component in HTML should look something like this:

<br />

![Example of standardized button CSS classes ](https://i.imgur.com/btlqxzC.png)
