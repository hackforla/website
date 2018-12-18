<template lang="pug">
  .cal-item
    .type-h4.cal-item--title {{ summary }}
    .cal-item--details(v-if="time") {{ time }}
    .cal-item--details(v-if="location") {{ location }}
    .cal-item-details.cal-item--description(
        v-if="description",
        v-show="expanded",
        v-html="description")
    button(@click='expanded = !expanded', v-if='description')
      | {{ expanded ? 'Less info' : 'More info' }}
</template>

<script>
export default {
  props: {
    summary: {
      type: String,
      default: ''
    },
    start: {
      type: Object,
      default: null
    },
    location: {
      type: String,
      default: null
    },
    description: {
      type: String,
      default: null
    }
  },
  data() {
    return {
      expanded: false
    };
  },
  computed: {
    time() {
      if (this.start && 'date' in this.start) {
        return new Date(this.start.date).toLocaleString('en-US', {
          timeZone: 'UTC',
          weekday: 'long',
          day: 'numeric',
          month: 'long',
          year: 'numeric'
        });
      }
      if (this.start && 'dateTime' in this.start) {
        return new Date(this.start.dateTime).toLocaleString('en-US', {
          timeZone: 'America/Los_Angeles',
          weekday: 'long',
          day: 'numeric',
          month: 'long',
          year: 'numeric',
          hour: 'numeric',
          minute: 'numeric'
        });
      }
      return null;
    }
  }
};
</script>

<style></style>
