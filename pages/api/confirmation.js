import dayjs from 'dayjs'
import sendgrid from '@sendgrid/mail'
sendgrid.setApiKey(process.env.SENDGRID_API_KEY)

const { google } = require('googleapis')

const jwtClient = new google.auth.JWT(
  process.env.GOOGLE_CLIENT_EMAIL,
  null,
  process.env.GOOGLE_PRIVATE_KEY.split(String.raw`\n`).join('\n'),
  [
    'https://www.googleapis.com/auth/calendar',
    'https://www.googleapis.com/auth/calendar.events',
  ]
)
const calendar = google.calendar({
  version: 'v3',
  project: process.env.GOOGLE_PROJECT_NUMBER,
  auth: jwtClient,
})

export default async function handler(req, res) {
  const { booking, retreat, details } = req.body
  // booking.pickup == false ? -> add info
  await sendgrid.send({
    to: details.email,
    from: 'azahara-bookings@almubeen.app', // your website email address here
    subject: `Booking Confirmation`,
    html: `
    <h2>Ahlan Ahlan!</h2>
    <p>Your booking has been confirmed.</p>
    <p>
    Check In: ${booking.checkIn}<br />
    Check Out: ${booking.checkOut}<br />
    Room: ${booking.room.title}<br />
    Guests: ${booking.adults} adults ${booking.children > 0 && `${booking.children} children`}<br />
    <p>See you soon inshaAllah!</p>
    `,
  })
  await sendgrid.send({
    to: 'azahara.bookings@gmail.com',
    from: 'azahara-bookings@almubeen.app', // your website email address here
    subject: `New Booking (system test)`,
    html: `
    <h2>Booking information</h2>
    <p>
    Retreat: ${retreat.Title}<br />
    Check In: ${booking.checkIn}<br />
    Check Out: ${booking.checkOut}<br />
    Room: ${booking.room.title}<br />
    Adults: ${booking.adults}<br />
    Children: ${booking.children}<br />
    Name: ${details.name}<br />
    Email: ${details.email}
    </p>
    `,
  })
  // CREATE EVENT IN CALENDAR
  let eventCount = 1
  if (booking.room.shared) {
    eventCount = booking.adults + booking.children
  }
  for (let i = 0; i < eventCount; i += 1) {
    let summary = `${details.name}`
    if (i > 0) {
      summary = `${summary} person ${i + 1}`
    }
    await calendar.events.insert({
      calendarId: booking.room.calendarID,
      sendNotifications: false,
      requestBody: {
        start: {
          dateTime: dayjs(`${booking.checkIn} 12:00`).toISOString(),
          timeZone: 'Europe/Madrid',
        },
        end: {
          dateTime: dayjs(`${booking.checkOut} 12:00`).toISOString(),
          timeZone: 'Europe/Madrid',
        },
        summary,
        description: `${details.name} (${details.email}) ${
          retreat ? `for ${retreat.Title}` : 'free booking'
        }`,
      },
    })
  }
  res.send({ ok: true })
}
