// Keyboard accessibility for header nav

let menuItems = document.querySelectorAll('li.dropdown');
let dropdownContent = document.querySelectorAll('ul.dropdown-content');

menuItems.forEach((item) => {
    item.addEventListener('keydown', (event) => {
        if (event.target.className === "menu-item") {
            dropdownContent.forEach((item => {
                item.style.display = "";
            }))
            let menuContent = event.target.nextElementSibling.children[0];
            menuContent.style.display = "block";
        }
    });
});