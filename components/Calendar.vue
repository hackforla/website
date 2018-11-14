<template lang="pug">
.cal-container
  .cal
    CalendarItem(v-for="item in calendar", :key="item.id", v-bind="item")
</template>

<script>
import CalendarItem from '@/components/CalendarItem';
import axios from 'axios';
import { CALENDAR_ID, CALENDAR_API } from '@/constants/calendar';

export default {
  components: { CalendarItem },
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
      axios
        .get(
          `https://www.googleapis.com/calendar/v3/calendars/${encodeURI(
            CALENDAR_ID
          )}/events`,
          {
            params: {
              maxItems: 100,
              orderBy: 'startTime',
              singleEvents: true,
              timeMin: new Date(new Date().setHours(0, 0, 0, 0)).toISOString(),
              key: CALENDAR_API
            }
          }
        )
        .then(({ data }) => {
          this.calendar = data.items.filter(
            item => item.summary && item.summary.indexOf('Hack Night') < 0
          );
        });
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
