<template lang="pug">
.cal-container
  .cal
    .cal-item(v-for="item in calendar" v-if="item.summary && item.summary !== 'Westside Hack Night' && item.summary !== 'DTLA Hack Night'" v-bind:key="item.id")
      .type-h4.cal-item--title {{ item.summary }}
      .cal-item--details(v-if="item.start && item.start.date") {{ new Date(item.start.date).toLocaleString('en-US', {timeZone: 'America/Los_Angeles', weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'}) }}
      .cal-item--details(v-else-if="item.start && item.start.dateTime") {{ new Date(item.start.dateTime).toLocaleString('en-US', {timeZone: 'America/Los_Angeles', weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', hour: 'numeric', minute: 'numeric'}) }}
      .cal-item--details(v-if="item.location") {{ item.location }}
      .cal-item-details.cal-item--description(v-if="item.description && item.showMore" v-html="item.description")
      div
        button(v-if="!item.showMore && item.description" @click="showInfo(item)") More Info
        button(v-else-if="item.showMore" @click="closeInfo(item)") Less Info
</template>
<script>
export default {
  props: {
    calId: {
      type: String,
      required: true
    },
    apiKey: {
      type: String,
      required: true
    }
  },
  data() {
    return {
      calendar: []
    };
  },
  mounted: function() {
    this.getCal();
  },
  methods: {
    getCal() {
      const CAL_ID = this.$props.calId;
      // this API key is secured for access only from hackforla.org and localhost
      const API_KEY = this.$props.apiKey;
      let url =
        'https://www.googleapis.com/calendar/v3/calendars/' +
        encodeURI(CAL_ID) +
        '/events?maxItems=100&orderBy=startTime&singleEvents=true&timeMin=' +
        // min date is set to start of current day
        new Date(new Date().setHours(0, 0, 0, 0)).toISOString() +
        '&key=' +
        API_KEY;
      let req = new XMLHttpRequest();
      req.open('GET', url, true);
      req.send();
      req.onload = () => {
        let json = JSON.parse(req.responseText);
        json = json.items;
        json = json.map(element => {
          element.showMore = false;
          return element;
        });
        this.calendar = json;
      };
    },
    showInfo(item) {
      item.showMore = true;
    },
    closeInfo(item) {
      item.showMore = false;
    }
  }
};
</script>
