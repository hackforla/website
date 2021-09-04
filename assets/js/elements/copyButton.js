const issueTemplate = document.querySelector('.issue-template-code');
const templateCode = document.querySelector('.template-code');
const copyButton = document.querySelector('.copy-button');
const buttonText = document.querySelector('.copy-button-text');

copyButton.addEventListener("click", copyText);

async function copyText() {
  const textToCopy = templateCode.innerText
  try {
    await navigator.clipboard.writeText(textToCopy)
    buttonText.innerText = "Copied"
    setTimeout(()=> {
      buttonText.innerText = "Copy"
    }, 1000)
  } catch (err) {
    const div = document.createElement('div');
    div.classList.add('copy-err');
    div.innerText = `Failed to copy`;
    issueTemplate.append(div);
    setTimeout(()=> {
      div.remove()
    }, 1500)
  }
}