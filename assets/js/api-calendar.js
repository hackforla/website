(function(){
function getCalendar() {
  const CALENDAR_ID = 'rt7upiraveki91ackkut994pds@group.calendar.google.com';
  const CALENDAR_API = 'AIzaSyDYFeOpGG5KZ20hxmswJzZh3snZpGtfga4';
  const googleURL = 'https://www.googleapis.com/calendar/v3/calendars/';
  const timeMin = new Date(new Date().setHours(0, 0, 0, 0)).toISOString();

  function formatDateAndTime(dateTime, formatType) {
    const date = {
      timeZone: 'America/Los_Angeles',
      weekday: 'long',
      day: 'numeric',
      month: 'long',
    };
    const time = {
      timeZone: 'America/Los_Angeles',
      hour: 'numeric',
      minute: 'numeric',
    };
    const dateAndTime = { ...date, ...time };
    let output;
    if (formatType === 'date') {
      output = date;
    } else if (formatType === 'time') {
      output = time;
    } else {
      output = dateAndTime;
    }
    return new Date(dateTime).toLocaleString('en-US', output);
  }

  function filterCalendarEvents(items) {
    const calendarEvents = items.filter(item => (
      item.summary && item.summary.indexOf('Hack Night') < 0 && item.end.dateTime >= new Date().toISOString()
    ));
    return calendarEvents;
  }

  function mapCalendarEvents(events) {
    const mappedEvents = events.map((item) => {
      item.start.dateTime = formatDateAndTime(item.start.dateTime, 'dateAndTime');
      item.end.dateTime = formatDateAndTime(item.end.dateTime, 'time');
      return item;
    });
    return mappedEvents;
  }

  function insertDetails(item, index) {
    const container = document.querySelector('.cal');
    const calItem = document.createElement('div');
    calItem.classList.add('cal-item');
    calItem.innerHTML = `<div class="type-h4 cal-item--title">${item.summary}</div>
      <div class="cal-item--details">${item.start.dateTime} - ${item.end.dateTime}</div>
      <div class="cal-item--details">${item.location}</div>
      <div class="cal-item--details cal-item--description" style="display: none;">${item.description}</div>`;
    container.append(calItem);
    if (item.description) {
      const btn = document.createElement('button');
      btn.innerText = 'More info';
      btn.addEventListener('click', (event) => {
        const node = document.querySelectorAll('.cal-item--description')[index];
        node.style.display = node.style.display === 'none' ? 'block' : 'none';
        node.style.display === 'block' ? btn.innerText = 'Less info' : btn.innerText = 'More info';
      });
      calItem.append(btn);
    }
  }

  function errEventsDisplay(calendarPillMessage) {
    const container = document.querySelector('.cal');
    if (container) {
    const el = document.createElement('div');
    el.classList.add('cal-item');
    el.innerHTML = `<div class="type-h4 cal-item--title">${calendarPillMessage}</div>`;
    container.append(el);
    }
  }

  const fetchURL = `${googleURL}${encodeURI(CALENDAR_ID)}/events?key=${CALENDAR_API}&singleEvents=true&timeMin=${timeMin}&orderBy=startTime`;

  function handleErrors(response) {
    if (response.ok) {
      return response.json();
    }
    throw Error(response.statusText);
  }

  function fetchCalendar(url) {
    if (url == true) {
      return fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      })
        .then(response => handleErrors(response))
        .then((response) => {
          const calendarEvents = filterCalendarEvents(response.items);
          const mappedEvents = mapCalendarEvents(calendarEvents);
          if (mappedEvents.length > 0) {
            mappedEvents.forEach(insertDetails);
          } else {
            errEventsDisplay('No scheduled events other than Hack Nights.');
          }
        })
        .catch(() => {
          errEventsDisplay('Sorry, the Google Calendar API seems not to be working temporarily.  Please see our meetup link above for the latest events.');
        });
    }
  }
  fetchCalendar(fetchURL);
}
getCalendar();
})()
