import dayjs from "dayjs";
const { google } = require("googleapis");

const jwtClient = new google.auth.JWT(
  process.env.GOOGLE_CLIENT_EMAIL,
  null,
  process.env.GOOGLE_PRIVATE_KEY.split(String.raw`\n`).join("\n"),
  process.env.SCOPES
);
const calendar = google.calendar({
  version: "v3",
  project: process.env.GOOGLE_PROJECT_NUMBER,
  auth: jwtClient,
});

export default async function handler(req, res) {
  const params = new URLSearchParams({
    populate: "*",
    "filters[Active][$eq]": true,
  });
  const booking = {
    ...req.query,
    checkIn: dayjs(req.query.checkIn),
    checkOut: dayjs(req.query.checkOut),
  };

  await fetch(`https://azahara-admin.herokuapp.com/api/rooms?${params}`)
    .then((d) => d.json())
    .then(async (d) => {
      const ret = [];
      for (const room of d.data) {
        const av = await hasAvailability(room.attributes, booking);
        ret.push(av);
      }
      res.status(200).json(ret);
    });
}

async function hasAvailability(room, booking) {
  const ret = {
    ...room,
  };

  const {
    data: { items },
  } = await calendar.events.list({
    calendarId: room.Calendar_ID,
    timeMin: booking.checkIn.toISOString(),
    timeMax: booking.checkOut.toISOString(),
    maxResults: 10,
    singleEvents: true,
    orderBy: "startTime",
  });
  ret.calendar = items.map(({ start, end }) => ({ start, end }));

  const totalBeds = booking.adults * 1 + booking.children * 1;
  const maxBeds = room.Max_Beds ? room.Max_Beds : room.Beds;

  if (room.Shared) {
    ret.available = maxBeds - ret.calendar.length >= totalBeds;
    ret.availableBeds = maxBeds - ret.calendar.length;
  } else {
    // PRIVATE
    ret.available = ret.calendar.length === 0;
    if (ret.available) {
      ret.available = totalBeds <= maxBeds;
    }
  }
  return ret;
}
