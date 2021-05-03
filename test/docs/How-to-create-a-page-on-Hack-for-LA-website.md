

Starting Instructions:

1. Create HTML file in root folder with the name of your page 
> ex) ``yourPageName.html``

2. Create a sass stylesheet in ‘_sass/components’ with the same name as your HTML file but with an underscore ``_`` at the beginning. 
> ex) ``_sass/components/_yourPageName.scss``

3. Import your pages stylesheet in to the main.scss stylesheet (located: ``_sass/main.scss``) by adding this line of code under the component section in ``main.scss``
> ``@import ‘components/yourPageName.scss’``

4. Create a folder within ``assets/images`` named exactly like your html file. Here you can place all the images you are using in this folder
> ``assets/images/yourPageName``

Helpful links:
* [Standardized-Components](https://github.com/hackforla/website/wiki/Standardized-Components)
* [Hack for LA's Site Architecture](https://github.com/hackforla/website/wiki/Hack-for-LA's-Site-Architecture)
```js
<!-- Make sure to include the Jekyll Front Matter as the first thing in the file. Following the format below. -->
<!-- Any file that contains a YAML front matter block will be processed by Jekyll as a special file.-->
--- 
layout: default 
title: Your Page Name 
---

<!-- Header banner -->
<div class="header-container--yourPageName">
  <div>
    <h1>Title</h1>
    <p>Description of page</p>
  </div>
  <img
    src="./assets/images/yourPageName/yourPageName-icon.svg"
    alt="image of a person using a computer"
  />
</div>
<!-- Header banner -->


<!-- Page body -->
<div class="content-section">
 
 <!-- Card -->
 <!-- Cards have been standardized and can be found in _sass/elements/_cards-->
  <div class="page-card card-primary page-card-lg card-body card-width">
    <img
      src="./assets/images/yourPageName/yourPageName_icon.svg"
    />
    <div>
      <h3>Card Title</h3>
      <img
        class="card-icon"
        src="./assets/images/sitemap/lightbulb.svg"
      />
      <p>
        Card content for your page.
      </p>
      <!-- Buttons have been standardized and can be found in _sass/elements/_buttons.scss-->
        <button class="btn btn-primary btn--site-map-suggest">
          Button element
        </button>
      </a>
    </div>
  </div>
 <!-- Card -->

</div>

<!-- Include javaScript -->
<script>
  // Include your JavaScript code directly in this tag or create a separate file and import code.

  function helloWorld() {
    console.log('Hello World');
  }
</script>


```
