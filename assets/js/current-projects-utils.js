/**
 * Given an array of project object as returned by ``retrieveProjectDataFromCollection()``
 * Returns a filter object -> {filter_type1:[filter_value1,filter_value2], filter_type2:[filter_value1,filter_value2], ... }
*/
function createFilter(sortedProjectData, checkPage = false) {
    if (checkPage) {
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
 * Given an input of a project data array object as returned by the function `retrieveProjectDataFromCollection()`, this
 * function sorts the project twice.
 *  1. It sort all projects in the array alphabetically on their `status` value
 *  2. It sort all project by title for each status type
*/
function projectDataSorter(projectdata) {
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

if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        createFilter, projectDataSorter,
    };
}