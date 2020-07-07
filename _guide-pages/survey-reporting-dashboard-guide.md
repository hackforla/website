---
title: Survey Reporting Dashboard Guide
description: Google Analytics includes a number of tools that allow individuals and teams to capture and analyze different types of data. These tools are especially valuable when it comes to survey-based user research. <br><br> This guide will walk through the integration of Google Forms, Google Sheets, and Google Data Studio in order to visualize a set of user survey data. <br><br>The example described includes connecting a Google Form to Google Sheets, cleaning a set of data within a Worksheet, and finally, building a data report in Google Data Studio. <br><br> <em>For more detailed guidance, please see Additional Resources. </em>

in-this-guide: 
- name: Connect Google Form to Google Sheets
  link: '#link-to-google'
- name: Clean Data in Google Sheets
- name: Build Report in Google Data Studio
- name: Additional Resources
---

<div class="section-container">
  <h3 id="link-to-google"> Link Google Form to Google Sheets</h3>
  <h5>Link your survey results to a designated Google Sheets workbook</h5>
  <h5 class="pink-header">Select Response Destination</h5>
  <p>Click the vertical elipsis located at the top right of the survey form</p>

  <div class="overlay-links">
    <img class="screenshot" src="../assets/images/guides/survey-reporting/dashboard-0.png">
    <!-- Arrows and Overlay Text Links -->
    <!-- RIGHT SIDE LINKS -->
    <img class="elipsis" src="../assets/images/guides/pink-pointer.svg">
    <h4><a href="#" class="elipsis">VERTICAL ELIPSIS</a></h4>
    <img src="../assets/images/guides/gray-arrow.svg" class="grayarrow"><br>
    <img class="select-response-and-destination" src="../assets/images/guides/survey-reporting/dashboard-1.png">
    <!-- Arrows and Overlay Text Links -->
    <!-- RIGHT SIDE LINKS -->
    <img class="elipsis" src="../assets/images/guides/pink-pointer.svg">
    <h4><a href="#" class="elipsis">SELECT RESPONSE DESTINATION</a></h4>
    <img src="../assets/images/guides/gray-arrow.svg" class="grayarrow"><br>
    <img class="select-response-and-destination" src="../assets/images/guides/survey-reporting/dashboard-2.png">
    <!-- Arrows and Overlay Text Links -->
    <!-- LEFT SIDE LINKS -->
    <img class="elipsis" src="../assets/images/guides/pink-pointer.svg">
    <h4><a href="#" class="elipsis">SELECT EXISTING SPREADSHEET</a></h4>
    <img src="../assets/images/guides/gray-arrow.svg" class="grayarrow"><br>
    <img class="select-response-and-destination" src="../assets/images/guides/survey-reporting/dashboard-3.png">
    <!-- Arrows and Overlay Text Links -->
    <!-- LEFT SIDE LINKS -->
    <img class="elipsis" src="../assets/images/guides/pink-pointer.svg">
    <h4><a href="#" class="elipsis">SELECT TARGET SHEET</a></h4>
</div>
<div class="section-container link-section">
  <h3>Clean Data in Google Sheets </h3>
  <h5>Clean the data exported by your Google Form to enable proper manipulation in Google Data Studio</h5>
</div>

    

<script>
    const issueTemplate = document.querySelector('.issue-template-code');
    const code = document.querySelector('.template-code');
    const copyButton = document.querySelector('.copy-button');

    copyButton.addEventListener("click", copyText);

    function copyText() {
        issueTemplate.focus();
        document.execCommand("selectAll");
        const text = code.value;
        document.execCommand("copy");
        copyButton.style.border = "0.5px solid #7A7A7A";
        copyButton.style.boxShadow = "inset 0px 0px 6px rgba(0, 0, 0, 0.39)";
    }
</script>