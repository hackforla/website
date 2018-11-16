<template lang="pug">
div
  header.hero
    .hero-inner
      h1 {{ contents.hero.title }}
      p.type-featured  {{ contents.hero.dek }}
      form.hero-signup(
          name='Quick Signup Form',
          @submit.prevent='submitQuickSignup')
        .form-input
          label(for='hero-signup').sr-only Enter your email address
          input(type='email',
            name='email',
            v-model='quickSignupEmail',
            placeholder='Enter your email address', required)#hero-signup
        button(type='submit').btn.btn-primary Sign up for updates
        .form-confirmation(v-if='quickSignupSubmitted')
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
            address
              a(:href='location.map', target='_blank').
                {{ location.address1 }}#[br]
                {{ location.address2 }}, {{ location.city }}, {{ location.state }} {{ location.zip }}
      p
        a(href='https://www.meetup.com/hackforla/',
          target='_blank').btn.btn-primary RSVP on Meetup
        a(href='http://hackforla-slack.herokuapp.com/',
          target='_blank').btn.btn-primary Join our Slack

    .page-contain
      h2.cal-title More Upcoming Events
      Calendar
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
                a(v-if='item.partnerLink',
                    :href='item.partnerLink',
                    target='_blank') {{ item.partner }}
                span(v-else) {{ item.partner }}
              .project-needs(v-if='item.looking')
                strong Looking for:
                |  {{ item.looking }}
              .project-location(v-if='item.location')
                strong Location:
                |  {{ item.location }}
      p.project-pitch.
        Have an idea? #[a(href='#contact' v-smooth-scroll).btn.btn-primary Submit your pitch]

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
      p {{ contents.about.dek }}
      #contact
        h3 Contact Us
        p.
          Are you press and want to get in touch? Are you interested in
          becoming a sponsor? Want to just
          #[a(href='http://hackforla-slack.herokuapp.com/', target='_blank') check us out on Slack]?
          Looking to volunteer?
        form.contact-form(
            action='thank-you',
            method='post',
            name='Contact Form',
            netlify,
            netlify-honeypot='bot-field',
            @submit.prevent='submitFeedback')
          textarea(placeholder='Send us a message',
              name='message',
              v-model='feedbackText',
              required)
          .form-controls
            .form-input
              label(for='contact-email').sr-only Enter your email address
              input(type='email',
                name='email',
                placeholder='Enter your email address',
                v-model='feedbackEmail'
                required)#contact-email
            .sr-only
              label Don't fill this out if you're human:
                input(name='bot-field')
            button(type='submit').btn.btn-primary Send message
          p.form-confirmation(v-if='feedbackSubmitted')
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
import Calendar from '@/components/Calendar';
import axios from 'axios';
import content from '~/static/content/index.md';
import { ACTION_NETWORK_API } from '~/constants/action-network';

export default {
  components: {
    Calendar
  },
  data() {
    return {
      contents: content.attributes,
      quickSignupEmail: '',
      quickSignupLoading: false,
      quickSignupSubmitted: false,
      feedbackEmail: '',
      feedbackText: '',
      feedbackLoading: false,
      feedbackSubmitted: false
    };
  },
  methods: {
    submitQuickSignup() {
      if (this.quickSignupLoading) {
        return;
      }
      this.quickSignupLoading = true;
      this.quickSignupSubmitted = false;
      this.submitEmail(this.quickSignupEmail).then(() => {
        this.quickSignupLoading = false;
        this.quickSignupSubmitted = true;
        this.quickSignupEmail = '';
      });
    },
    submitFeedback() {
      if (this.feedbackLoading) {
        return;
      }
      this.feedbackLoading = true;
      this.feedbackSubmitted = false;
      return this.submitEmail(this.feedbackEmail)
        .then(() => {
          return axios.post('/thank-you', {
            message: this.feedbackText,
            email: this.feedbackEmail
          });
        })
        .then(() => {
          this.feedbackLoading = false;
          this.feedbackSubmitted = true;
          this.feedbackEmail = '';
          this.feedbackText = '';
        });
    },
    submitEmail(email) {
      return axios.post(
        'https://actionnetwork.org/api/v2/people/',
        {
          person: {
            email_addresses: [
              {
                address: email
              }
            ]
          }
        },
        {
          headers: {
            'OSDI-API-Token': ACTION_NETWORK_API,
            'Content-Type': 'application/json'
          }
        }
      );
    }
  }
};
</script>

<style>
</style>
