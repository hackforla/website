const CODE_EXAMPLES = document.querySelectorAll(".code-example");

document.addEventListener("DOMContentLoaded", function () {
    primaryOnDarkHandler();
});

function primaryOnDarkHandler() {
    for (i = 0; i < CODE_EXAMPLES.length; i++) {
        if (CODE_EXAMPLES[i].firstChild.classList.contains("btn-primary-on-dark")) {
            CODE_EXAMPLES[i].classList.add("primary-on-dark-example")
        }
    }
}