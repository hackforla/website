document.addEventListener('click', (e) => {
    // <- Dropdown functionality
    const isDropdownArrow = e.target.closest("[data-dropdown-arrow");
    let currentDropdown;
    if (isDropdownArrow) {
        currentDropdown = e.target.closest("[data-dropdown]");
        currentDropdown.classList.toggle("activated");
    }
    document.querySelectorAll("[data-dropdown].activated").forEach(dropdown => {
        if (dropdown === currentDropdown) return;
        dropdown.classList.remove("activated");
    })
    // Dropdown functionality ->
})
