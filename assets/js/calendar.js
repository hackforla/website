(function () {
  /***** import old data because couldn't get fetch to work *******/
  const data = window.data;
  /**************************************************************/
  const CALENDAR_ID = 'rt7upiraveki91ackkut994pds@group.calendar.google.com';
  const CALENDAR_API = 'AIzaSyDYFeOpGG5KZ20hxmswJzZh3snZpGtfga4';
  const printToConsole = data => console.log(data);
  
  function formatDate (dateTime) {
    return new Date(dateTime).toLocaleString('en-US', {
      timeZone: 'UTC',
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  }
  
  function filterCalendarEvents (items) {
    const calendarEvents = items.filter(item => (
      item.summary && item.summary.indexOf('Hack Night') < 0 && item.end.dateTime >= new Date().toISOString()
    ));
    return calendarEvents;
  }
  
  function mapCalendarEvents(events) {
    const mappedEvents = events.map(item => {
      item.start.dateTime = formatDate(item.start.dateTime);
      item.end.dateTime = formatDate(item.end.dateTime);
      return item;
    });
    return mappedEvents;
  }

  function insertDetails (item, index) {
    const container = document.querySelector('.cal');
    const calItem = document.createElement('div');
    calItem.classList.add('cal-item');
    calItem.innerHTML = `<div class="type-h4 cal-item--title">${item.summary}</div>
      <div class="cal-item--details">${item.start.dateTime} - ${item.end.dateTime}</div>
      <div class="cal-item--details">${item.location}</div>
      <div class="cal-item--details cal-item--description" style="display: none;">${item.description}</div>`;
    container.append(calItem);
    if(item.description) {
      const btn = document.createElement('button');
      btn.innerText = 'More info';
      btn.addEventListener('click', (event) => {
        const node = document.querySelectorAll('.cal-item--description')[index];
        node.style.display = node.style.display === 'none' ? 'block' : 'none'; 
      });
      calItem.append(btn);
    }
  }

  function fetchCalendar(url = '') {
    return fetch(url, {
      method: "GET",
      headers: {
        authorization: CALENDAR_API,
      },
      params: {
        maxItems: 100,
        orderBy: 'startTime',
        singleEvents: true,
        timeMin: new Date(new Date().setHours(0, 0, 0, 0)).toISOString(),
        key: CALENDAR_API
        }
    })
    .then(response => response.json())
    .then(function (response) {
      const calendarEvents = filterCalendarEvents(response.items);
      const mappedEvents = mapCalendarEvents(calendarEvents);
      mappedEvents.forEach(insertDetails);
      return mappedEvents;
    })
    .catch(function (response) {
      printToConsole(response.json)
    });
  }

  fetchCalendar(`https://www.googleapis.com/calendar/v3/calendars/${encodeURI(CALENDAR_ID)}/events`)
  .then(events => printToConsole(events))
  .catch(err => printToConsole(err))

  /************** test to see if we are correctly scrubbing data **********/
  const calendarEvents = filterCalendarEvents(data.items);
  const mappedEvents = mapCalendarEvents(calendarEvents);
  printToConsole(mappedEvents);
  mappedEvents.forEach(insertDetails);
  /************************************************************************/
})();