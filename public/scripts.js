function fetchCompetitors() {
  fetch('/api/competitors')
    .then((response) => response.json())
    .then((competitors) => {
      const select = document.getElementById('competitor-select');
      select.innerHTML = '';
      competitors.forEach((competitor) => {
        const option = document.createElement('option');
        option.value = competitor.id;
        option.textContent = competitor.name;
        select.appendChild(option);
      });
    })
    .catch((err) => console.error('Error fetching competitors:', err));
}

function fetchAndDisplayEvents() {
  const eventsTableBody = document.getElementById('events-table').querySelector('tbody');

  fetch('/api/events')
    .then((response) => response.json())
    .then((events) => {
      eventsTableBody.innerHTML = ''; // Clear the table before populating

      events.forEach((event) => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${event.name}</td>
            <td>${event.point_value}</td>
          `;
        eventsTableBody.appendChild(row);
      });
    })
    .catch((err) => console.error('Error fetching events:', err));
}

async function fetchEventPoints(eventId) {
  try {
    const response = await fetch(`/api/events/${eventId}`);

    if (!response.ok) {
      console.error('Error fetching event data, response status:', response.status);
      return null;
    }

    const eventData = await response.json();
    console.log('Event data fetched:', eventData); // Log the fetched data

    return eventData.point_value;
  } catch (err) {
    console.error('Error fetching event data:', err);
    return null;
  }
}

function fetchEvents() {
  fetch('/api/events')
    .then((response) => response.json())
    .then((events) => {
      const select = document.getElementById('event-select');
      select.innerHTML = '';
      events.forEach((event) => {
        const option = document.createElement('option');
        option.value = event.id;
        option.textContent = event.name;
        select.appendChild(option);
      });
    })
    .catch((err) => console.error('Error fetching events:', err));
}

async function submitEventFormHandlerV2(event) {
  event.preventDefault();

  const competitorId = document.getElementById('competitor-select').value;
  const eventId = document.getElementById('event-select').value;
  const pointsAwarded = await fetchEventPoints(eventId);

  if (pointsAwarded === null) {
    console.error('Error fetching event points');
    return;
  }

  console.log('Submitting event form:', { competitorId, eventId, pointsAwarded });

  const response = await fetch('/api/points', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      competitorId,
      eventId,
      points_awarded: pointsAwarded,
    }),
  });

  if (!response.ok) {
    console.error('Error submitting completed event, response status:', response.status);
    return;
  }

  console.log('Response after event submission:', response);

  try {
    await fetchLeaderboard();
  } catch (err) {
    console.error('Error in fetching leaderboard after submitting event:', err);
  }
  //refresh page
  location.reload();
}

document.getElementById('submit-event-form').addEventListener('submit', submitEventFormHandlerV2);

document.addEventListener('DOMContentLoaded', () => {
  const competitorForm = document.getElementById('competitorName');
  const competitorNameInput = document.getElementById('competitor-name');
  const addEventForm = document.getElementById('add-event-form');
  const eventNameInput = document.getElementById('event-name');
  const eventPointsInput = document.getElementById('event-points');
  const leaderboardTableBody = document.getElementById('leaderboard').querySelector('tbody');

  competitorForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const name = competitorNameInput.value;

    try {
      await fetch('/api/competitors', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ name })
      });
      competitorNameInput.value = '';
      alert('Competitor added!');
      fetchLeaderboard();
    } catch (err) {
      console.error('Error adding competitor:', err);
      alert('Error adding competitor');
    }
  });

  addEventForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const name = eventNameInput.value;
    const points = eventPointsInput.value;

    try {
      await fetch('/api/events', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ name, points_awarded: points })
      });
      eventNameInput.value = '';
      eventPointsInput.value = '';
      location.reload();
    } catch (err) {
      console.error('Error adding event:', err);
      alert('Error adding event');
    }
    
  });

  async function fetchLeaderboard() {
    try {
      const response = await fetch('/api/leaderboard');
      const leaderboardData = await response.json();
      leaderboardTableBody.innerHTML = '';

      leaderboardData.forEach((entry, index) => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${index + 1}</td>
            <td>${entry.name}</td>
            <td>${entry.total_points || 0}</td>
          `;
        leaderboardTableBody.appendChild(row);
      });
    } catch (err) {
      console.error('Error fetching leaderboard data:', err);
      alert('Error fetching leaderboard data');
    }
  }
  fetchCompetitors();
  fetchEvents();
  fetchAndDisplayEvents();
  fetchLeaderboard();
});

