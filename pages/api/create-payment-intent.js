// This is your test secret API key.
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY)

export default async function handler(req, res) {
  const { booking, amount } = req.body
  // Create a PaymentIntent with the order amount and currency
  const paymentIntent = await stripe.paymentIntents.create({
    amount,
    currency: 'eur',
    metadata: {
      checkIn: booking.checkIn,
      checkOut: booking.checkOut,
      room: booking.room.title,
    },
  })

  res.send({
    clientSecret: paymentIntent.client_secret,
  })
}
