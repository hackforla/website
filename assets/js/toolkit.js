---

---

document.addEventListener("DOMContentLoaded", () => {
    const currentFilters = {projectStatus: [], practiceAreas: [], projectTools: [], projectResourceType: [], projectTechnologies: [], projectSource: [], projectContributors: []}

    // Generate dropdown menu
    initializeFilters()

    // Apply current URL to filters
    applyURLtoFilters(currentFilters)

    // Add event listener to all filter checkboxes
    document.querySelectorAll(".filter-checkbox").forEach(filter => {
        filter.addEventListener('click', function (event) {
            let name
            if (event.target.id.split(' ').length > 0) {
                name = event.target.id.split(' ').join('+')
            } else {
                name = event.target.id
            }
            let category = event.target.name
            if (event.target.checked) {
                currentFilters[category].push(name)
            }
            if (!event.target.checked) {
                let index = currentFilters[category].indexOf(name)
                currentFilters[category].splice(index, 1)
            }
            applyFilters(currentFilters)
        })
    })

    document.querySelectorAll(".show-filters-button").forEach(button => {
        button.addEventListener("click", showFiltersEventHandler)
    })
    document.querySelectorAll(".hide-filters-button").forEach(button => {
        button.addEventListener("click", hideFiltersEventHandler)
    })
    document.querySelector(".cancel-mobile-filters").addEventListener("click", function(e) {
        hideFiltersEventHandler(e)
        window.history.replaceState(null, '', '/toolkit/')
        for (let key in currentFilters) {
            currentFilters[key] = []
        }
        applyFilters(currentFilters)
        updateCheckBoxState(currentFilters)
        document.querySelector('.clear-filter-tags') && document.querySelector('.clear-filter-tags').remove()
    })
    document.addEventListener('keydown', tabFocusedKeyDownHandler)
})

// Retrieve filter categories from guide pages
function retrieveFilterCategories() {
    {% assign projects = site.guide-pages | where: "display", "true" %}
    let projects = JSON.parse(decodeURIComponent("{{ projects | jsonify | uri_escape }}"))

    const practiceAreas = []
    const projectStatus = []
    const projectTools = []
    const projectResourceType = []
    const projectTechnologies = []
    const projectSource = []
    const projectContributors = []

    for (let i = 0; i < projects.length; i++) {
        const project = projects[i]
        if (project["practice-area"] && !practiceAreas.includes(project["practice-area"])) {
            practiceAreas.push(project["practice-area"])
        }
        if (project["status"]) {
            if (project["status"] === "completed" && !projectStatus.includes("Active")) {
                projectStatus.push("Active")
            }
            if (project["status"] === "work-in-progress" && !projectStatus.includes("Draft")) {
                projectStatus.push("Draft")
            }
        }
        if (project["tools"]) {
            const tools = project["tools"]
            for (let j = 0; j < tools.length; j++) {
                if (!projectTools.includes(tools[j]) && tools[j]) {
                    projectTools.push(tools[j])
                }
            }
        }
        if (project["resource-type"] && !projectSource.includes(project["resource-type"])) {
            projectResourceType.push(project["resource-type"])
        }
        if (project["technologies"]) {
            const technologies = project["technologies"]
            for (let j = 0; j < technologies.length; j++) {
                if (!projectTechnologies.includes(technologies[j]) && technologies[j]) {
                    projectTechnologies.push(technologies[j])
                }
            }
        }
        if (project["source"] && !projectSource.includes(project["source"])) {
            projectSource.push(project["source"])
        }
        if (project["contributors"]) {
            const contributors = project["contributors"]
            for (let j = 0; j < contributors.length; j++) {
                if (!projectContributors.includes(contributors[j]) && contributors[j]) {
                    projectContributors.push(contributors[j])
                }
            }
        }
    }
    return {projectStatus, practiceAreas, projectTools, projectResourceType, projectTechnologies, projectSource, projectContributors}
}

// Generate HTML for dropdown
function dropDownFilterComponent(categoryName,filterArray,filterTitle) {
    return `
    <li class='filter-item'>
        <a class='category-title filter-categories' name='${categoryName}' style='text-transform: capitalize'>
            <span>${filterTitle}</span>
            <span id='counter_${categoryName}' class='number-of-checked-boxes toolkit-red'></span>
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

// Insert dropdown menu into the DOM
function initializeFilters() {
    let filterCategories = retrieveFilterCategories()
    for (let key in filterCategories) {
        if (filterCategories[key].length === 0) continue
        let categoryName = key
        let filterArray = filterCategories[key]
        let filterTitle
        switch(key) {
            case 'projectStatus':
                filterTitle = 'Status'
                break
            case 'practiceAreas':
                filterTitle = 'Practice Area'
                break
            case 'projectTools':
                filterTitle = 'Tools'
                break
            case 'projectResourceType':
                filterTitle = 'Resource Type'
                break
            case 'projectTechnologies':
                filterTitle = 'Technologies'
                break
            case 'projectSource':
                filterTitle = 'Source'
                break
            case 'projectContributors':
                filterTitle = 'Contributors'
                break
        }

        document.querySelector('.filter-list').insertAdjacentHTML( 'beforeend', dropDownFilterComponent(categoryName, filterArray, filterTitle) )

        // Add View All button if category has more than 8 filters
        if (document.getElementById(categoryName.toLowerCase()).getElementsByTagName("li").length > 8) {
            document.getElementById(categoryName.toLowerCase()).insertAdjacentHTML( 'beforeend', `<li class="view-all" tabindex="0" role="button" aria-label="View All ${filterTitle} Filters">View all</li>` );
        }

        // Add event listener on View All button
        document.querySelectorAll("li.view-all").forEach(viewAll => {
            viewAll.addEventListener("click", function(event) {
                event.target.parentNode.classList.add("show-all")
            })
        })
    }
    // Event listener for arrows to collapse categories
    document.querySelectorAll("li.filter-item a.category-title").forEach(categoryHeading => {
        categoryHeading.addEventListener("click", () => {
            categoryHeading.classList.toggle("show-none")
        })
    })
}

// Update page based on current filters
function applyFilters(filtersParams) {
    // Show all cards if there are no active filters
    if (Object.values(filtersParams).every(x => x.length === 0)) {
        document.querySelectorAll(".guide-card").forEach(card => {
            card.style.display = 'block'
        })
    } else {
        document.querySelectorAll(".guide-card").forEach(card => {
            card.style.display = 'block'
            for (let key in filtersParams) {
                let filterList
                if (filtersParams[key].length > 0) {
                    if (key === 'projectStatus') {
                        filterList = filtersParams[key].map(data => {
                            if (data == 'Active') {
                                return 'completed'
                            }
                            if (data == 'Draft') {
                                return 'work-in-progress'
                            }
                        })
                    } else {
                        filterList = filtersParams[key].map(data => {
                            if (data.includes('+')) {
                                return data.split('+').join(' ')
                            } else {
                                return data
                            }
                        })
                    }
                    if (!(filterList.some(data => card.dataset[key].includes(data)))) {
                        card.style.display = 'none'
                    }
                }
            }
        })
    }

    // Change URL to include current filters
    applyFiltersToURL(filtersParams)

    // Update card counter for each filter
    updateFilterFrequency()

    // Update filter counter for each category
    updateCategoryCounter(filtersParams)

    // Update filter tags
    updateFilterTag(filtersParams)

    // Attach event listener to filter tags
    attachEventListenerToFilterTags(filtersParams)

    // Displays no results message if no matches and 2nd parameter is querySelector name
    toggleNoResultMsgIfNoMatch(filtersParams, 'guide-card')
}

// Apply current filters to URL
function applyFiltersToURL(filterParams) {
    const url = new URL(window.location)
    const params = new URLSearchParams()

    for (const [key, values] of Object.entries(filterParams)) {
        values.forEach(value => params.append(key, value))
    }

    url.search = params.toString() 
    window.history.replaceState(null, '', url)
}

// Apply URL to filters
function applyURLtoFilters(filterParams) {
    let currentHash = window.location.href.split('?')
    if (currentHash.length > 1 && currentHash[1].length > 0) {
        currentHash = currentHash[1].split('&')
        for (let i = 0; i < currentHash.length; i++) {
            let category = currentHash[i].split('=')[0]
            let filters = currentHash[i].split('=')[1].split(',')
            filterParams[category] = filters
        }
        updateCheckBoxState(filterParams)
        applyFilters(filterParams)
    } else {
        applyFilters(filterParams)
    }
}

// Computes and returns the frequency of each checkbox filter that are currently present on the displayed cards on the page
function updateFilterFrequency() {
    const onPageFilters = []
    const guideCards = document.querySelectorAll('.guide-card')
    const guideCardsArray = Array.from(guideCards)
    const visibleGuideCards = guideCardsArray.filter(card => card.style.display === 'block')
    document.querySelectorAll('.guide-card[style*="display: block"]').forEach(card => {
        for(const [key, value] of Object.entries(card.dataset)) {
            value.split(",").map(item => {
                if (item.toLowerCase() === 'completed') {
                    item = 'Active'
                }
                if (item.toLowerCase() === 'work-in-progress') {
                    item = 'Draft'
                }
                onPageFilters.push(`${item}`)
            })
        }
    })

    const allFilters = []
    document.querySelectorAll('input[type=checkbox]').forEach(checkbox => {
        allFilters.push(`${checkbox.name}_${checkbox.id}`)
    })

    // Convert a 1 dimensional array into a key,value object. Where the array item becomes the key and the value is defaulted to 0
    let filterFrequencyObject = allFilters.reduce((acc,curr)=> (acc[curr]=0,acc),{})


    // Update values on the filterFrequencyObject if item in onPageFilter array exist as a key in this object.
    for(const item of onPageFilters){
        for (let key in filterFrequencyObject) {
            if (item.includes(key.split('_')[1])) {
                filterFrequencyObject[key] += 1
            }
        }
    }

    for(const [key,value] of Object.entries(filterFrequencyObject)){
        document.querySelector(`label[for="${key.split("_")[1]}"]`).lastElementChild.innerHTML = ` (${value})`;
    }
}

// Update category counter based on filter params
function updateCategoryCounter(filterParams) {
    let container = []
    for(const [key,value] of Object.entries(filterParams)){
        container.push([`counter_${key}`,value.length])
    }
    let categories = [...document.querySelectorAll('.category-title')].map(category => category.name)
    for(const [key,value] of container){
        if (categories.includes(key.split('_')[1])) {
            if (value > 0) {
                document.querySelector(`#${key}`).innerHTML = ` (${value})`
            } else {
                document.querySelector(`#${key}`).innerHTML = ''
            }
        }
    }
}

// Create filter tag based on filter category and parameter
function filterTagComponent(filterName,filterValue){
    return `<div
                data-filter='${filterName},${filterValue}'
                class='filter-tag'
            >
                <span tabindex="0" role="button" aria-label="Remove ${filterValue} Filter">
                ${filterName}: ${filterValue}
                </span>
            </div>`
}

// Update filter tags based on current filters
function updateFilterTag(filterParams) {
    // Clear all filter tags
    document.querySelectorAll('.filter-tag').forEach(filterTag => filterTag.parentNode.removeChild(filterTag))
    document.querySelectorAll('.applied-filters').forEach(appliedFilters => appliedFilters.parentNode.removeChild(appliedFilters) )

    for (const [key, value] of Object.entries(filterParams)) {
        let category
        switch(key) {
            case 'projectStatus':
                category = 'Status'
                break
            case 'practiceAreas':
                category = 'Practice'
                break
            case 'projectTools':
                category = 'Tools'
                break
            case 'projectResourceType':
                category = 'Type'
                break
            case 'projectTechnologies':
                category = 'Technologies'
                break
            case 'projectSource':
                category = 'Source'
                break
            case 'projectContributors':
                category = 'Contributor'
                break
        }
        value.forEach(item => {
            document.querySelector('.filter-tag-container').insertAdjacentHTML('afterbegin', filterTagComponent(category, item.split('+').join(' ')))
        })
    }
    
    if (Object.entries(filterParams).length > 0) {
        document.querySelector('.filter-tag-container').insertAdjacentHTML('afterbegin', `<h4 class="applied-filters">Applied Filters</h4>`)
    }

    if (document.querySelectorAll('.filter-tag').length === 0) {
        document.querySelector('.clear-filter-tags') && document.querySelector('.clear-filter-tags').remove()
        document.querySelector('.applied-filters').remove()
    }
}

// Apply event listener to applied filters buttons to remove filter when clicked
function attachEventListenerToFilterTags(filterParams) {
    if(document.querySelectorAll('.filter-tag').length > 0){
        document.querySelectorAll('.filter-tag').forEach(button => {
            button.addEventListener('click', function(event) {
                let category = event.target.innerText.split(':')[0]
                let filter = event.target.innerText.split(':')[1].trim().split(' ').join('+')
                switch(category) {
                    case 'Status':
                        category = 'projectStatus'
                        break
                    case 'Practice':
                        category = 'practiceAreas'
                        break
                    case 'Tools':
                        category = 'projectTools'
                        break
                    case 'Type':
                        category = 'projectResourceType'
                        break
                    case 'Technologies':
                        category = 'projectTechnologies'
                        break
                    case 'Source':
                        category = 'projectSource'
                        break
                    case 'Contributor':
                        category = 'projectContributors'
                        break
                }
                filterParams[category] = [...filterParams[category].filter(item => item.toLowerCase() !== filter.toLowerCase())]
                applyFilters(filterParams)
                updateCheckBoxState(filterParams)
            })
        })

        // If there exist a filter-tag button on the page add a clear all button after the last filter tag button
        if(!document.querySelector('.clear-filter-tags')){
            document.querySelector('.filter-tag:last-of-type').insertAdjacentHTML('afterend',`<a class="clear-filter-tags" tabindex="0" aria-label="Clear All Filters" style="white-space: nowrap;">Clear All</a>`);

            //Attach an event handler to the clear all button
            document.querySelector('.clear-filter-tags').addEventListener('click',function () {
                window.history.replaceState(null, '', '/toolkit/')
                for (let key in filterParams) {
                    filterParams[key] = []
                }
                applyFilters(filterParams)
                updateCheckBoxState(filterParams)
                document.querySelector('.clear-filter-tags') && document.querySelector('.clear-filter-tags').remove()
            });
        }
    }
}

// Update checkboxes based on current filters
function updateCheckBoxState(filterParams) {
    for (key in filterParams) {
        const activeFilters = filterParams[key]
        document.querySelectorAll(".filter-checkbox").forEach(filter => {
            if (filter.name === key) {
                let filterCheck = filter.id
                if (filter.id.split(' ').length > 0) {
                    filterCheck = filter.id.split(' ').join('+')
                }
                if (activeFilters.includes(filterCheck)) {
                    filter.checked = !filter.checked
                } else {
                    filter.checked = false
                }
            }
        })
    }
}

//hides all filters in a category (unless in mobile view, then this shows all, because mobile default is show none)
function showNoneEventHandler(e) {
    e.target.parentNode.classList.toggle("show-none")
}
// shows filters popup on mobile
function showFiltersEventHandler(e) {
    let filterToolbar = document.querySelector(".filter-toolbar")
    filterToolbar.classList.add("show-filters")
    // Prevents corners of mobile filter toggle from having white corners
    filterToolbar.childNodes[1].classList.remove("filtersDiv-background")
    // prevent page scrolling behind filter overlay
    document.getElementsByTagName("html")[0].classList.add("scroll-lock")
}
// hides filters popup on mobile
function hideFiltersEventHandler(e) {
    let filterToolbar = document.querySelector(".filter-toolbar")
    filterToolbar.classList.remove("show-filters")
    filterToolbar.childNodes[1].classList.add("filtersDiv-background")
    document.getElementsByTagName("html")[0].classList.remove("scroll-lock")
}

//event handler for keyboard users to click spans when focused
function tabFocusedKeyDownHandler(e) {
    // if user is using tab index and keys space or enter on item that needs to be clicked, it will be clicked
	if ((event.key === "Enter" || event.key === "Spacebar" || event.key === " ") && document.activeElement.getAttribute("aria-label")) {
        document.activeElement.click()
    }
}

//controls if no results message should display if no results match from filter selection
function toggleNoResultMsgIfNoMatch(filtersParams,querySelector) {
    if ([...document.querySelectorAll(`.${querySelector}`)].every(card => card.style.display === 'none')) {
        noResultsMessageComponent(filtersParams,'white')
    } else {
        document.querySelector(".no-results-message").innerHTML = ""
    }
}