### ## Contents
1. [Visible](#visible)
1. [Layout](#layout)
2. [Hero Image](#hero-image)
3. [Project Status](#Project-Status)
4. [Project Links](#Project-Links) 
5. [Tools and Technologies](#Tools-and-Technologies)
6. [Open Roles](#Open-Roles)
7. [Getting Started Button](#Getting-Started-Button)
8. [Getting Started Panel](#Getting-Started-Panel)
9. [Project Leadership](#Project-Leadership)
10. [Project Contributors](#Project-Contributors)
11. [Resource Card](#Resource-Card)

**JavaScript Code**

12. [Fetching Correct Project](#Fetching-Correct-Project)
13. [Adding Languages](#Adding-Languages)
14. [Constructing Team Card](#Constructing-Team-Card)
15. [Getting Started Drop Down](#Getting-Started-Drop-Down)
16. [Call to Action Message](#Call-to-Action-Message)
<br>

content markdownify - 
page.hero-image
looping thru that for leadership - variables defined in markdown 
for text underneath front matter, and content of blog post - markdownify would take all text outside of front matter and dump it into page
-take it out and test it to see if it braks or not, if everythingis ok - delete/remove it



_________________

### Visible
To include a page on the site's project listing, your card should contain the following line. If you do not want the project to be listed, change visible to "false".
```
---
visible: true
---
```
<br>

### Layout
The project layout incorporates the default layout, which contains the head, header, and footer elements.
```
---
layout: default
---
```
<br>

### Hero Image
If a hero-image for the project is available - the project markdown file will, for example, include: <br>

![image](https://user-images.githubusercontent.com/49918375/82959291-3a341e80-9f6c-11ea-853c-9c101afd6546.png)
which will be displayed on top of the project page. If the image is not available, an image of a color block will serve as its placeholder. When compiled, the color block will be shown as a gradient because a gradient effect has been styled into the project layout via [_project-page.scss](https://github.com/hackforla/website/blob/gh-pages/_sass/components/_project-page.scss). <br>

![image](https://user-images.githubusercontent.com/49918375/82959406-78c9d900-9f6c-11ea-8693-ad6f9301d9ad.png)<br>

 A note about image naming conventions: <br>
 In the ```assets\images\projects``` folder, you'll see the images for all the projects. Images for the project cards are named after the project itself, images to be displayed on the project page will have a ```-hero``` appended to the project name. Use ```-``` instead of spaces for projects with longer names: for example, ```food-oasis```.

![image](https://user-images.githubusercontent.com/49918375/82959339-533ccf80-9f6c-11ea-9d6a-0a42c98acd53.png)

```
{% if page.image-hero %}
    <header style='background: url({{ page.image-hero }}) center center no-repeat;' class='project-hero'>
{% else %}
    <header style='background: url(/assets/images/hero/hacknight-women.jpg) center center no-repeat;' class='project-hero'>
{% endif %}
        <h1 class='hero-inner'>{{ page.title }}</h1>
    </header>

<div class='content-section project-home-page'>
    <!--Project Description Card-->
    <div id='project-description-card' class='project-page-card' style='padding-bottom: 19px;'>
        <h4 style='color:#333'>Project Overview</h4>
        <!--Project Details-->
        <div class='project-page-description'>
```
<br>

### Project Status
Depending on the project status, the filter will change the status background-color according to the CSS in [_sass\components\_projects.scss](https://github.com/ye-susan/website/blob/gh-pages/_sass/components/_projects.scss) using the classes ```status-indicator``` and ```status-text``` (with 'text' being replaced with the status from the front matter declared in the markdown file).

![image](https://user-images.githubusercontent.com/49918375/82959466-a31b9680-9f6c-11ea-8074-6738279c9cf6.png)
![image](https://user-images.githubusercontent.com/49918375/82959493-b3cc0c80-9f6c-11ea-8913-a6137544a8b9.png)

```
            <!--Project Properties-->
            <div class='description-grid-item'>
                {% if page.status %}
                    <div>
                        <p style='display:inline-block'><strong>Status: </strong></p>
                        <div style='display:inline-block; float:none' class='status-indicator {{ "status-" | append: page.status }}'>
                            <h5 class='status-text'>{{ page.status }}</h5>
                        </div>
                    </div>
                {% endif %}
                {% if page.partner %}<p><strong>Partner: </strong>{{ page.partner }}</p>{% endif %}
                {% if page.location %}<p><strong>Location: </strong>{{ page.location }}</p>{% endif %}

```
<br>

### Project Links
The following code is for placing project links. First, we'll count the number of links listed in the markdown file. For lists over the length of 1, we'll add commas to the list, using the counter to keep our count and as to avoid adding a comma after the last link. This list is prioritizing Github and Site links for the Project Overview section of the project page. All other links are placed into the Resource section at the bottom of the project page.

![image](https://user-images.githubusercontent.com/49918375/82959595-f1309a00-9f6c-11ea-8c2f-8b44005a847c.png)

![image](https://user-images.githubusercontent.com/49918375/82748435-ae957480-9d56-11ea-88db-51b800164214.png)



```
                <!-- Links Logic to filter prioritized links and to correct comma placement -->
                {% if page.links %}
                    {% assign counter = 0 %}
                    {% for item in page.links %}
                        {% if item.name == 'GitHub' or item.name == 'Test Site' or item.name == 'Demo Site' or item.name == 'Site' %}
                            {% assign counter = counter | plus:1 %}
                        {% endif %}
                    {% endfor %}
                    {% if counter > 0 %}
                        <p>
                            <strong>Links: </strong>
                            {% for item in page.links %}
                                {% if item.name == 'GitHub' or item.name == 'Test Site' or item.name == 'Demo Site' or item.name == 'Site' %}
                                    {% if counter > 1 %}
                                        <a target="_blank" href='{{ item.url }}'> {{ item.name }}</a>,
                                        {% assign counter = counter | minus:1 %}
                                    {% elsif counter <= 1 %}
                                        <a target="_blank" href='{{ item.url }}'> {{ item.name }}</a>
                                    {% endif %}
                                {% endif %}
                            {% endfor %}
                        </p>
                    {% endif %}
                {% endif %}
```
<br>

### Tools and Technologies
The following code compiles the lists of the tools and technologies used in the project. As tools are in a string-list format in the front matter, there is no need for a loop. <br>
![image](https://user-images.githubusercontent.com/49918375/82959675-26d58300-9f6d-11ea-860e-20cdabdba570.png)

The technologies have to be looped through as they in the markdown list format, and an if condition is needed because not all projects have listed their technologies used. <br>
![image](https://user-images.githubusercontent.com/49918375/82959750-58e6e500-9f6d-11ea-9de7-b01d3722657c.png)

Lastly, languages are pulled from Github instead of the project markdown file. Therefore, a script for [Adding Languages](#adding-languages) is used instead.

```
                {% if page.tools %}<p><strong>Tools: </strong>{{ page.tools }}</p>{% endif %}
                <p id='languages'><strong>Languages: </strong></p>
                {% if page.technologies %}
                <p id='technologies'><strong>Technologies: </strong>
                  {% for tech in page.technologies %}
                    {{ tech }}{% if forloop.last == false %},{% endif %}
                  {% endfor %}
                </p>
                {% endif %}            
             </div>
```
<br>

### Open Roles
Description and open roles for the project, with open roles structured as list items. This list is pulling from the ```looking:``` front matter of the project markdown file.

<img src="https://user-images.githubusercontent.com/58455740/86554284-07cdf780-bf02-11ea-8ed6-5713a010d0b6.png" width="250px">
<img src="https://user-images.githubusercontent.com/58455740/86554282-06043400-bf02-11ea-9b86-2fe6b7065ebe.png" width="250px">


```
            <!--Project Summary and Getting Started Button-->
            <div class='description-grid-item'>
                <p>{{page.description}}</p>
                {% if page.status == "Completed" and page.completed-contact %}
                    <p>If you would like to talk to us about this completed project, please reach out to <a href="mailto:{{ page.completed-contact }}?subject=Question%20about%20{{ page.title }}">{{ page.completed-contact }}</a></p>
                {% elsif page.status == "Completed" %}
                    <p>If you would like to talk to us about this completed project, please reach out to <a href="mailto:team@hackforla.org?subject=Question%20about%20{{ page.title }}">team@hackforla.org</a></p>
                {% elsif page.looking %}
                <p class='open-roles'><strong>Open roles:</strong></p>
                <ul id='open-roles-list'>
                    {% for item in page.looking %}
                        <li><p class='role-paragraph'>{% if item.skill %}{{ item.skill }}{% endif %}</p></li>
                    {% endfor %}
                </ul>
                {% endif %}
            </div>
        </div>
```
<br>

### Getting Started Button
Getting started accordion panel button.<br>
 ![image](https://user-images.githubusercontent.com/49918375/82748464-eef4f280-9d56-11ea-8b43-19c1d8220e44.png)
```        
        <div class="getting-started">
            <p style='margin-bottom:0px; white-space: nowrap;'>Getting Started</p>
            <button onClick='gettingStarted()' class='getting-started-button'>
                {% include svg/_ionicons_svg_ios-arrow-down.svg %}
            </button>
        </div>
    </div>
```
<br>

### Getting Started Panel
When the getting started button is clicked, the panel will open to show this section. This section is using the ```resource-card.html``` from the ```_includes``` folder to create the layout. If the project has a Wiki and/or Readme, those files will appear on the page with an icon and link. If neither of those are defined in ```links``` in the project markdown file, the page will display a message: "Looks like this project doesn't have their own Getting Started guide."

![image](https://user-images.githubusercontent.com/49918375/82748487-1350cf00-9d57-11ea-825f-635f05dfa217.png)

```
    <!--Getting Started Card-->
    <div id="getting-started-section" class='project-page-card'>
        <ul class="resource-list unstyled-list">
            <!-- Hfla Start Guide -->
            {%- include resource-card.html name='Getting Started' url='https://github.com/hackforla/getting-started' -%}

            {% assign hasGettingStarted = false %}

            <!-- Check for Project Wiki -->
            {% for item in page.links %}
                {% if item.name == 'Wiki' %}
                    {% assign hasGettingStarted = true %}
                    {%- include resource-card.html name=item.name url=item.url image=page.image -%}
                {% endif %}
            {% endfor %}

            <!-- Check for Project Readme -->
            {% for item in page.links %}
                {% if item.name == 'Readme' %}
                    {% assign hasGettingStarted = true %}
                        {%- include resource-card.html name=item.name url=item.url image=page.image -%}
                {% endif %}
            {% endfor %}
            {% if hasGettingStarted == false %}
                <div id='help-getting-started'>
                    <p style='margin: 0px 15px 13px 15px;'>Looks like this project doesn't have their own Getting Started guide.</p>
                    <button onClick='helpMakeGuide()' class="btn btn-primary help-make-button" style='margin: 0 0 0 0;'>Help Make One!</button onClick=''>
                </div>
            {% endif %}
        </ul>
    </div>
```
<br>

### Project Leadership
Project leadership is also defined in the project markdown file, the code below loops through the leadership list and outputs the cards, in the case the leadership is not listed, a message will be outputted instead. <br>
Most project leaders will have links for their Github and Slack direct message, but in some cases, only their LinkedIn is provided. The code below checks for LinkedIn profiles for completed projects first, before it checks for the users' Github links. The rule for leadership cards is to link an individual's name to their Slack or LinkedIn, and for their photo/Github avatar to link to their Github or nothing (if clicked, a new tab will open to the project page).

```
    <!-- Project Team Card -->
    <div id='project-team-card' class='project-page-card'>
        <h4 style='color:#333'>Project Leadership</h4>
        {% if page.leadership %}
            <div class='resource-list'>
                {% for item in page.leadership %}
                    <div class='leader-card'>
                        <a href='{{ item.links.github }}' target='_blank' title='GitHub Profile'><img class='leader-img' src='{{ item.picture }}'/></a>
                        <div class='leader-description'>
                            {% if page.status == "Completed" and item.links.linkedin %}
                                <p style='margin-block-end: 0.25em;'><strong>Name: </strong><a href='{{ item.links.linkedin }}' target='_blank' title='Linkedin Profile'>{{ item.name }}</a></p>
                            {% elsif page.status == "Completed" %}
                               <p style='margin-block-end: 0.25em;'><strong>Name: </strong><a href='{{ item.links.github }}' target='_blank' title='GitHub Profile'>{{ item.name }}</a></p>
                            {% else %}
                                <p style='margin-block-end: 0.25em;'><strong>Name: </strong><a href='{{ item.links.slack }}' target='_blank' title='Slack Direct Message'>{{ item.name }}</a></p>
                            {%  endif %}
                            <p style='margin-block-end: 0.25em;'><strong>Role: </strong>{{ item.role }}</p>
                        </div>
                    </div>
                {% endfor %}
            </div>
        {% else %}
            <div class='empty-content-message'>
                <p>Looks like this project has not revealed specific leadership roles yet!</p>
            </div>
        {% endif %}

```
<br>

### Project Contributors
The Contributors section with volunteers' Github avatar/profile picture and links are populated through DOM manipulation with JavaScript in the [Constructing Team Card](#constructing-team-card) below. The script is using data being pulled through our [github-actions](https://github.com/hackforla/website/tree/gh-pages/github-actions) with the data being stored in [_data/github-data.json](https://github.com/hackforla/website/blob/gh-pages/_data/github-data.json) with objects of each project and their identification number, name, languages, url, and contributor list. The contributors' data includes their Github id number, github url, avator url, and a count of their contributions.

```
        <h4 id='contributor-header'style='color:#333'>Contributors</h4>
        <div id='contributors-list' class='resource-list'></div>
    </div>
```
<br>

### Resource Card
The code below populates the Resource card, using ```resource-card.html``` from the ```_includes``` to create icons and links to the project's links (i.e. Github, Wiki, Slack, Project website, etc.).

![image](https://user-images.githubusercontent.com/49918375/82748558-be618880-9d57-11ea-9ddc-8e7393af0323.png)

```
    <!--Project Resources Card-->
    <div class='project-page-card'>
        <h4 style='color:#333'>Resources</h4>
        <ul class="resource-list unstyled-list">
            {%- for item in page.links -%}
                {% if item.name == 'Readme' or item.name == 'Wiki' %}
                    {%- include resource-card.html name=item.name url=item.url image=page.image -%}
                {% else %}
                    {%- include resource-card.html name=item.name url=item.url -%}
                {% endif %}
            {%- endfor -%}
        </ul>
    </div>
</div>
```

```
{{ content | markdownify }}
```
**Return to [Contents](#contents)**
_________________

<br><br>

## JavaScript Code

### Fetching Correct Project
The script is using data being pulled through our [github-actions](https://github.com/hackforla/website/tree/gh-pages/github-actions) with the data being stored in [_data/github-data.json](https://github.com/hackforla/website/blob/gh-pages/_data/github-data.json) with objects of each project and their identification number, name, languages, url, and contributor list. The contributors' data includes their Github id number, github url, avator url, and a count of their contributions. This script fetches the identification number and compares it against to markdown file to make sure it's correct. Within [github\workflows\main.yml](https://github.com/hackforla/website/blob/gh-pages/.github/workflows/main.yml), you'll see that the JSON file is updated every day at 3am Pacific time. 
<br>
![image](https://user-images.githubusercontent.com/49918375/82959194-fccf9100-9f6b-11ea-8a8d-a6d4a62ca42f.png)

```
<!--Script for fetching the correct project-->
<script>
    {% assign projects = site.data.github-data | jsonify %}
    let projects = {{ projects }};
    let projectId = '{{ page.identification }}';
    // Search for correct project
    let project = null;
    for(item of projects){
        let itemId = item.id.toString();
        if(itemId == projectId){
            project = item;
            break;
        }
    }
</script>
```
<br>

### Adding Languages
Using the ```project``` variable defined in the Fetching Correct Project script, we'll loop through the document for the languages used in the project and output them.<br>
![image](https://user-images.githubusercontent.com/49918375/82959127-db6ea500-9f6b-11ea-975d-bff9d31fc210.png)

```
<!--Script for adding languages to "Languages" Section-->
<script>
    let languagesSection = document.getElementById('languages');
    if(project != null && project.languages.data.length > 0){
        let languages = project.languages.data.join(', ');
        let languagesParagraph = document.createElement('p');
        languagesParagraph.style.display = 'inline';
        let languagesText = document.createTextNode(languages);
        languagesParagraph.appendChild(languagesText);
        languagesSection.appendChild(languagesParagraph);
    } else {
        languagesSection.remove();
    }
</script>
```
<br>

### Constructing Team Card
Again, using the ```project``` variable defined in the Fetching Correct Project script, we're looping through the contributors list to create miniature cards with their links and Github avatars to append to the project page.

```
<!--Script for constructing Team Card-->
<script>
    let contributors = document.getElementById('contributors-list');
    if(project != null){
        for(contributor of project.contributors.data){
            let contributorDiv = document.createElement('div');
            contributorDiv.classList.add('contributor-div');

            let contributorProfile = document.createElement('a');
            contributorProfile.classList.add('contributor-link');
            contributorProfile.setAttribute('href', contributor.github_url);
            contributorProfile.setAttribute('target', '_blank');
            let contributorUrl = contributor.github_url.split('/');
            let contributorName = contributorUrl.pop();
            contributorProfile.setAttribute('title', contributorName);

            let contributorImg = document.createElement('img');
            contributorImg.style['border-radius'] = '12px';
            contributorImg.setAttribute('src', contributor.avatar_url);

            contributorProfile.appendChild(contributorImg);
            contributorDiv.appendChild(contributorProfile);
            contributors.appendChild(contributorDiv);
        }
    } else {
        let messageDiv = document.createElement('div');
        messageDiv.classList.add('empty-content-message');
        let messageText = document.createElement('p');
        messageText.appendChild(document.createTextNode('Looks like this project has not connected a GitHub repository yet!'));
        messageDiv.appendChild(messageText);
        contributors.parentNode.appendChild(messageDiv);
        contributors.parentNode.removeChild(contributors);
    }
</script>
```
<br>

### Getting Started Drop Down
Creates the 'Getting Started' drop down button, and adjusting its styling.<br>
![image](https://user-images.githubusercontent.com/49918375/82748464-eef4f280-9d56-11ea-8b43-19c1d8220e44.png)

```
<!--Script for Getting Started drop down functionality-->
<script>
    let dropDownOpen = false;
    function gettingStarted(){
        if(!dropDownOpen){
            dropDownOpen = true;
            let gettingStartedButton = document.getElementsByClassName('getting-started-button')[0];
            gettingStartedButton.style.transform = 'rotate(180deg)';

            let gettingStartedCard = document.getElementById('getting-started-section');
            let maxHeight = gettingStartedCard.children[0].offsetHeight * 1.5; // Adding pixels for good measure and pop up message
            gettingStartedCard.style['max-height'] = maxHeight + 'px';
            gettingStartedCard.style.padding = '30px 30px';
        }
        else {
            dropDownOpen = false;
            let gettingStartedButton = document.getElementsByClassName('getting-started-button')[0];
            gettingStartedButton.style.transform = 'rotate(0deg)';

            let gettingStartedCard = document.getElementById('getting-started-section');
            gettingStartedCard.style['max-height'] = '0px';
            gettingStartedCard.style.padding = '0px 30px';
        }
    }
</script>
```
<br>

### Call to Action Message
When the 'Help Make One!' button is clicked, a message will pop out. <br>
![image](https://user-images.githubusercontent.com/49918375/82958812-2936dd80-9f6b-11ea-9c00-3e380554c76a.png) <br>

This code allows the output of this message when a project does not have links for its Getting Started section. 

```
<!--Script for constructing Getting Started call to action message-->
<script>
    let helpGettingStarted = document.getElementById('help-getting-started');
    let textDiv = document.createElement('div');
    textDiv.setAttribute('id', 'help-make-text-section');

    let hflaSlack = document.createElement('a');
    hflaSlack.setAttribute('href', 'https://hackforla.slack.com/archives/C4UM52W93');
    hflaSlack.setAttribute('target', '_blank');
    let hflaSlackText = document.createTextNode('Hack for LA');
    hflaSlack.appendChild(hflaSlackText);

    let projectSlack = document.createElement('a');
    {% for item in page.links %}
        {% if item.name == 'Slack' %}
            projectSlack.setAttribute('href', '{{ item.url }}')
            projectSlack.setAttribute('target', '_blank');
        {% endif %}
    {% endfor %}
    let projectSlackText = document.createTextNode('our');
    projectSlack.appendChild(projectSlackText);

    let message = document.createElement('p');
    message.style.width = '200px';
    let text1 = document.createTextNode('Once you are on the ');
    let text2 = document.createTextNode(' slack channel, please post a note in ');
    let text3 = document.createTextNode(' channel indicating your interest.');

    message.appendChild(text1);
    message.appendChild(hflaSlack);
    message.appendChild(text2);
    message.appendChild(projectSlack);
    message.appendChild(text3);
    textDiv.appendChild(message);
    helpGettingStarted.insertAdjacentElement('afterend', textDiv);

    function helpMakeGuide(){
        let textDiv = document.getElementById('help-make-text-section');
        textDiv.style['min-width'] = '225px';
        textDiv.style.padding = '35px 15px';
    }
</script>
```

**Return to [Contents](#contents)**