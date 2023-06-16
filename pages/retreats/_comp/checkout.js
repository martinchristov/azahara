import { Button, Image, Form, Input } from 'antd'
import { LeftOutlined } from '@ant-design/icons'
import dayjs from 'dayjs'
import { loadStripe } from '@stripe/stripe-js'
import { Elements } from '@stripe/react-stripe-js'
import {
  PaymentElement,
  LinkAuthenticationElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js'
import { useEffect, useState } from 'react'
import RetreatHeader from './header'

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY)

const CheckoutView = ({
  setStep,
  data,
  booking,
  retreat,
  calcPrice,
  step,
  free,
}) => {
  const [form] = Form.useForm()
  const [clientSecret, setClientSecret] = useState()
  useEffect(() => {
    if (step === 3) {
      fetch('/api/create-payment-intent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items: [{ id: 'xl-tshirt' }] }),
      })
        .then((res) => res.json())
        .then((data) => setClientSecret(data.clientSecret))
    }
  }, [step])
  const appearance = {
    theme: 'stripe',
  }
  const options = {
    clientSecret,
    appearance,
  }
  return (
    <div className="checkout-view view">
      <div className="inner rounded-lg flex flex-col">
        <div className="flex relative mt-3 nav-heading">
          <Button
            onClick={() => setStep(2)}
            type="link"
            size="large"
            className="back-btn"
          >
            <LeftOutlined />
          </Button>
          <h5>Checkout</h5>
        </div>
        <RetreatHeader free={free} data={data} />
        <hr />
        <h4>Booking Details</h4>
        {booking && (
          <div className="details">
            <ul>
              <li>
                <span>Dates</span>
                <strong>
                  {dayjs(booking.checkIn).format('DD MMM')} -{' '}
                  {dayjs(booking.checkOut).format('DD MMM')}
                </strong>
              </li>
              <li>
                <span>Guests</span>
                <strong>
                  {booking.adults} {booking.adults === 1 ? 'adult' : 'adults'},{' '}
                  {booking.children === 0
                    ? 'no children'
                    : `${booking.children} children`}
                </strong>
              </li>
              {booking.room && (
                <>
                  <li>
                    <span>Accommodation</span>
                    <strong>
                      {dayjs(booking.checkOut).diff(booking.checkIn, 'days')}
                      {' days in '}
                      {booking.room.title}
                    </strong>
                  </li>
                  <li>
                    <span>Extras</span>
                    <ul className="feats">
                      <li>
                        <Image
                          src="/meal.svg"
                          alt="bed"
                          width={18}
                          height={18}
                        />{' '}
                        Meals Included
                      </li>
                    </ul>
                  </li>
                  <li className="total">
                    <span>Total amount due</span>
                    <strong>{calcPrice(booking.room, booking, retreat)}</strong>
                  </li>
                  <li className="total deposit">
                    <span>50% Deposit Due Now</span>
                    <strong>
                      {calcPrice(booking.room, booking, retreat, true)}
                    </strong>
                  </li>
                  <li>
                    <small>
                      The remainder 50% is payable in cash on arrival
                    </small>
                  </li>
                </>
              )}
            </ul>
          </div>
        )}
        <div className="payment">
          <div className="flex mt-2 mb-4">
            <h4>Payment details</h4>
            {/* <Button type="link" size="small" className="ml-auto">Cancellation policy</Button> */}
          </div>
          {clientSecret && (
            <Elements options={options} stripe={stripePromise}>
              <CheckoutForm />
            </Elements>
          )}
        </div>
      </div>
    </div>
  )
}

const CheckoutForm = () => {
  const stripe = useStripe()
  const elements = useElements()
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  useEffect(() => {
    if (!stripe) {
      return
    }

    const clientSecret = new URLSearchParams(window.location.search).get(
      'payment_intent_client_secret'
    )

    if (!clientSecret) {
      return
    }

    stripe.retrievePaymentIntent(clientSecret).then(({ paymentIntent }) => {
      switch (paymentIntent.status) {
        case 'succeeded':
          setMessage('Payment succeeded!')
          break
        case 'processing':
          setMessage('Your payment is processing.')
          break
        case 'requires_payment_method':
          setMessage('Your payment was not successful, please try again.')
          break
        default:
          setMessage('Something went wrong.')
          break
      }
    })
  }, [stripe])

  const paymentElementOptions = {
    layout: 'tabs',
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!stripe || !elements) {
      // Stripe.js hasn't yet loaded.
      // Make sure to disable form submission until Stripe.js has loaded.
      return
    }

    setIsLoading(true)

    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        // Make sure to change this to your payment completion page
        return_url: 'http://localhost:3000',
      },
    })

    // This point will only be reached if there is an immediate error when
    // confirming the payment. Otherwise, your customer will be redirected to
    // your `return_url`. For some payment methods like iDEAL, your customer will
    // be redirected to an intermediate site first to authorize the payment, then
    // redirected to the `return_url`.
    if (error.type === 'card_error' || error.type === 'validation_error') {
      setMessage(error.message)
    } else {
      setMessage('An unexpected error occurred.')
    }

    setIsLoading(false)
  }

  return (
    <form id="payment-form" onSubmit={handleSubmit}>
      <label for="name-input">Name</label>
      {/* <input name="name" id="name-input" /> */}
      {/* <LinkAuthenticationElement
        id="link-authentication-element"
        onChange={(e) => {
          console.log(e)
          setEmail(e.value.email)
        }}
      /> */}
      <PaymentElement id="payment-element" options={paymentElementOptions} />
      {/* <button id="submit"></button> */}
      <Button
        disabled={isLoading || !stripe || !elements}
        type="primary"
        id="submit"
        size="large"
        style={{ marginTop: 20 }}
      >
        <span id="button-text">
          {isLoading ? <div className="spinner" id="spinner"></div> : 'Pay now'}
        </span>
      </Button>
      {/* Show any error or success messages */}
      {message && <div id="payment-message">{message}</div>}
    </form>
  )
}

export default CheckoutView
