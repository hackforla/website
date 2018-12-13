<template lang="pug">
  div#app.app
    a#skip-link.sr-only-focusable(href='#content') Skip to main content.
    header.main-header
      .main-header-content
        .branding
          .sr-only Hack for LA
          HflaLogo.logo
        nav.header-nav
          ul.inline-list
            li
              a(href='#hack-nights', v-smooth-scroll)
                IconHackNights.icon.icon-hack-nights.nav-icon
                | Hack Nights
            li
              a(href='#projects', v-smooth-scroll)
                IconProjects.icon.icon-hack-nights.nav-icon.icon.icon-projects.nav-icon
                | Projects
            li
              a(href='#press', v-smooth-scroll)
                IconPress.icon.icon-hack-nights.nav-icon.icon.icon-projects.nav-icon.icon.icon-press.nav-icon
                | Press
            li
              a(href='#about', v-smooth-scroll)
                IconAbout.icon.icon-hack-nights.nav-icon.icon.icon-projects.nav-icon.icon.icon-about.nav-icon
                | About
            li.hide-mobile
              a(href='#contact', v-smooth-scroll) Contact Us
        .social-links
          ul.inline-list.social-list
            li(v-for='item in headerSocial')
              a(:href='item.link', target='_blank', :class='`js-social-link js-social-link-${item.name.toLowerCase()}`')
                component(:is='item.icon', :class='`icon-${item.name.toLowerCase()}`').icon
                span.sr-only {{ item.name }}
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
                  a(:href='item.link', target='_blank', :class='`js-social-link js-social-link-${item.name.toLowerCase()}`')
                    component(:is='item.icon', :class='`icon-${item.name.toLowerCase()}`').icon
                    span.sr-only {{ item.name }}
    script(src='https://identity.netlify.com/v1/netlify-identity-widget.js')
    script.
      if (window.netlifyIdentity) {
        window.netlifyIdentity.on('init', function(user) {
          if (!user) {
            window.netlifyIdentity.on('login', function() {
              document.location.href = '/admin/';
            });
          }
        });
      }
    script.
      (function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
      (i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
      m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
      })(window,document,'script','//www.google-analytics.com/analytics.js','ga');
      ga('create', 'UA-112591348-1', 'auto');
      ga('send', 'pageview');
</template>

<script>
import HflaLogo from '~/assets/images/logo-hfla.svg';
import IconAbout from '~/assets/images/icon-about.svg';
import IconHackNights from '~/assets/images/icon-hack-nights.svg';
import IconPress from '~/assets/images/icon-press.svg';
import IconProjects from '~/assets/images/icon-projects.svg';
import LogoFacebook from '~/assets/images/icon-facebook.svg';
import LogoGithub from '~/assets/images/icon-github.svg';
import LogoMeetup from '~/assets/images/icon-meetup.svg';
import LogoSlack from '~/assets/images/icon-slack.svg';
import LogoTwitter from '~/assets/images/icon-twitter.svg';
import LogoMedium from '~/assets/images/icon-medium.svg';

export default {
  components: {
    HflaLogo,
    IconAbout,
    IconHackNights,
    IconPress,
    IconProjects
  },
  data: function() {
    return {
      headerSocial: [
        {
          name: 'Github',
          link: 'https://github.com/hackforla',
          icon: LogoGithub
        },
        {
          name: 'Slack',
          link: 'https://hackforla-slack.herokuapp.com/',
          icon: LogoSlack
        },
        {
          name: 'Facebook',
          link: 'https://hackforla-slack.herokuapp.com/',
          icon: LogoFacebook
        },
        {
          name: 'Medium',
          link: 'https://medium.com/hack-for-la',
          icon: LogoMedium
        }
      ],
      social: [
        {
          name: 'Meetup',
          link: 'https://www.meetup.com/hackforla/',
          icon: LogoMeetup
        },
        {
          name: 'Github',
          link: 'https://github.com/hackforla',
          icon: LogoGithub
        },
        {
          name: 'Slack',
          link: 'https://hackforla-slack.herokuapp.com/',
          icon: LogoSlack
        },
        {
          name: 'Facebook',
          link: 'https://www.facebook.com/hackforla',
          icon: LogoFacebook
        },
        {
          name: 'Medium',
          link: 'https://medium.com/hack-for-la',
          icon: LogoMedium
        },
        {
          name: 'Twitter',
          link: 'https://twitter.com/HackForLA',
          icon: LogoTwitter
        }
      ]
    };
  }
};
</script>

<style></style>
