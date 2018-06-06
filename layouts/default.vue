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
              a(href='#hack-nights', v-smooth-scroll)
                img(src='~/assets/images/icon-hack-nights.svg').icon.icon-hack-nights.nav-icon
                | Hack Nights
            li
              a(href='#projects', v-smooth-scroll)
                img(src='~/assets/images/icon-projects.svg').icon.icon-hack-nights.nav-icon.icon.icon-projects.nav-icon
                | Projects
            li
              a(href='#press', v-smooth-scroll)
                img(src='~/assets/images/icon-press.svg').icon.icon-hack-nights.nav-icon.icon.icon-projects.nav-icon.icon.icon-press.nav-icon
                | Press
            li
              a(href='#about', v-smooth-scroll)
                img(src='~/assets/images/icon-about.svg').icon.icon-hack-nights.nav-icon.icon.icon-projects.nav-icon.icon.icon-about.nav-icon
                | About
            li.hide-mobile
              a(href='#contact', v-smooth-scroll) Contact Us
        .social-links
          ul.inline-list.social-list
            li(v-for='item in headerSocial')
              a(:href='item.link', target='_blank').js-social-link
                img(:src='require(`~/assets/images/icon-${item.name.toLowerCase()}.svg`)', :class='`icon-${item.name.toLowerCase()}`').icon
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
                    img(:src='require(`~/assets/images/icon-${item.name.toLowerCase()}.svg`)', :class='`icon-${item.name.toLowerCase()}`').icon
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
      ],
      social: [
        {
          name: 'Meetup',
          link: 'https://www.meetup.com/hackforla/'
        },
        {
          name: 'Slack',
          link: 'https://hackforla-slack.herokuapp.com/'
        },
        {
          name: 'Github',
          link: 'https://github.com/hackforla'
        },
        {
          name: 'Facebook',
          link: 'https://www.facebook.com/hackforla'
        },
        {
          name: 'Twitter',
          link: 'https://twitter.com/HackForLA'
        }
      ]
    };
  }
};
</script>

<style>
</style>
