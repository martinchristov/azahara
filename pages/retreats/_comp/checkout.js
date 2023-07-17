import { Button, Image, Form, Input } from 'antd'
import { LeftOutlined } from '@ant-design/icons'
import dayjs from 'dayjs'
import { loadStripe } from '@stripe/stripe-js'
import { Elements } from '@stripe/react-stripe-js'
import {
  PaymentElement,
  CardElement,
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
        body: JSON.stringify({
          booking,
          amount: calcPrice(booking.room, booking, retreat, true, false) * 100,
        }),
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
              <CheckoutForm
                {...{ booking, retreat, form, clientSecret, setStep }}
              />
            </Elements>
          )}
        </div>
      </div>
    </div>
  )
}

const CheckoutForm = ({ booking, retreat, form, clientSecret, setStep }) => {
  const stripe = useStripe()
  const elements = useElements()
  const [details, setDetails] = useState({ name: '', email: '' })
  const [message, setMessage] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  // const [clientSecret, setClientSecret] = useState()
  const [disabled, setDisabled] = useState(true)
  const [succeeded, setSucceeded] = useState(false)
  const [error, setError] = useState(null)
  const [processing, setProcessing] = useState('')

  const handleChange = async (event) => {
    // Listen for changes in the CardElement
    // and display any errors as the customer types their card details
    setDisabled(event.empty)
    setError(event.error ? event.error.message : '')
  }

  const handleSubmit = async (ev) => {
    ev.preventDefault()
    setProcessing(true)

    const payload = await stripe.confirmCardPayment(clientSecret, {
      payment_method: {
        card: elements.getElement(CardElement),
        billing_details: {
          name: details.name,
        },
        // receipt_email: details.email,
      },
    })

    if (payload.error) {
      setError(`Payment failed - ${payload.error.message}`)
      setProcessing(false)
    } else {
      setError(null)
      setProcessing(false)
      setSucceeded(true)
      const payload = { booking, retreat, details, clientSecret }
      delete retreat.Description
      fetch('/api/confirmation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
        .then((res) => res.json())
        .then(() => {
          setStep(4)
        })
      // .then((data) => setClientSecret(data.clientSecret))
    }
  }

  return (
    <Form
      form={form}
      layout="vertical"
      id="payment-form"
      onSubmit={handleSubmit}
    >
      <label for="name-input">Name</label>
      <Input
        type="text"
        id="name-input"
        size="large"
        value={details.name}
        onChange={(ev) => setDetails({ ...details, name: ev.target.value })}
      />
      <div className="m-3" />
      <label for="email-input">Email</label>
      <Input
        type="email"
        id="email-input"
        size="large"
        value={details.email}
        onChange={(ev) => setDetails({ ...details, email: ev.target.value })}
      />
      <div className="m-3" />
      <label for="card-input">Payment</label>
      <CardElement
        id="card-element"
        options={{
          hidePostalCode: true,
          style: { base: { backgroundColor: '#fff', padding: 10 } },
        }}
        onChange={handleChange}
      />
      {error && (
        <div className="card-error mt-3" role="alert">
          {error}
        </div>
      )}
      <Button
        disabled={
          isLoading ||
          !stripe ||
          !elements ||
          disabled ||
          details.name.length < 2 ||
          !validateEmail(details.email)
        }
        type="primary"
        id="submit"
        size="large"
        style={{ marginTop: 20 }}
        onClick={handleSubmit}
        loading={processing}
      >
        <span id="button-text">
          {isLoading ? <div className="spinner" id="spinner"></div> : 'Pay now'}
        </span>
      </Button>
      {/* Show any error or success messages */}
      {message && <div id="payment-message">{message}</div>}
    </Form>
  )
}

const validateEmail = (email) => {
  return String(email)
    .toLowerCase()
    .match(
      /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|.(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
    )
}

export default CheckoutView
