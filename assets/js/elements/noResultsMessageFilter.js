function noResultsMessageComponent(filterParams, textColor) {
    let filterList = ``
    let filterNameSingular = {"technologies": "Technology", "languages": "Language", "tools": "Tool", "programs": "Program", "status": "Status", "Search": "Search"}
    for (let key in filterParams) {
        if (filterParams[key].length) {
            for (let i = 0; i < filterParams[key].length; i++) {
                filterList += `<p>"<span class='toolkit-red'>${filterNameSingular[key]}: ${filterParams[key][i]}</span>"</p>`
            }
        }
    }

	const noResultsMsgEle = document.querySelector(".no-results-message")
	noResultsMsgEle.style.color = textColor
	noResultsMsgEle.innerHTML = `
    <div>  
        <p>We couldn't find results for:</p>
            ${filterList}
    </div>
    <div>
        <h3>Search Tips</h3>
        <ul>
            <li><p>Broaden your search by removing some of the filters</p></li>
        </ul>
    </div>
    `
}