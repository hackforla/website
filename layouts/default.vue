<template lang='pug'>
  div#app
    a#skip-link.sr-only-focusable(href='#content') Skip to main content.
    header.main-header
      .main-header-content
        .branding
          .sr-only Hack for LA
          img(src='~/assets/images/logo-hfla.svg').logo
        nav.header-nav
          ul.inline-list
            li
              a(href='#hack-nights').js-smooth-scroll
                svg.icon.icon-hack-nights.nav-icon
                  use(xlink:href=`#icon-hack-nights`)
                | Hack Nights
            li
              a(href='#projects').js-smooth-scroll
                svg.icon.icon-projects.nav-icon
                  use(xlink:href=`#icon-projects`)
                | Projects
            li
              a(href='#press').js-smooth-scroll
                svg.icon.icon-press.nav-icon
                  use(xlink:href=`#icon-press`)
                | Press
            li
              a(href='#about').js-smooth-scroll
                svg.icon.icon-about.nav-icon
                  use(xlink:href=`#icon-about`)
                | About
            li.hide-mobile
              a(href='#contact').js-smooth-scroll Contact Us
        .social-links
          ul.inline-list.social-list
            li(v-for='item in headerSocial')
              a(:href='item.link', target='_blank').js-social-link
                .icon
                //- svg.icon(class=`icon-${item.name.toLowerCase()}`)
                //-   use(xlink:href=`#icon-${item.name.toLowerCase()}`)
                span.sr-only {item.name}
    main
      nuxt
    footer.main-footer
      .page-contain
        block footer
          nav.footer-nav
            .social-links
              h2.social-header Follow us&mdash;
              ul.inline-list.social-list
                li(v-for='item in social')
                  a(:href='item.link', target='_blank').js-social-link
                    .icon
                    //- svg.icon(class=`icon-${item.name.toLowerCase()}`)
                    //-   use(xlink:href=`#icon-${item.name.toLowerCase()}`)
                    span.sr-only {item.name}

    script.
      (function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
      (i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
      m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
      })(window,document,'script','//www.google-analytics.com/analytics.js','ga');
      ga('create', 'UA-112591348-1', 'auto');
      ga('send', 'pageview');
</template>

<script>
export default {
  data: function() {
    return {
      headerSocial: [
        {
          name: 'Github',
          link: 'https://github.com/hackforla'
        },
        {
          name: 'Slack',
          link: 'https://hackforla-slack.herokuapp.com/'
        },
        {
          name: 'Facebook',
          link: 'https://hackforla-slack.herokuapp.com/'
        }
      ]
    };
  }
};
</script>

<style>
</style>
