import sendgrid from '@sendgrid/mail'
sendgrid.setApiKey(process.env.SENDGRID_API_KEY)

export default async function handler(req, res) {
  const { booking, retreat, details } = req.body
  console.log(booking, retreat, details)
  console.log('SEND EMAILS HERE')
  // booking.pickup == false ? -> add info
  await sendgrid.send({
    to: details.email,
    from: 'azahara-bookings@almubeen.app', // your website email address here
    subject: `Booking Confirmation`,
    html: `
    <h2>Ahlan Ahlan!</h2>
    <p>Your booking has been confirmed.</p>
    <p>See you soon inshaAllah!</p>
    `,
  })
  await sendgrid.send({
    to: 'cortijoazahara1@gmail.com',
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
  res.send({ ok: true })
}
