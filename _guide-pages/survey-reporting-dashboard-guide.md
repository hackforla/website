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
  <p class="subheading" >Link your survey results to a designated Google Sheets workbook</p>
  <h4 class="title-section">Select Response Destination</h4>
  <p>Click the vertical elipsis located at the top right of the survey form</p>

  <div class="overlay-links">
    <img class="elipsis" src="../assets/images/guides/survey-reporting/dashboard-0.png">
    <!-- Arrows and Overlay Text Links -->
    <!-- RIGHT SIDE LINKS -->
    <img class="elipsis" src="../assets/images/guides/pink-pointer.svg">
    <h4><a href="#" class="elipsis">VERTICAL ELIPSIS</a></h4>
    <img src="../assets/images/guides/gray-arrow.svg" class="grayarrow"><br>
    <img class="select-response-and-destination" src="../assets/images/guides/survey-reporting/dashboard-1.png">
    <!-- Arrows and Overlay Text Links -->
    <!-- RIGHT SIDE LINKS -->
    <img class="" src="../assets/images/guides/pink-pointer.svg">
    <h4><a href="#" class="select-response-and-destination">SELECT RESPONSE DESTINATION</a></h4>
    <img src="../assets/images/guides/gray-arrow.svg" class="grayarrow"><br>
    <img class="select-response-and-destination" src="../assets/images/guides/survey-reporting/dashboard-2.png">
    <!-- Arrows and Overlay Text Links -->
    <!-- LEFT SIDE LINKS -->
    <img class="elipsis" src="../assets/images/guides/pink-pointer.svg">
    <h4><a href="#" class="elipsis">SELECT EXISTING SPREADSHEET</a></h4>
    <img src="../assets/images/guides/gray-arrow.svg" class="grayarrow"><br>
    <img class="select-target-sheet" src="../assets/images/guides/survey-reporting/dashboard-3.png">
    <!-- Arrows and Overlay Text Links -->
    <!-- LEFT SIDE LINKS -->
    <img class="select-target-sheet" src="../assets/images/guides/pink-pointer.svg">
    <h4><a href="#" class="select-target-sheet">SELECT TARGET SHEET</a></h4>
  </div>
</div>

<div class="section-container">
  <h3 id="clean-data-google-sheets">Clean Data in Google Sheets </h3>
  <h5>Clean the data exported by your Google Form to enable proper manipulation in Google Data Studio</h5>
  <h4 class="title-section" >Format Spreadsheet </h4>
  <p>
    Once you have set the response destination for your Google Form to your desired Google Sheets File, your data will be visible in a new worksheet. <br><br>
    (1) Choose a short, yet descriptive title for your worksheet. If your spreadsheet contains multiple worksheets, move the new tab to the desired location by dragging and dropping using the tab selector. <br><br>
    (2) Format the first row of data. Select the first row, then go to Format -> Text Wrapping -> Wrap. <br><br>
    (3) Select the first row and set the font to bold. Add a background color to further set the column titles off from the rows of data below.
  </p>
    <img class="format-spreadsheet" src="../assets/images/guides/survey-reporting/dashboard-4.png">
    <!-- Arrows and Overlay Text Links -->
    <!-- LEFT SIDE LINKS -->
    <img class="format-spreadsheet" src="../assets/images/guides/pink-pointer.svg">
    <h4><a href="#" class="format-spreadsheet">ROW 1</a></h4>
    <img class="format-spreadsheet" src="../assets/images/guides/pink-pointer.svg">
    <h4><a href="#" class="format-spreadsheet">LINKED WORKSHEET TAB</a></h4>
    <h4 class="title-section">CREATE NEW COLUMNS</h4>
    <p> 
      Depending on the way your data is structured within a particular column, you will need to insert columns in order to clean your data for processing. <br><br>
      In most cases, where data is formatted as a list within a cell, this can be accomplished through the insertion of 2 new columns to the right of your target column data. <br><br>
      (1) Select the target column (‘G’). As a shortcut, select the column that immediately precedes as well (‘F’). <br><br>
      (2) In the Go to the Insert menu -> choose ‘2 Columns right.’
    </p>
    <img class="create-new-columns" src="../assets/images/guides/survey-reporting/dashboard-5.png">
    <h4 class="title-section">TITLE NEW COLUMNS</h4>
    <p>
      Once you have created your new columns to clean your data, title the new columns the same title as your target column with an appendage, such as “- 1” and “- 2”. This will distinguish your new columns from your target column
    </p>
    <img class="title-new-columns" src="../assets/images/guides/survey-reporting/dashboard-6.png">
    <h4 class="title-section">TRANSPOSE ROW DATA</h4>
    <p>
      To create a chart, whether direclty in Google Sheets, or by using a data visualization tool like Google Data Studio, we must have a 1:1 relationship between the data in a particular cell and its dimension (column name). By default, survey questions of the “check all that apply” variety produce data arrays that violate this principle. <br><br>

      We use the TRANSPOSE() function with the SPLIT() and JOIN() functions to achieve this outcome. In our example, we enter the formula =TRANSPOSE((SPLIT(JOIN(“,”, G2:G995), “,”))) in cell H2. <br><br>

      How did we choose G995 as the endpoint of our range? The parameter requires a defined end point; therefore, we arbitrarily choose a cell value beyond which we are certain no future values will be recorded.
    </p>
    <img class="transpose-row-data" src-"../assets/images/guides/survey-reporting/dashboard-7.png">

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