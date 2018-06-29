<template lang="pug">
div
  header.hero
    .hero-inner
      h1 {{ contents.hero.title }}
      p.type-featured  {{ contents.hero.dek }}
      form.js-ajax-form.hero-signup(name='Quick Signup Form')
        .form-input
          label(for='hero-signup').sr-only Enter your email address
          input(type='email',
            name='email',
            placeholder='Enter your email address', required)#hero-signup
        button(type='submit').btn.btn-primary Sign up for updates
        .form-confirmation.hidden
          strong Thanks! You'll hear from us soon.
  section#hack-nights.content-section.section-hack-nights
    .page-contain
      h2 {{ contents.location.title }}
      p {{ contents.location.dek }}
      .locations
        .location(v-for='location in contents.location.locations')
          .location-img(:style='{ "background-image": `url(${location.image})` }')
          .location-details
            h3.location-header
            strong {{ location.title }}
            |  {{ location.date }}
            address.
              {{ location.address1 }}#[br]
              {{ location.address2 }}, {{ location.city }}, {{ location.state }} {{ location.zip }}
      p
        a(href='https://www.meetup.com/hackforla/',
          target='_blank').btn.btn-primary RSVP on Meetup
        a(href='http://hackforla-slack.herokuapp.com/',
          target='_blank').btn.btn-primary Join our Slack

  section#projects.content-section.projects
    .page-contain.projects-inner
      h2.project-header Current Projects
      ul.project-list.unstyled-list
        li.project-card(v-for='item in contents.projects')
          .project-card-inner
            .project-tmb
               img(:src='item.image').project-tmb-img
            .project-body
              h4.project-title {{ item.title }}
              p.project-description {{ item.dek }}
              .project-links(v-if='item.links')
                strong 
                  |  Links:
                  |
                template(v-for='link, index in item.links')
                  a(:href='link.url', target='_blank') {{ link.name }}
                  template(v-if='Object.keys(item.links).length > index + 1')
                    | ,
                    |
              .project.partner(v-if='item.partner')
                strong
                  | Partner:
                  |
                a(v-if='item.partnerLink', :href='item.partnerLink', target='_blank') {{ item.partner }}
                span(v-else) {{ item.partner }}
              .project-needs(v-if='item.looking')
                strong Looking for:
                |  {{ item.looking }}
              .project-location(v-if='item.location')
                strong Location:
                |  {{ item.location }}
      p.project-pitch.
        Have an idea? #[a(href='#contact').js-smooth-scroll.btn.btn-primary Submit your pitch]

  section#press.content-section.press
    .page-contain
      blockquote.quote
        p {{ contents.testimonial.quote }}
        cite.type-h4 {{ contents.testimonial.source }}
        img(:src='contents.testimonial.image').quote-tmb
      h2 Press
      ul.news-cards.unstyled-list
        li(v-for='item in contents.press') 
          .news-card
            .news-card-inner
              .news-body
                h4.news-title
                  a(:href='item.url') {{ item.title }}
                p {{ item.source }}

  section#about.content-section.about
    .page-contain
      h2 {{ contents.about.title }}
      | {{ contents.about.dek }}
      #contact
        h3 Contact Us
        p.
          Are you press and want to get in touch? Are you interested in becoming a sponsor? Want to just #[a(href='http://hackforla-slack.herokuapp.com/', target='_blank') check us out on Slack]? Looking to volunteer?
        form.js-ajax-form.contact-form(action='thank-you', method='post', name='Contact Form', netlify, netlify-honeypot='bot-field')
          textarea(placeholder='Send us a message', name='message', required)
          .form-controls
            .form-input
              label(for='contact-email').sr-only Enter your email address
              input(type='email',
                name='email',
                placeholder='Enter your email address', required)#contact-email
            .sr-only
              label Don't fill this out if you're human:
                input(name='bot-field')
            button(type='submit').btn.btn-primary Send message
          p.form-confirmation.hidden
            strong Thanks! You'll hear from us soon.
  section#sponsors.content-section
    .section-inner.page-contain
      .section-body-full
        h2 Sponsors
        .logo-garden
          ul.unstyled-list
            li(v-for='item in contents.sponsors')
              .logo
                a(:href='item.url', target='_blank')
                  img(:src='item.image', :alt='item.name')
</template>

<script>
import content from '~/static/content/index.md';

export default {
  components: {},
  data: function() {
    return { contents: content.attributes };
  }
};
</script>

<style>
.container {
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  text-align: center;
}

.title {
  font-family: 'Quicksand', 'Source Sans Pro', -apple-system, BlinkMacSystemFont,
    'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; /* 1 */
  display: block;
  font-weight: 300;
  font-size: 100px;
  color: #35495e;
  letter-spacing: 1px;
}

.subtitle {
  font-weight: 300;
  font-size: 42px;
  color: #526488;
  word-spacing: 5px;
  padding-bottom: 15px;
}

.links {
  padding-top: 15px;
}
</style>
