const issueTemplate = document.querySelector('.issue-template-code');
const copyButton = document.querySelector('.copy-button');
const buttonText = document.querySelector('.copy-button-text');

copyButton.addEventListener("click", copyText);

function copyText() {
    issueTemplate.focus();
    document.execCommand("selectAll");
    document.execCommand("copy");
    buttonText.innerText = "Copied"
    setTimeout(()=> {
      buttonText.innerText = "Copy"
      issueTemplate.blur();
      window.getSelection().removeAllRanges();
    }, 1000)
}
