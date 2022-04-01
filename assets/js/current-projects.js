---

---

// Do All Dom Manipulation After The DOM content is full loaded
document.addEventListener("DOMContentLoaded",function(){
    (function main(){

        const projectData = retrieveProjectDataFromCollection();

        const sortedProjectData = projectDataSorter(projectData);

        // Insert Project Card Into The Dom
        for(const item of sortedProjectData){
            document.querySelector('.project-list').insertAdjacentHTML('beforeend', projectCardComponent(item.project))
        }

        // create filter dictionary from sorted project data
        let filters = createFilter(sortedProjectData);
        
        // Insert Checkbox Filter Into The Dom
        for(let [filterName,filterValue] of Object.entries(filters)){
            // Add displayed filter title, resolves issue of "program areas" not being valid html attribute name due to spacing
            let filterTitle = "";
            if(filterName === "programs"){
                filterTitle = "program areas"
            } else if(filterName === 'technologies') {
                filterTitle = 'languages / technologies'
                filterValue.sort((a,b)=> {
                    a = a.toLowerCase()
                    b = b.toLowerCase()
                    if(a < b) return -1;
                    if(a > b) return 1;
                    return 0;
                })
            } else {
                filterTitle = filterName
            }
            document.querySelector('.filter-list').insertAdjacentHTML( 'beforeend', dropDownFilterComponent( filterName,filterValue,filterTitle) );
        }

        document.querySelectorAll("input[type='checkbox']").forEach(item =>{
            item.addEventListener('change', checkBoxEventHandler)
        });

        // Update UI on page load based on url parameters
        updateUI()

        // Event listener to Update UI on url parameter change
        window.addEventListener('locationchange',updateUI)

})()

})

/**
 * Retieves project data from jekyll _projects collection using liquid and transforms it into a javascript object
 * The function returns a javascript array of objects representing all the projects under the _projects directory
*/
function retrieveProjectDataFromCollection(){
    // { "project": {"id":"/projects/311-data","relative_path":"_projects/311-data.md","excerpt"
    {% assign projects = site.data.external.github-data %}
    {% assign visible_projects = site.projects | where: "visible", "true" %}
    let projects = JSON.parse(decodeURIComponent("{{ projects | jsonify | uri_escape }}"));
    // const scriptTag = document.getElementById("projectScript");
    // const projectId = scriptTag.getAttribute("projectId");
    // Search for correct project
    let projectLanguagesArr = [];
    projects.forEach(project=> {
        if(project.languages){
            const projectLanguages = {
                id: project.id,
                languages: project.languages
            };
            projectLanguagesArr.push(projectLanguages);
        }
    })

    let projectData = [{%- for project in visible_projects -%}
            {
                "project": {
                            'id': "{{project.id | default: 0}}",
                            'identification': {{project.identification | default: 0}},
                            "status": "{{ project.status }}"
                            {%- if project.image -%},
                            "image": '{{ project.image }}'
                            {%- endif -%}
                            {%- if project.alt -%},
                            "alt": `{{ project.alt }}`
                            {%- endif -%}
                            {%- if project.title -%},
                            "title": `{{ project.title }}`
                            {%- endif -%}
                            {%- if project.description -%},
                            "description": `{{ project.description }}`
                            {%- endif -%}
                            {%- if project.partner -%},
                            "partner": `{{ project.partner }}`
                            {%- endif -%}
                            {%- if project.tools -%},
                            "tools": `{{ project.tools }}`
                            {%- endif -%}
                            {%- if project.looking -%},
                            "looking": {{ project.looking | jsonify }}
                            {%- endif -%}
                            {%- if project.links -%},
                            "links": {{ project.links | jsonify }}
                            {%- endif -%}
                            {%- if project.technologies -%},
                            "technologies": {{ project.technologies | jsonify }}
                            {%- endif -%}
                            {%- if project.program-area -%},
                            "programAreas": {{ project.program-area | jsonify }}
                            {%- endif -%}
                            {%- if project.languages -%},
                            "languages": {{ project.languages }}
                            {%- endif -%}
                            }
            }{%- unless forloop.last -%}, {% endunless %}
    {%- endfor -%}]
    projectData.forEach((data,i) => {
        const { project } = data;
        const matchingProject = projectLanguagesArr.find(x=> x.id === project.identification);
        if(matchingProject) {
            project.languages = matchingProject.languages
        }
    })
    return projectData;
}

/**
 * Given an input hehe of a project data array object as returned by the function `retrieveProjectDataFromCollection()`, this
 * function sorts the project twice.
 *  1. It sort all projects in the array alphabetically on their `status` value
 *  2. It sort all project by title for each status type
*/
function projectDataSorter(projectdata){

    const statusList = ["Active","Completed","On Hold"]
    const sortedProjectContainer = [];

    // Sort Project data by status alphabetically
    projectdata.sort( (a,b) => (a.project.status > b.project.status) ? 1 : -1)

    // Sort Project Data by title for each status type
    for(const status of statusList){
            let arr = projectdata.filter(function(item){
            return item.project.status === status
        }).sort( (a,b) => (a.project.title > b.project.title) ? 1 : -1);
        sortedProjectContainer.push(...arr);
    }

    return sortedProjectContainer;
}

/**
 * Given an array of project object as returned by ``retrieveProjectDataFromCollection()``
 * Returns a filter object -> {filter_type1:[filter_value1,filter_value2], filter_type2:[filter_value1,filter_value2], ... }
*/
function createFilter(sortedProjectData){
    return {
            // 'looking': [ ... new Set( (sortedProjectData.map(item => item.project.looking ? item.project.looking.map(item => item.category) : '')).flat() ) ].filter(v=>v!='').sort(),
            // ^ See issue #1997 for more info on why this is commented out
            'programs': [...new Set(sortedProjectData.map(item => item.project.programAreas ? item.project.programAreas.map(programArea => programArea) : '').flat() ) ].filter(v=>v!='').sort(),
            'technologies': [...new Set(sortedProjectData.map(item => (item.project.technologies && item.project.languages?.length > 0) ? [item.project.languages, item.project.technologies].flat() : '').flat() ) ].filter(v=>v!='').sort(),
            'status': [... new Set(sortedProjectData.map(item => item.project.status))].sort(),

        }
}

/**
 * Update the history state and the url parameters on checkbox changes
*/
function checkBoxEventHandler(){
    let incomingFilterData = document.querySelectorAll("input[type='checkbox']");
    let queryObj = {}
    incomingFilterData.forEach(input => {
        if(input.checked){
            if(input.name in queryObj){
                queryObj[input.name].push(input.id);
            }
            else{
                queryObj[input.name] = [];
                queryObj[input.name].push(input.id)
            }
        }
    })

    let queryString = Object.keys(queryObj).map(key => key + '=' + queryObj[key]).join('&').replaceAll(" ","+");

    //Update URL parameters
    window.history.replaceState(null, '', `?${queryString}`);
}

/**
 * The updateUI function updates the ui based on the url parameters during the following events
 *  1. URL parameter changes
 *  2. Page is reloaded/refreshed
*/
function updateUI(){

    //Get filter parameters from the url
    const filterParams = Object.fromEntries(new URLSearchParams(window.location.search));

    //Transform filterparam object values to arrays
    Object.entries(filterParams).forEach( ([key,value]) => filterParams[key] = value.split(',') )

    //If there are no entries in URL display clear all filter tags and display all cards
    if(Object.keys(filterParams).length === 0 ){noUrlParameterUpdate(filterParams) };

    // Filters listed in the url parameter are checked or unchecked based on filter params
    updateCheckBoxState(filterParams);

    // Update category counter based on filter params
    updateCategoryCounter(filterParams)

    // Card is shown/hidden based on filters listed in the url parameter
    updateProjectCardDisplayState(filterParams);

    // The function updates the frequency of each filter based on the cards that are displayed on the page.
    updateFilterFrequency(filterParams);

    // Updates the filter tags show on the page based on the url paramenter
    updateFilterTagDisplayState(filterParams);

    // Add onclick event handlers to filter tag buttons and a clear all button if filter-tag-button exists in the dom
    attachEventListenerToFilterTags()

}

    /**
     * Computes and return the frequency of each checkbox filter that are currently present in on the displayed cards on the page
 */
function updateFilterFrequency(){

    const onPageFilters = []
    // Push the filters present on the displayed cards on the page into an array.
    document.querySelectorAll('.project-card[style*="display: list-item;"]').forEach(card => {
        for(const [key,value] of Object.entries(card.dataset)){
            value.split(",").map(item => {
                onPageFilters.push(`${key}_${item}`)
            });
        }
    });

    const allFilters = []

    document.querySelectorAll('input[type=checkbox]').forEach(checkbox => {
        allFilters.push(`${checkbox.name}_${checkbox.id}`)
    })

    // Convert a 1 dimensional array into a key,value object. Where the array item becomes the key and the value is defaulted to 0
    let filterFrequencyObject = allFilters.reduce((acc,curr)=> (acc[curr]=0,acc),{});


    // Update values on the filterFrquencyObject if item in onPageFilter array exist as a key in this object.
    for(const item of onPageFilters){
        if(item in filterFrequencyObject){
            filterFrequencyObject[item] += 1;
        }
    }

    for(const [key,value] of Object.entries(filterFrequencyObject)){
        document.querySelector(`label[for="${key.split("_")[1]}"]`).lastElementChild.innerHTML = ` (${value})`;
    }

}

    /**
     * Filters listed in the url parameter are checked or unchecked based on filter params
 */
function updateCheckBoxState(filterParams){
    document.querySelectorAll("input[type='checkbox']").forEach(checkBox =>{
        if(checkBox.name in filterParams){
            let args = filterParams[checkBox.name]
            args.includes(checkBox.id) ? checkBox.checked = true : checkBox.checked = false;
        }
    })
}

    /**
     * Update category counter based on filter params
 */
function updateCategoryCounter(filterParams){
    let container = []
    for(const [key,value] of Object.entries(filterParams)){
        container.push([`counter_${key}`,value.length]);
    }

    for(const [key,value] of container){
        document.querySelector(`#${key}`).innerHTML = ` (${value})`;
    }
}
    /**
     * Card is shown/hidden based on filters listed in the url parameter
 */
function updateProjectCardDisplayState(filterParams){
    document.querySelectorAll('.project-card').forEach(projectCard => {
        const projectCardObj = {};
        for(const key in filterParams){
            projectCardObj[key] = projectCard.dataset[key].split(",");
        }
        const cardsToHideContainer = [];
        for(const [key,value] of Object.entries(filterParams)){
            let inUrl = value;
            let inCard = projectCardObj[key];
            if( ( inCard.filter(x => inUrl.includes(x)) ).length == 0 ){
                cardsToHideContainer.push([key,projectCard.id]);
            }
            else{
                projectCard.style.display = 'list-item' ;
            }

        }
        cardsToHideContainer.map(item => document.getElementById(`${item[1]}`).style.display = 'none');

    });
}

    /**
     * Updates the filter tags show on the page based on the url paramenter
 */
function updateFilterTagDisplayState(filterParams){
    // Clear all filter tags
    document.querySelectorAll('.filter-tag').forEach(filterTag => filterTag.parentNode.removeChild(filterTag) );

    //Filter tags display hide logic
    for(const [key,value] of Object.entries(filterParams)){
        value.forEach(item =>{
            document.querySelector('.filter-tag-container').insertAdjacentHTML('afterbegin', filterTagComponent(key,item ) );

        })

    }
}

    /**
     * Add onclick event handlers to filter tag buttons and a clear all button if filter-tag-button exists in the dom
 */
function attachEventListenerToFilterTags(){
    if(document.querySelectorAll('.filter-tag').length > 0){

        // Attach event handlers to button
        document.querySelectorAll('.filter-tag').forEach(button => {
            button.addEventListener('click',filterTagOnClickEventHandler)
        })

        // If there exist a filter-tag button on the page add a clear all button after the last filter tag button
        if(!document.querySelector('.clear-filter-tags')){
            document.querySelector('.filter-tag:last-of-type').insertAdjacentHTML('afterend',`<a class="clear-filter-tags" style="white-space: nowrap;">Clear All</a>`);

            //Attach an event handler to the clear all button
            document.querySelector('.clear-filter-tags').addEventListener('click',clearAllEventHandler);
        }
    }
}

/**
 * If there are no url parameter
 *  1. Display all cards
 *  2. Clear all checkboxes
 *  3. If there are filter tags, clear all filter tags
 *  4. If there is a clear all, button remove Clear All Button
*/
function noUrlParameterUpdate(){
    // Display all cards
    document.querySelectorAll('.project-card').forEach(projectCard => {  projectCard.style.display = 'list-item'  });

    // Clear all checkboxes
    document.querySelectorAll("input[type='checkbox']").forEach(checkBox => {checkBox.checked = false});

    // Clear all number of checkbox counters
    document.querySelectorAll('.number-of-checked-boxes').forEach(checkBoxCounter => {checkBoxCounter.innerHTML = ''} );

    // Clear all filter tags
    document.querySelectorAll('.filter-tag') && document.querySelectorAll('.filter-tag').forEach(filterTag => filterTag.remove() );

    // Remove Clear All Button
    document.querySelector('.clear-filter-tags') && document.querySelector('.clear-filter-tags').remove();
    return;
}

/**
 * Filter Tag Button On Click Event Handler
 *  The function removes key:value from url parameter based on the filter-tag button clicked on
*/
function filterTagOnClickEventHandler(){

    //Get filter parameters from the url
    const filterParams = Object.fromEntries(new URLSearchParams(window.location.search));

    //Transform filterparam object values to arrays
    Object.entries(filterParams).forEach( ([key,value]) => filterParams[key] = value.split(',') )



    let buttonClickedData = Object.fromEntries([ this.dataset.filter.split(",") ])

    for(const [button_filtername,button_filtervalue] of Object.entries(buttonClickedData)){
        if(filterParams[button_filtername].includes(button_filtervalue) ){
            filterParams[button_filtername].splice( filterParams[button_filtername].indexOf(button_filtervalue), 1);
            filterParams[button_filtername].length == 0 && delete filterParams[button_filtername];
        }
    }

    // Prepare Query String
    let queryString = Object.keys(filterParams).map(key => key + '=' + filterParams[key]).join('&').replaceAll(" ","+");

    //Update URL parameters
    window.history.replaceState(null, '', `?${queryString}`);
}

/**
 * Clear All Button Event Handler
 *  The function clears all URL parmeter by setting the history to '/'
*/
function clearAllEventHandler(){
    //Update URL parameters
    window.history.replaceState(null, '', '/');
}

/**
 * Takes a single project object and returns the html string representing the project card
*/
function projectCardComponent(project){
return `
        <li class="project-card" id="${ project.identification }"
            data-status="${project.status}"
            data-looking="${project.looking ? [... new Set(project.looking.map(looking => looking.category)) ] : ''}"
            data-technologies="${(project.technologies && project.languages) ? [... new Set(project.technologies.map(tech => tech)), project.languages.map(lang => lang)] : '' }"

            data-location="${project.location? project.location.map(city => city) : '' }"
            data-programs="${project.programAreas ? project.programAreas.map(programArea => programArea) : '' }"
        >
        <div class="project-card-inner">

        <a href='${project.id}'>
            <div class="project-tmb">
            <img src='${window.location.origin}${project.image}' class="project-tmb-img" alt='${project.alt}'/>
            </div>
        </a>

        <div class="project-body">
            <div class='status-indicator status-${project.status}'>
            <h5 class='status-text'>${ project.status }</h5>
            </div>

            <a href='${ project.id }'><h4 class="project-title">${ project.title }</h4></a>

            <p class="project-description">${ project.description }</p>

            <div class="project-links">
            <strong>Links: </strong>
            ${project.links.map(item => `<a href="${ item.url }" rel="noopener" target='_blank'> ${ item.name }</a>`).join(", ")}
            </div>

            ${project.partner ?
            `
            <div class="project-partner">
            <strong>Partner: </strong>
            ${ project.partner }
            </div>
            `:""
            }

            ${project.tools ?
            `
            <div class="project-tools">
            <strong>Tools: </strong>
            ${ project.tools }
            </div>
            `:""
            }

            ${project.looking ? "" : ""
            // `
            // <div class="project-needs">
            //     <strong>Looking for: </strong>
            //     ${project.looking.map( role => `<p class='project-card-field-inline'> ${ role.skill }</p>`).join(", ")}
            // </div>
            // `:""
            // ^ See issue #1997 for more info on why this is commented out
            }

            ${project.languages?.length > 0 ? 
            `
            <div class="project-languages">
            <strong>Languages: </strong>
            ${project.languages.map(language => `<p class='project-card-field-inline'> ${ language }</p>`).join(", ")}
            </div>
            `: ""
            }

            ${project.technologies ?
            `
            <div class="project-technologies">
            <strong>Technologies: </strong>
            ${project.technologies.map(tech => `<p class='project-card-field-inline'> ${ tech }</p>`).join(", ")}
            </div>
            `:""
            }

            ${project.programAreas ?
            `
            <div class="project-programs">
            <strong>Program Areas: </strong>
            ${project.programAreas.map(programArea => `<p class='project-card-field-inline'> ${ programArea }</p>`).join(", ")}
            </div>
            `:""
            }
</div>
</div>
</li>`
}

/**
 * Takes a filter category name and array of filter stirings and returns the html string representing a single filter component
*/
function dropDownFilterComponent(categoryName,filterArray,filterTitle){
    return `
    <li class='filter-item'>
    <a class='category-title' style='text-transform: capitalize;'>
        ${filterTitle}
        <span id='counter_${categoryName}' class='number-of-checked-boxes'></span>
        <span class='labelArrow'> ∟ </span>
    </a>
    <ul class='dropdown' id='${categoryName.toLowerCase()}'>
        ${filterArray.map(item =>
            `
            <li>
                <input id='${item}' name='${categoryName}'  type='checkbox' class='filter-checkbox'>
                <label for='${item}'>${item} <span></span></label>
            </li>
            `
        ).join("")}
    </ul>
    </li>
    `
}

/**
 * Takes a name of a checkbox filter and the value of the check boxed filter
 * and creates a html string representing a button
*/

function filterTagComponent(filterName,filterValue){
    return `<div
                data-filter='${filterName},${filterValue}'
                class='filter-tag'
            >
                <span>
                ${filterName === "looking" ? "Role" : filterName}: ${filterValue}
                </span>
            </div>`
}
