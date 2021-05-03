Hack for LA uses [Jekyll](https://jekyllrb.com/), which is a Content Management System (CMS), to generate the HfLA website. In a nutshell, Jekyll takes a bunch of building blocks (HTML, SCSS, and Markdown), and compiles (organizes/combines) these building blocks into the many pages that you see on the site.

This guide provides a description of the folders and files in the [Hack for LA Website repository](https://github.com/hackforla/website) and how to work with them. 

**Helpful documentation if you're new to Jekyll or front-end development:**
* [Jekyll](https://jekyllrb.com/docs/step-by-step/01-setup/) - the CMS we're using
* [Liquid](https://shopify.github.io/liquid/tags/control-flow/) - a templating language used to program Jekyll's HTML output
* [Markdown](https://markdown-guide.readthedocs.io/en/latest/) - a plain text markup language used in .md files, which Jekyll converts to HTML format
* [Sass](https://sass-lang.com/documentation) - a stylesheet language used in .scss files, which Jekyll compiles into CSS

**If you're ready to skip to creating a page:**
[Creating a page for Hack for LA](https://github.com/hackforla/website/wiki/How-to-create-a-page-on-Hack-for-LA-website) 

### Contents: 
1. [Repository Overview](#repository-overview)
    1. [Configuration Files](#configuration-files)
    2. [Jekyll Folders](#jekyll-folders)
    3. [Collections Folders](#collections-folders)
    4. [Other Asset Folders](#other-asset-folders)
    5. [Pages](#pages-files)
    6. [Redirections](#redirections)
1. [Collections](#collections)
2. [Includes](#includes)
3. [Projects](#projects)
4. [Guide Pages](#guide-pages)
5. [Styling](#styling)
6. [API Endpoints](#api-endpoints)

## Repository Overview
### Configuration Files
* [_config.yml](https://github.com/hackforla/website/blob/gh-pages/_config.yml): stores *site-wide* configuration data (variables). This may be: 
    * information that Jekyll uses to render our site (for example: whether pages should be accessed as page.html or page/), or
    * information we can use on web pages using Liquid. (See the [Jekyll documentation](https://jekyllrb.com/docs/liquid/) and [Liquid reference](https://shopify.github.io/liquid/tags/control-flow/) for more information on Liquid.)  
For example, ```title: Hack for LA``` sets "Hack for LA" as the value for the variable ```title```. We can use the Liquid tag ```{{ site.title }}``` in our HTML, and Jekyll will output "Hack for LA" at that location.  

* [_.gitignore](https://github.com/hackforla/website/blob/gh-pages/.gitignore): Tells git which files shouldn't be tracked for changes. Most if not all repos have a .gitignore file. You probably won't need to touch it unless you're a lead dev. 
.dockerignore has a similar function.

* [CNAME](https://github.com/hackforla/website/blob/gh-pages/CNAME): part of the setup that allows the domain name "hackforla.org" point to our repo on the GitPages servers. You don't need to touch this.

### Jekyll Folders
Standard Jekyll builds include the following folders:
* _site/: When you run Jekyll on your local machine (e.g., using Docker), Jekyll compiles your local code and outputs the website to _site/. Note that _site/ is listed in .gitignore and doesn't exist on the github repo - it's only there for your local viewing. Don't edit code in the site folder; nobody will be able to see your hard work.

* [_data/](https://github.com/hackforla/website/tree/gh-pages/_data): Data files (possible formats include CSV, JSON, XML) can be stored here, and referenced in pages using Liquid via ```site.data.[filename]```
    * [Navigation](https://github.com/hackforla/website/tree/gh-pages/_data/navigation): Contains yml files for the navigation bar for different sections of the home page/individual site pages, as well as social media links. 
    * Github-data.json: Contains contributor information for each project, which is automatically pulled from Github.
    
* [_includes/](https://github.com/hackforla/website/tree/gh-pages/_includes): Best place to put HTML building blocks that are repeated on multiple pages.
    * Forms: Includes HTML files for the Contact Us section and a generic sign up form (for email subscriptions). The Contact Us form can be edited to change the look of the section on the home page.
    * Svg: Contains svg files for all the icons used on the site.
    * The remaining HTML files correspond to various HTML snippets seen on every page of the site. When the Liquid tag (i.e. ```{% include [filename].html %}```) is used in a page file (HTML or Markdown), the content from the included HTML snippet gets pulled in at that point. For more details on each include, see the [Includes](#includes) section below. 
    
* [_layouts/](https://github.com/hackforla/website/tree/gh-pages/_layouts): A .md or HTML file can call a layout in its front matter (the section between the ```---``` bars). The Layout determines the HTML shell of the page. The content of the .md file (anything after the front matter) gets inserted into the shell at the point where the layout says ```{{ content }}```. We use layouts when we want different pages to have the same overall shell (e.g., header, footer, etc.).
    1. ```default.html```: layout used for most pages (including project pages). Includes page elements such as the head, header, and footer, which are pulled from the _includes folder.
    2. ```guide-pages.html```: is based on the default layout, and sets additional layout for the header content - such as the hero image, title of the page, description of the page, and a list of contents. (See additional details in the [Guide Pages](#guide-pages) section).
    3. ```project.html```: is based on the default layout, and sets additional layout and styling for individual project pages. (See additional details in the [Projects](#projects) section).
    4. ```redirect.html```: includes the header and footer HTML files, as well as a message to the user that they are being redirected to an external page. This layout is primarily used for our surveys, which uses Google Forms.

### Collections Folders
[Collections](https://jekyllrb.com/docs/collections/) are always folders with a preceding underscore (_), and are used to group related content. Usually the items in a collection are .md files. Jekyll is able to process items in a collection iteratively - for example, ```_projects/``` contains an .md file containing information for each H4LA project. With just a few lines of Liquid code on our front page file, we're able to publish information for our 20+ projects.

To use a collection, it must be defined in the _config.yml file, under the ```collections:``` section. Set ```output: true``` if and only if you want Jekyll to generate separate HTML pages for each item within the collection. Output is set to true for the Project pages, because we want each Project to have its own page.  
    ![image](https://user-images.githubusercontent.com/49918375/82394442-e9697680-99fd-11ea-9862-d6835e81ed66.png)

See [Collections](#collections) for an explanation of each collection.

### Other Asset Folders
* [_sass/](https://github.com/hackforla/website/tree/gh-pages/_sass): All sass (.scss) files are imported to the ```main.scss file```, which Jekyll processes into a single stylesheet, ```main.css```, which defines all the styles used on the site. 
    * [_sass/components/](https://github.com/hackforla/website/tree/gh-pages/_sass/components): Because each page has at least some own custom styling, page-specific .scss files live in this subdirectory.
    * For more information on styling, see the [Styling](#styling) section).
* [assets/images/](https://github.com/hackforla/website/tree/gh-pages/assets/images): All images displayed on the website are stored in this folder. Each project or page has a subfolder for slightly better organization.
* [assets/js/](https://github.com/hackforla/website/tree/gh-pages/assets/js): Externally-referenced javascripts can live here.  
    * One of the files is for the Action Network API, Hack for LA is currently using Action Network to collect and maintain emails for users who are interested in receiving updates and Hack for LA's email subscription. 
    * The second file is for the Google Calendar API, which currently redirects to Google Calendars, displaying Hack Night events (which are currently held remotely). 

### Pages

All pages that aren't automatically generated within a Collection are organized in this directory.

* [index.html](https://github.com/hackforla/website/blob/gh-pages/pages/index.html): is where all the sections (i.e. project cards, about, contact, etc.) of the home page are laid out. The files that are "included" are from the ```_includes``` folder. Note: You'll also notice there is this condition ``` {% assign remote-only = 'true' %} ```:
    
    ![image](https://user-images.githubusercontent.com/49918375/82394556-39e0d400-99fe-11ea-99a2-5cf3525a5f56.png)

    This is here to filter between two views - one displaying Hack Nights (when we do have in-person meetings), and one without (to accomodate for working remotely due to Covid-19). 

* [getting-started.html](https://github.com/hackforla/website/blob/gh-pages/pages/getting-started.html): The 'Getting Started' button on the home page leads to this page. Thus, this HTML file is using the default layout. The page is divided into four sections/cards, including the introduction, Self Onboarding, Guided Onboarding, and the Once you have joined a team section. 
* [project-meetings.html](https://github.com/hackforla/website/blob/gh-pages/pages/project-meetings.html): New Volunteers on the 'Getting Started' page are prompted to check the 'Team Meeting Overview' page. <br>
    ![image](https://user-images.githubusercontent.com/49918375/83339948-a6be5e80-a287-11ea-8e5f-2d3344c681cd.png) <br>
The link will lead to the ```https://www.hackforla.org/project-meetings``` page.

    The Project Meetings page is similar to the 'Getting Started' because they are standalone HTML files that are deployed as their own page (unlike project pages which derive their information from markdown files). 

    Currently, the page is generated through a two-step process to load the meeting times. We're doing this process in two-steps to ensure that the user will always see a page loaded with meeting times. Otherwise, the page may indicate that there are no meetings available as a placeholder message while the page is loading, despite the actual meeting information. 
1. The first step in the process is to load the page using a static JSON file,  [project-meetings-from-vrms.json](https://github.com/hackforla/website/blob/gh-pages/_data/project-meetings-from-vrms.json) in the ```_data``` folder. The logic ```{% assign localData = site.data.project-meetings-from-vrms | jsonify %}``` is pulling information from the static JSON file located in the data folder and converting the JSON into a more usable form, then loading the information onto the page using DOM manipulation, all executed within the ```schedule``` function.<br><br>
    ![image](https://user-images.githubusercontent.com/49918375/83339970-ec7b2700-a287-11ea-8b09-fbfd8ab87c9d.png)

2. The next step is to check the information on the loaded page with up-to-date information from VRMS. The data is being pulled from [https://www.vrms.io/api/recurringevents](https://www.vrms.io/api/recurringevents). After the data is fetched from the API url, the information inside the new JSON is also converted into a usable form, is checked for differences between the static JSON that was initially loaded onto the page, and any differences that were found will be replaced with the updated VRMS information. <br><br>
![image](https://user-images.githubusercontent.com/49918375/83339985-0caae600-a288-11ea-9af2-182a5af21590.png)

**Return to [Contents](#contents)** 
<br><br>

### Redirections
The .md files in this directory are converted to placeholder HTML files, which automatically redirect the viewer to another page. Each file uses the redirect layout (called in the front matter) and includes a custom front matter tag, ```redirect-to```, that specifies the destination URL. The redirect layout then calls this tag using e.g.,```<a href="{{ page.redirect_to }}">```.
    ![image](https://user-images.githubusercontent.com/49918375/83370867-72c16700-a375-11ea-955b-79a6672c6307.png)

The ```redirect.html``` layout file also includes code for the Google Analytics API, in order to analyze user interaction with redirected pages.  

The files using the redirect layout include: 
* ```conduct.md```: links to Hack for LA's Code of Conduct 
* ```donate.md```: links to https://www.codeforamerica.org/donate
* ```github.md```: Hack for LA's Website Github page
* ```meetup.md```: Hack for LA's Meetup page
* ```nationalday.md```: Hack for LA's 2019 Day of Civic Hacking
* ```slack.md```: Hack for LA's Slack 
* ```survey.md ```files: redirects to various Google Forms surveys
* ```calendar.md```:  redirects to Hack for LA's Google Calendar with workshops that run outside of regular Hack Nights. These workshops are currently onhold, due to Covid-19, with the possibility of being held remotely. 

### Github-related folders

* [.github/](https://github.com/hackforla/website/tree/gh-pages/.github/): holds a couple of files that interact with the Github API and help us keep our repo secure and up to date.
* [github-actions](https://github.com/hackforla/website/tree/gh-pages/github-actions): includes a couple of scripts
    * ```action.yml```: contains front matter for pulling Github API data into a JSON with information relating to project contributors and languages used.
    * ```get-project-data.js```: script to run Github API.
    * ```package-lock.json```: JSON with project contributors and languages used in each project.
    * ```package.json```: JSON for dependencies.

## Collections

*help us out by making .md templates in the wiki and linking them here*

* [Hack-Nights](https://github.com/hackforla/website/tree/gh-pages/_hack-nights): Locations for Hack for LA's in-person meetings (before Covid-19).
* [Press](https://github.com/hackforla/website/tree/gh-pages/_press): Press releases related to Hack for LA. The markdown files include front matter for the link, title, and source of the article. The press.html in the includes folder uses Liquid to extract the front matter from these markdown files to display this information onto the home page.
* [Projects](https://github.com/hackforla/website/tree/gh-pages/_projects): Each markdown file represents each project listed on the home page's Projects section. (See additional details in the [Projects](#projects) section). [TEMPLATE](https://github.com/hackforla/website/wiki/Template-of-a-project.md-file)
* [Sponsors](https://github.com/hackforla/website/tree/gh-pages/_sponsors): Hack for LA's Sponsors, and include each sponsor's name, link, logo, and order/position to be displayed on the webpage. 
* [Testimonials](https://github.com/hackforla/website/tree/gh-pages/_testimonials): Includes Mayor Garcetti's testimonial of Hack for LA's amazing work! :)
* [Guide Pages](#guide-pages): Markdown files in the Guide Pages folder represent each guide page. The guide pages are structured using the ```guide-page.html``` layout (to consistently format the header content) with additional HTML under the front matter to display content unique to each page. (See additional details in the [Guide Pages](#guide-pages) section).
* [Credits](https://github.com/hackforla/website/tree/gh-pages/_credits): If you use an image that was generated by someone else, credit them here. [TEMPLATE](https://github.com/hackforla/website/wiki/Template-of-a-credit.md-file-(for-Credits-page))
* [Communities](https://github.com/hackforla/website/tree/gh-pages/_communities): for Communities of Practice groups. [TEMPLATE](https://github.com/hackforla/website/wiki/Template-of-a-communities.md-file-(for-Communities-of-Practice-page))

**Return to [Contents](#contents)** 
<br><br>

## Includes
* ```about.html```: Includes description of Hack for LA for the About section on the home page.
* ```calendar.html```: (Currently disabled) Contains upcoming events.
* ```current-projects.html```: Populates the project cards' markdown files (from the ```_projects``` folder onto the home page in the order of project status and project names. 
* ```footer.html```: Footer navigation bar, includes social media links which are populated from the front matter located in [_data\navigation\social.yml](https://github.com/hackforla/website/blob/gh-pages/_data/navigation/social.yml). 
* ```hack-nights.html```: (Currently disabled) Displays weekly Hack Nights information. Hack Night location and other information are populated from the [_hack-nights](https://github.com/hackforla/website/tree/gh-pages/_hack-nights) folder. 
* ```head.html```: Includes page title and API scripts for Google Analytics and Hotjar. Google Analytics is the primary analysis tool, but our legacy tool, [Hotjar](https://www.hotjar.com/) provides us heatmaps of the Home page and the Getting Started page.
* ```header.html```: Includes Hack for LA's logo, navigation bar, ```main-nav.html``` and social media links/icons ( ```social.html```). 
* ```hero.html```: Introduction to Hack for LA on the home page.
* ```home-getting-started.html```: 'Getting Started' button linking to the Getting Started page. There are two of these buttons, one located beneath the hero introductory message and one located in the 'Contact Us' section on the home page. 
* ```main-nav.html```: Navigation bar with page links and icons, information is flowing from front matter located in [_data\navigation\main.yml](https://github.com/hackforla/website/blob/gh-pages/_data/navigation/main.yml). The ```main-nav.html``` is embedded inside ```header.html```.
* ```press.html```: Populates Press information such as the article title, news source, and link from the markdown files in the ```_press``` folder. 
* ```project-card.html```: Populates the relevant information for each project card based on the project's markdown file. More details in the [Projects](#projects) section. 
* ```resource-card.html```: Populates the 'Getting Started' panel on individual project pages. The Liquid in the code is determining what resources the project is using, and looking up the corresponding svg icon in the [_includes\svg](https://github.com/ye-susan/website/tree/gh-pages/_includes/svg) folder. 

    ![image](https://user-images.githubusercontent.com/49918375/82748391-4777c000-9d56-11ea-89d2-5a089db78286.png)

* ```social.html```: Populates linked social media icons in the header navigation bar. The front matter comes from [_data\navigation\social.yml](https://github.com/hackforla/website/blob/gh-pages/_data/navigation/social.yml).
* ```sponsors.html```: Populates linked icons for Sponsors on the home page. 


**Return to [Contents](#contents)**
<br><br>

## Projects
### Structure of the Project Cards and Project Pages

1. See the [index.html](https://github.com/hackforla/website/blob/gh-pages/index.html) located in the root directory.
This is where all the sections (i.e. project cards, about, contact, etc.) of the home page are laid out. You'll see the following code:
    
    ![image](https://user-images.githubusercontent.com/49918375/82393021-2469ab00-99fa-11ea-88a9-7b3c4766d073.png)

    All the items listed after '{%- include ' are individual HTML files for each separate section, located in the '_includes' folder, which is standard in Jekyll. 

2. If you follow the link to [current-projects.html](https://github.com/hackforla/website/blob/gh-pages/_includes/current-projects.html) in the ```_includes``` folder, you'll see that it contains a looping structure for displaying the project cards. The projects are sorted based on the front matter (by status and project name) determined in each individual project's markdown file located in the ```_projects``` folder.

    a) The primary level of sorting places the projects that are "Active" first, followed by "Rebooting", "Completed", and "On-Hold", in this order.

    b) The secondary level of sorting is alphabetically by the projects' name, so projects are sorted alphabetically within each status group.
    For example, the ordering of projects would look like this: 

    1. 311-Data (Status: Active)
    2. Civic Tech Index (Status: Active)
    3. Write for All (Status: Active)
    4. Food Oasis (Status: Rebooting)

    Projects with the front matter ```hide: true``` will not appear on the home page.

3. Front matter/information for each project is located in the [_projects](https://github.com/hackforla/website/tree/gh-pages/_projects) folder. This folder contains the markdown files for each project. To update status, location, leadership, links, recruiting, and other information - simply edit the front matter (the information between the  ```---```. This information will flow through to the project cards as well as the project pages. See the [Template of a project.md file](https://github.com/hackforla/website/wiki/Template-of-a-project.md-file) for more detail. 

4. To update logic, styling, and layout of ALL **project cards**, see the [project-card.html](https://github.com/hackforla/website/blob/gh-pages/_includes/project-card.html) in the _includes file. All the information extracted through the Liquid logic is coming from the markdown files in the ```_projects``` folder. Specifically, the following information is being extracted: 
    * Project image link (actual images are stored in the [asset\images\projects](https://github.com/hackforla/website/tree/gh-pages/assets/images/projects) folder)
    * Project name and link to project page
    * Status of project
    * Project links (i.e. Github, website, Slack, etc.)
    * Project partner (if any)
    * Roles that the project is looking for (if the project is active or rebooting)
    * Project location, and
    * Technologies used for the project

5. To update the logic, styling, and layout of ALL **project pages**, see [project.html](https://github.com/hackforla/website/blob/gh-pages/_layouts/project.html) layout in the _layout folder. For a walk-through of the project layout, see the [Guide to the Project Layout](https://github.com/hackforla/website/wiki/Guide-to-the-Project-Layout-File).

**Return to [Contents](#contents)** 
<br><br>

## Guide Pages
The guide pages are a collection of pages that use the ```guide-page.html``` layout to format the header content. 

![image](https://user-images.githubusercontent.com/49918375/86847713-9c9b3700-c061-11ea-9be9-27753e729542.png)

The header content uses the front matter in the markdown files from the _guide-pages folder to populate the title, description of the page, and the list of contents. An example of the markdown file is show below: 
```
---
title: Getting the Most Out of GitHub Issues
description: Each of Hack for LA’s GitHub project repositories (repos) use <a href="https://guides.github.com/features/issues/">issues</a> to track and organize ideas, enhancements, and tasks. All team members will use GitHub issues to communicate in our multifunctional teams. <br><br> When creating a new GitHub issue, the following tips will help you provide consistent formatting, a clear and concise overview, actionable tasks, explanatory resources, and resumé items to add value for all volunteers. <br><br>        <em>All GitHub Issues use <strong>markdown</strong> for formatting. View GitHub’s <a href="https://guides.github.com/features/mastering-markdown/">Mastering Markdown</a> for a simple guide.</em>
in-this-guide: 
  - name: Example of a Good End-to-End Issue
    link: '#example-issue'
  - name: Issue Sections - Description and Tips
    link: '#issue-sections'
  - name: Issue Template
    link: '#issue-template'
  - name: Member Analytics
    link: '#member-analytics'
---

<HTML CODE GOES HERE>
```

HTML is placed after the front matter to populate the content, as each guide page is uniquely structured. In the ```guide-pages.html``` layout file, you'll see 
```{{ content | markdownify }}```, which is a Liquid filter that helps with converting the code below the front matter into HTML. 

To help keep the guide page elements consistent and DRY, styling for the majority of elements have been created in the ```_guide-pages.scss``` file, and are demonstrated below. Please note the tags and classes used as you create your guide page. 



![image](https://user-images.githubusercontent.com/49918375/86847740-af157080-c061-11ea-829e-3fa1ad5edf60.png)
![image](https://user-images.githubusercontent.com/49918375/86416674-72bbcc00-bc7f-11ea-8add-47c92c66639f.png)
![image](https://user-images.githubusercontent.com/49918375/86416685-7a7b7080-bc7f-11ea-99de-087ce01be6ec.png)

To add unique formats or styles, create a Sass file inside the ```_sass/components/guide-pages``` folder, with a name that corresponds to your markdown file. Don't forget to import your new Sass file in the main  ```_sass/main.scss``` file with the other guide pages.

To add images, or to reuse images (such as arrows), see the 
```assets/images/guides``` folder. Create a folder to add the images for your guide page.

**Return to [Contents](#contents)** 
<br><br>

## Styling
If you're new or unfamiliar with SASS, take a look at these links below: 
1. [Sass in Jekyll](https://jekyllrb.com/docs/assets/)
2. Sass Language: [Sass Basics](https://sass-lang.com/guide) and [Documentation](https://sass-lang.com/documentation)


#### Why Sass?
* (From Sass Basics Guide): "Sass lets you use features that don't exist in CSS yet like variables, nesting, mixins, inheritance and other nifty goodies that make writing CSS fun again."

#### Sass Basics Summary
* Variables: CSS values can be stored in variables, variables are denoted with ```$```.
* Nesting: CSS selectors can be nested in a similar hierarchy as HTML.
* Partials: Partial Sass files are snippets of CSS that you can include in other Sass files. It can be used with the ```@use``` rule and the name of a partial must be prefixed with an ```_```, doing so notifies Sass that it is a partial file, as to prevent it from being generated into a CSS file.
* Modules: Modules can also be used with the  ```@use``` rule (you can pass in the module name without the extension: i.e. ```@use 'example'; ```). The rule also allows you to use the variables, mixins, and functions of the module passed in.
* Mixins: Similar to variables, mixins are a good way to keep code DRY. However, instead of using a variable to store a small piece of information, mixins are used to store chunks of code to be reused over and over. Mixins can be used with ```@include mixin-name```. A good use of mixins would be to store values for vendor prefixes.
* Extend/Inheritance: The use of ```@extend``` allows you to share a set of CSS properties from one selector to another. A selector that is to be shared will be prefixed with ```%```.
* Operators: Sass allows the use of standard math operators such as +, -, *, /, and %.

### Styling Files
All of Hack for LA's styling files are contained in [_sass](https://github.com/hackforla/website/tree/gh-pages/_sass).
1. [Main.scss and Normalize.scss Files](#main.scss-and-normalize.scss-files)
3. [Components](#components)
4. [Elements](#elements)
5. [Layouts](#layouts)
6. [Variables](#variables) 

#### Main.scss and Normalize.scss Files
```Main.scss``` is the primary file that imports all the other stylesheets within the various subfolders contained in the main ```_sass``` folder. It is also the file that Jekyll will use to compile into CSS within the ```_site``` folder. 

```Normalize.scss``` helps normalize styling across all browsers to preserve consistency.

#### Components
This folder contains stylesheets for specific pages or page components. Any styling that is unique to a page or component should be made in these stylesheets.

#### Elements
The elements folder contains the reusable styles for basic elements of a page such as the base of a page (including styles for elements that may be included in a page such as images), buttons, forms, icons, lists, and typography. Please read about how to implement reusable components [HERE](https://github.com/hackforla/website/wiki/Standardized-Components).

#### Layouts
The layouts folder contains ```_main.scss``` which is different from the primary _main.scss, although it does act as a global file in that it affects all pages on the website. The styles within this ```_main.scss``` are used to push the footer to the bottom of the page. Also included in the layouts folder is the  ```_redirect.scss``` which makes adjustments to pages that use the 'redirect' layout.

#### Variables
The variables folder holds a list of variables that we use throughout the website. For example, the ```_colors.scss``` defines the various colors that are used in the site's color scheme. The ```_layout.scss``` file contains various width values for different screen sizes (i.e. mobile, tablet, desktop). The last file, ```_typography.scss``` defines the various styles for fonts and the styling of fonts based on HTML tags.

**Return to [Contents](#contents)**
<br><br>

## API Endpoints
This section aggregates all the API endpoints used throughout the project. 

1. **Project Meetings**<br>
    Project meetings display all the meetings times of each project team. Currently, it is using a static JSON file to load meeting times onto the page and then updating meeting times using an API linking to VRMS data. See the Files section for more information about [project meetings](#files).
2. **Project Languages**<br>
    While most information for a project is pulled from its markdown file, languages for projects are pulled from a project's Github API. See the [project layout wiki](https://github.com/hackforla/website/wiki/Guide-to-the-Project-Layout-File) for additional detail. 
3. **Project Contributors**<br>
    Similar to project languages, project contributors are also pulled from Github's list. Currently, the contributors list is showing members based on commits (individuals who have made more Github commits show up on top of the list). We are working on a way to use Github to also include members who contribute to discussions or project issues (i.e. UI/UX designers) without commiting code. See the [project layout wiki](https://github.com/hackforla/website/wiki/Guide-to-the-Project-Layout-File) for additional detail on how the contributor information is pulled from the API. 
4. **Action Network**<br>
    Hack for LA is currently using Action Network to collect and store an email subscription list for users who are interested in receiving updates from Hack for LA. The script for embedding the API into the sign up forms can be found in [assets\js\api-actionnetwork.js](https://github.com/hackforla/website/blob/gh-pages/assets/js/api-actionnetwork.js). The script is using the DOM to create and embed Action Network into the signup form, and sending any submissions to Action Network. 
5. **Hotjar**<br>
    [Hotjar](https://www.hotjar.com/) is a behavior analytics tool that we are using to analyze how visitors are interacting with the Hack for LA site. However, since the free tier of Hotjar provides 3 funnels, we are limited to tracking only Home page and the Getting Started page. We've also chosen to use Google Analytics in conjunction with Hotjar. The script for the Hotjar API can be found in the [head.html](https://github.com/hackforla/website/blob/gh-pages/_includes/head.html) file which sets the ```<head>``` for every site page. 
6. **Google Analytics**<br>
    Google Analytics is our primary tool for analyzing user interaction and traffic to the Hack for LA website. The script for the Google Analytics API can be found in the [head.html](https://github.com/hackforla/website/blob/gh-pages/_includes/head.html) file as well as the [redirect.html](https://github.com/hackforla/website/blob/gh-pages/_layouts/redirect.html) layout file, to ensure that every page will be analyzed. 
7. **Google Calendar**<br>
    Prior to Covid-19, we utilized Google Calendars to display recurring Hack Night events. Now that meetings and events are held remotely, the calendar is not being displayed. The script for embedding the Google Calendar can be found in [assets\js\api-calendar.js](https://github.com/hackforla/website/blob/gh-pages/assets/js/api-calendar.js).


**Return to [Contents](#contents)**
<br><br>
