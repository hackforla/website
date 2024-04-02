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
                if (window.location.pathname === '/projects-check/') {
                    filterTitle = filterName;                 
                } else {
                    filterTitle = 'languages / technologies / tools'  
                }
                filterValue.sort((a,b)=> {
                    a = a.toLowerCase()
                    b = b.toLowerCase()
                    if(a < b) return -1;
                    if(a > b) return 1;
                    return 0;
                })
            } else {
                filterTitle = filterName;
            }
            // for issue #4648, needed to add languages inside the technologies filter-item group,  might be able to optimize for future iterations

            // This ensures that the /projects-check page does not change
            if ((filterName === 'languages' || filterName === 'tools') && window.location.pathname === '/projects/') {
              // remove the view all button
              document.querySelector(`#technologies`).lastElementChild.remove()
              // insert data inside at the end of the category
              document.querySelector(`#technologies`).insertAdjacentHTML( 'beforeend', addToDropDownFilterComponents(filterName, filterValue));
              // change filterName so that the view all button will be added back
              filterName = 'technologies'
              // get all li elements from #technologies
              liValues = Array.from(document.querySelector('#technologies').querySelectorAll('li'))
              // sort the array of li elements
              liValues.sort((a,b) => {
                const textA = a.querySelector('label').textContent.trim()
                const textB = b.querySelector('label').textContent.trim()
                return textA.localeCompare(textB)
              })
              // clear existing contents of #technologies
              document.querySelector('#technologies').innerHTML = ''
              // append sorted li
              liValues.forEach(li => document.querySelector('#technologies').appendChild(li))
            } else {
              document.querySelector('.filter-list').insertAdjacentHTML( 'beforeend', dropDownFilterComponent( filterName,filterValue,filterTitle) );
            }
            
            if (document.getElementById(filterName).getElementsByTagName("li").length > 8) {
                document.getElementById(filterName).insertAdjacentHTML( 'beforeend', `<li class="view-all" tabindex="0" role="button" aria-label="View All ${filterTitle} Filters">View all</li>` );
            }
        }

        document.querySelectorAll("input[type='checkbox']").forEach(item =>{
            item.addEventListener('change', checkBoxEventHandler)
        });

        document.querySelectorAll("li.view-all").forEach(viewAll => {
            viewAll.addEventListener("click", viewAllEventHandler)
        })
        
        // Event listener for arrows to collapse categories
        document.querySelectorAll("li.filter-item a.category-title").forEach(categoryHeading => {
            categoryHeading.addEventListener("click", () => {
                categoryHeading.classList.toggle("show-none")
            })
        })

        document.querySelectorAll(".show-filters-button").forEach(button => {
            button.addEventListener("click", showFiltersEventHandler)
        })
        document.querySelectorAll(".hide-filters-button").forEach(button => {
            button.addEventListener("click", hideFiltersEventHandler)
        })
        document.querySelector(".cancel-mobile-filters").addEventListener("click", cancelMobileFiltersEventHandler)
        document.addEventListener('keydown', tabFocusedKeyDownHandler);
        
        //events related to search bar
        document.querySelector("#search").addEventListener("focus",searchOnFocusEventHandler);
        document.querySelector("#search").addEventListener("keydown", searchEnterKeyHandler);
        document.querySelector(".search-glass").addEventListener("click",searchEventHandler);
        document.querySelector(".search-x").addEventListener("click",searchCloseEventHandler);

        // Update UI on page load based on url parameters
        updateUI()

        // Event listener to Update UI on url parameter change
        window.addEventListener('locationchange',updateUI)

    })()

})

/**
 * Retrieves project data from jekyll _projects collection using liquid and transforms it into a javascript object
 * The function returns a javascript array of objects representing all the projects under the _projects directory
*/
function retrieveProjectDataFromCollection() {
    // { "project": {"id":"/projects/311-data","relative_path":"_projects/311-data.md","excerpt"
    {% assign projects = site.data.external.github-data %}
    {% assign visible_projects = site.projects | where: "visible", "true" %}
    let projects = JSON.parse(decodeURIComponent("{{ projects | jsonify | uri_escape }}"));
    // const scriptTag = document.getElementById("projectScript");
    // const projectId = scriptTag.getAttribute("projectId");
    // Search for correct project
    let projectLanguagesArray = [];
    projects.forEach(project => {
        if (project.languages) {
            const projectLanguages = {
                id: project.id,
                languages: project.languages
            };
            projectLanguagesArray.push(projectLanguages);
        }
    });

    // Construct project data objects for visible projects, 
    // including dynamic properties like additional repositories.
    let projectData = [
        {%- for project in visible_projects -%}
            {
                "project": {
                    "id": `{{project.id | default: 0}}`,
                    "identification": {{ project.identification | default: 0 }},
                    {%- if project.additional-repo-ids -%}
                    "additionalRepoIds": [{{ project.additional-repo-ids | join: ',' }}],
                    {% endif %}
                    "status": `{{ project.status }}`,
                    {%- if project.image -%}
                    "image": `{{ project.image }}`,
                    {%- endif -%}
                    {%- if project.alt -%}
                    "alt": "",
                    {%- endif -%}
                    {%- if project.title -%}
                    "title": `{{ project.title }}`,
                    {%- endif -%}
                    {%- if project.description -%}
                    "description": `{{ project.description }}`,
                    {%- endif -%}
                    {%- if project.partner -%}
                    "partner": `{{ project.partner }}`,
                    {%- endif -%}
                    {%- if project.tools -%}
                    "tools": {{ project.tools | jsonify }},
                    {%- endif -%}
                    {%- if project.looking -%}
                    "looking": {{ project.looking | jsonify }},
                    {%- endif -%}
                    {%- if project.links -%}
                    "links": {{ project.links | jsonify }},
                    {%- endif -%}
                    {%- if project.technologies -%}
                    "technologies": {{ project.technologies | jsonify }},
                    {%- endif -%}
                    {%- if project.program-area -%}
                    "programAreas": {{ project.program-area | jsonify }},
                    {%- endif -%}
                    {%- if project.languages -%}
                    "languages": {{ project.languages }}
                    {%- endif -%}
                }
            }
            {%- unless forloop.last -%},{% endunless %}
        {%- endfor -%}
    ];

    projectData.forEach((data, i) => {
        const { project } = data;
        const matchingProject = projectLanguagesArray.find(repo => repo.id === project.identification);

        if (matchingProject) {
            project.languages = matchingProject.languages;
            
            // Merge languages from additional GitHub repositories to ensure  
            // a comprehensive list of languages used on a single project.
            if (project.additionalRepoIds) {
                const additionalRepoIdNums = project.additionalRepoIds;
                let languagesArray = [...project.languages];

                additionalRepoIdNums.forEach(repoId => {
                    const additionalRepo = projectLanguagesArray.find(repo => repo.id === repoId);
                    if (additionalRepo && additionalRepo.languages) {
                        languagesArray = [...languagesArray, ...additionalRepo.languages];                
                    }
                });

                let uniqueLanguages = new Set(languagesArray);
                project.languages = Array.from(uniqueLanguages);
            }
        }
    });

    return projectData;
}

/**
 * Given an input of a project data array object as returned by the function `retrieveProjectDataFromCollection()`, this
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
    if (window.location.pathname === '/projects-check/') {
        return {
            'technologies': [...new Set(sortedProjectData.map(item => (item.project.technologies?.length > 0) ? [item.project.technologies].flat() : '').flat() ) ].filter(v=>v!='').sort(),
            'languages': [...new Set(sortedProjectData.map(item => (item.project.languages?.length > 0) ? [item.project.languages].flat() : '').flat() ) ].filter(v=>v!='').sort(),
            'tools': [...new Set(sortedProjectData.map(item => (item.project.tools?.length > 0) ? [item.project.tools].flat() : '').flat() ) ].filter(v=>v!='').sort(),
            }        
    } else {
        return {
            // 'looking': [ ... new Set( (sortedProjectData.map(item => item.project.looking ? item.project.looking.map(item => item.category) : '')).flat() ) ].filter(v=>v!='').sort(),
            // ^ See issue #1997 for more info on why this is commented out
            'programs': [...new Set(sortedProjectData.map(item => item.project.programAreas ? item.project.programAreas.map(programArea => programArea) : '').flat() ) ].filter(v=>v!='').sort(),
            'technologies': [...new Set(sortedProjectData.map(item => (item.project.technologies?.length > 0) ? [item.project.technologies].flat() : '').flat() ) ].filter(v=>v!='').sort(),
            'languages': [...new Set(sortedProjectData.map(item => (item.project.languages?.length > 0) ? [item.project.languages].flat() : '').flat())].filter(v => v != '').sort(),
            'tools': [...new Set(sortedProjectData.map(item => (item.project.tools?.length > 0) ? [item.project.tools].flat() : '').flat() ) ].filter(v=>v!='').sort(),
            'status': [... new Set(sortedProjectData.map(item => item.project.status))].sort()
        }        
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

    let currentHash=window.location.href.split('?');
    if (currentHash.length>1 && currentHash[1].length>0 && currentHash[1].includes('Search')){
        let searchQuery = currentHash[1].split('Search')[1];
        if(queryString){ 
            let newQuery =queryString+'&Search'+ searchQuery;
            window.history.replaceState(null,'',`?${newQuery}`)
        } 
        else{
            let newQuery= 'Search'+ searchQuery;
            window.history.replaceState(null,'',`?${newQuery}`)
        }
    }
    else{
        window.history.replaceState(null,'',`?${queryString}`)
    }

    
}
//shows all filters for a category
function viewAllEventHandler(e) {
    e.target.parentNode.classList.add("show-all")
}
//event handler for keyboard users to click spans when focused
function tabFocusedKeyDownHandler(e) {
    // if user is using tab index and keys space or enter on item that needs to be clicked, it will be clicked
	if ((event.key === "Enter" || event.key === "Spacebar" || event.key === " ") && document.activeElement.getAttribute("aria-label")) {
        document.activeElement.click()
    }
}
// shows filters popup on moble
function showFiltersEventHandler(e) {
    document.querySelector(".filter-toolbar").classList.add("show-filters")
    // prevent page scrolling behind filter overlay
    document.getElementsByTagName("html")[0].classList.add("scroll-lock")
}
// hides filters popup on moble
function hideFiltersEventHandler(e) {
    document.querySelector(".filter-toolbar").classList.remove("show-filters")
    document.getElementsByTagName("html")[0].classList.remove("scroll-lock")
}
// cancel button on mobile filters
function cancelMobileFiltersEventHandler(e) {
    hideFiltersEventHandler(e)
    clearAllEventHandler()
}
//search bar event handler
function searchEventHandler(e){
    e.preventDefault();
    let searchTerm=document.querySelector("#search").value;
    let tokenObj={};
    tokenObj['Search']=searchTerm;
     
   const filterParams = Object.fromEntries(new URLSearchParams(window.location.search));
    if (Object.keys(filterParams).length>0) {    
        for(const [key,value] of Object.entries(filterParams)){
            if (key !== 'Search'){
                tokenObj[key]=value.split(',');
            }
        }  
    }
    let queryString = Object.keys(tokenObj).map(key => key + '=' + tokenObj[key]).join('&').replaceAll(" ","+");

    window.history.replaceState(null,'',`?${queryString}`)
}

function searchEnterKeyHandler(e){
    if (e.key === "Enter") {
        searchEventHandler(e); 
    }
}

function searchOnFocusEventHandler(){
    document.querySelector(".search-x").style.display='block';
}

function searchCloseEventHandler(e){
    e.preventDefault();
    document.querySelector("#search").value="";
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

    //Displays no results message if filter returns no results
    toggleNoResultMsgIfNoMatch(filterParams, 'project-card')

    // The function updates the frequency of each filter based on the cards that are displayed on the page.
    updateFilterFrequency(filterParams);

    // Updates the filter tags show on the page based on the url parameter
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


        // Update values on the filterFrequencyObject if item in onPageFilter array exist as a key in this object.
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
        document.querySelectorAll("input[type='checkbox']").forEach((checkBox) => {
          if (checkBox.name in filterParams){ 
            let args = filterParams[checkBox.name];
            checkBox.checked = args.includes(checkBox.id);
          } else {
            checkBox.checked = false;
          }
        });
      }

    /**
     * Update category counter based on filter params
    */
function updateCategoryCounter(filterParams){
        let container = []
        for(const [key,value] of Object.entries(filterParams)){
          // for issue #4648, added this modifiedKey so that the counter for languages will be tied to technologies
            let modifiedKey = key
            // for issue #6196 - added tools to the counter 
          if (key === 'languages' || key === 'tools') {
            modifiedKey = 'technologies'
          }
          if (key !== 'Search') {
            container.push([`counter_${modifiedKey}`,value.length]);
          }
        }

        for(const [key,value] of container){
          // for issue #4648, added this to show the sum of selected filters for both technology and language filters
          let totalValue = 0
          for (const innerValue of container){
            totalValue += innerValue[1]
          }
          document.querySelector(`#${key}`).innerHTML = ` (${totalValue})`;
        }
    
}
    /**
     * Card is shown/hidden based on filters listed in the url parameter
 */
function updateProjectCardDisplayState(filterParams){
    
    document.querySelectorAll('.project-card').forEach(projectCard => {
        const projectCardObj = {};
               
        for(const key in filterParams){
            if(key !=='Search'){            
                projectCardObj[key] = projectCard.dataset[key].split(",");
            }
            else {
                const searchAreas=['technologies','description','partner','programs','title','languages', 'tools'];
                for(const area of searchAreas){
                    projectCardObj[area]=projectCard.dataset[area].split(",");
                }
                
            }
        }
        
        const cardsToHideContainer = [];
        for(const [key,value] of Object.entries(filterParams)){
            if(key !=='Search'){
                let inUrl = value;
                let inCard = projectCardObj[key];
                if( ( inCard.filter(x => inUrl.includes(x)) ).length == 0 ){
                    cardsToHideContainer.push([key,projectCard.id]);
                }
                else{
                    projectCard.style.display = 'list-item' ;
                }
            }
            else if(key==="Search"){
                let searchTerm=value[0];
                let operators=["AND","OR","-"];
                let tokens=[];
                if(searchTerm.includes(" ")){tokens=searchTerm.split(" ");}
                else{tokens[0]=searchTerm}
                for (let i = 0; i < tokens.length; i++) {
                    let token = tokens[i];
                    if (operators.includes(token)) {
                        let nextToken=tokens[i+1];
                        if (token === "AND"){
                            let searchRegex= new RegExp(nextToken,'gi');
                            let noMatchDataset=0;
                            for(const [key,value] of Object.entries(projectCardObj)){
                                if(  value.filter(x => searchRegex.test(x) ).length == 0){
                                    noMatchDataset++;
                                    if(noMatchDataset==5){cardsToHideContainer.push([key,projectCard.id]);}
                                }                                
                            }
                        }
                        else if(token === "OR"){
                            let searchRegex= new RegExp(nextToken,'gi');
                            let noMatchDataset=0;
                            for(const [key,value] of Object.entries(projectCardObj)){
                                if(  value.filter(x => searchRegex.test(x) ).length > 0){
                                    cardsToHideContainer.pop();
                                    projectCard.style.display = 'list-item' ;
                                    break;
                                }
                            }
                        }
                        
                        i++;                        
                    } 
                    else if(token.includes("-")){
                        let searchToken=token.substr(1);
                        let searchRegex= new RegExp(searchToken,'gi');
                        let noMatchDataset=0;
                        for(const [key,value] of Object.entries(projectCardObj)){
                            if(  value.filter(x => searchRegex.test(x) ).length > 0){
                                
                                cardsToHideContainer.push([key,projectCard.id]);
                            
                            }
                        }
                    }
                    else {
                        let searchRegex= new RegExp(token,'gi');
                        let noMatchDataset=0;
                        for(const [key,value] of Object.entries(projectCardObj)){
                            if(  value.filter(x => searchRegex.test(x) ).length == 0){
                                noMatchDataset++;
                                if(noMatchDataset==5){cardsToHideContainer.push([key,projectCard.id]);}
                            }
                            else{
                                projectCard.style.display = 'list-item' ;                                    
                                break;
                            }
                        }
                    }                        
                }       
            }
            cardsToHideContainer.map(item => document.getElementById(`${item[1]}`).style.display = 'none');
        }
    });    
}

    /**
     * Updates the filter tags show on the page based on the url parameter
 */
function updateFilterTagDisplayState(filterParams){
    // Clear all filter tags
    document.querySelectorAll('.filter-tag').forEach(filterTag => filterTag.parentNode.removeChild(filterTag) );
    document.querySelectorAll('.applied-filters').forEach(appliedFilters => appliedFilters.parentNode.removeChild(appliedFilters) );

    //Filter tags display hide logic
    for(const [key,value] of Object.entries(filterParams)){
        value.forEach(item =>{
            document.querySelector('.filter-tag-container').insertAdjacentHTML('afterbegin', filterTagComponent(key,item ) );

        })

    }

    if (Object.entries(filterParams). length > 0) {
        document.querySelector('.filter-tag-container').insertAdjacentHTML('afterbegin', `<h4 class="applied-filters">Applied Filters</h4>`)
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
            document.querySelector('.filter-tag:last-of-type').insertAdjacentHTML('afterend',`<a class="clear-filter-tags" tabindex="0" aria-label="Clear All Filters" style="white-space: nowrap;">Clear All</a>`);

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
 *  The function clears all URL parameter by setting the history to '/'
*/
function clearAllEventHandler(){
    event.preventDefault();
    //Update URL parameters
    window.history.replaceState(null, '', '/');
}

/**
 * Takes a single project object and returns the html string representing the project card
*/
function projectCardComponent(project) {
    const projectLanguages = project.languages ? [... new Set(project.languages.map(lang => lang))] : ""
    const projectTechnologies = project.technologies ? [... new Set(project.technologies.map(t => t))] : ""
    const projectTools = project.tools ? [... new Set(project.tools.map(t => t))] : ""
    // the data-technologies attr will be used by UpdateFilterFrequency
    // to generate Filter's Object
    const dataTechnologiesArr = [...projectLanguages, ...projectTechnologies, ...projectTools]
    return `
            <li class="project-card" id="${ project.identification }"
                data-status="${project.status}"
                data-looking="${project.looking ? [... new Set(project.looking.map(looking => looking.category)) ] : ''}"
                data-technologies="${[...dataTechnologiesArr]}"
                data-languages="${project.languages ? [... new Set(project.languages.map(lang => lang))] : '' }"
                data-tools="${project.tools ? [... new Set(project.tools.map(tool => tool))] : '' }"             
		        data-location="${project.location? project.location.map(city => city) : '' }"
                data-programs="${project.programAreas ? project.programAreas.map(programArea => programArea) : '' }"
                data-description="${project.description}"
                data-partner="${project.partner}"
                data-title="${project.title}"
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
                        ${project.tools.map(tool => `<p class='project-card-field-inline'> ${ tool }</p>`).join(", ")}
                        </div>
                        `: ""
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
 * Takes a filter category name and array of filter strings and returns the html string representing a single filter component
*/
function dropDownFilterComponent(categoryName,filterArray,filterTitle){
    return `
    <li class='filter-item'>
    <a class='category-title' style='text-transform: capitalize;'>
        ${filterTitle}
        <span id='counter_${categoryName}' class='number-of-checked-boxes'></span>
        <span class='labelArrow' tabindex="0" role="button" aria-label="Toggle Show ${filterTitle} Filters"> ∟ </span>
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

/*
 * Adds filter components to already existing filter category
 * Helper function created for issue #4648
*/
function addToDropDownFilterComponents(categoryName, filterArray){
  return `
  ${filterArray.map(item =>
      `
      <li>
          <input id='${item}' name='${categoryName}'  type='checkbox' class='filter-checkbox'>
          <label for='${item}'>${item} <span></span></label>
      </li>
      `
  ).join("")}
  `
}

/**
 * Takes a name of a checkbox filter and the value of the check boxed filter
 * and creates a html string representing a button
*/

function filterTagComponent(filterName,filterValue){
    const singularFormOfFilterName = filterName === "tools" ? "tool" : filterName === "technologies" ? "technology" : filterName === "languages" ? "language" : filterName === "programs" ? "program" : filterName
    return `<div
                data-filter='${filterName},${filterValue}'
                class='filter-tag'
            >
                <span tabindex="0" role="button" aria-label="Remove ${filterValue} Filter">
                ${filterName === "looking" ? "Role" : singularFormOfFilterName}: ${filterValue}
                </span>
            </div>`
}

function toggleNoResultMsgIfNoMatch(filtersParams,querySelector) {
    if ([...document.querySelectorAll(`.${querySelector}`)].every(card => card.style.display === 'none')) {
        noResultsMessageComponent(filtersParams,'black')
    } else {
        document.querySelector(".no-results-message").innerHTML = ""
    }
}