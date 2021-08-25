const CODE_EXAMPLES = document.querySelectorAll(".code-example");
const NAV = document.querySelector(".design-system-nav");

document.addEventListener("DOMContentLoaded", function () {
    primaryOnDarkHandler();
    dropdownNav();

    window.addEventListener("resize", function () {
        dropdownNav()
    })
})

function primaryOnDarkHandler() {
    for (i = 0; i < CODE_EXAMPLES.length; i++) {
        if (CODE_EXAMPLES[i].firstChild.classList.contains("btn-primary-on-dark")) {
            CODE_EXAMPLES[i].classList.add("primary-on-dark-example")
        }
    }
}

function dropdownNav() {
    if (window.innerWidth < 480) {
        NAV.querySelector("h1").addEventListener("click", function () {
                NAV.querySelector(".nav-dropdown").classList.toggle("active-dropdown")
        })
    }
}