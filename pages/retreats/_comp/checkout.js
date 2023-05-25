import { Button, Image, Form, Input } from 'antd'
import { LeftOutlined } from '@ant-design/icons'
import dayjs from 'dayjs'

const CheckoutView = ({
  setStep,
  data,
  booking,
  retreat,
  RetreatHeader,
  calcPrice,
}) => {
  const [form] = Form.useForm()
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
          <h5>Retreat Booking</h5>
        </div>
        <RetreatHeader data={data} />
        <hr />
        <h4>Booking Details</h4>
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
                      <Image src="/meal.svg" alt="bed" width={18} height={18} />{' '}
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
                  <small>The remainder 50% is payable in cash on arrival</small>
                </li>
              </>
            )}
          </ul>
        </div>
        <div className="payment">
          <div className="flex mt-2 mb-4">
            <h4>Payment details</h4>
            {/* <Button type="link" size="small" className="ml-auto">Cancellation policy</Button> */}
          </div>
          <Form
            // {...formItemLayout}
            layout="vertical"
            form={form}
            onValuesChange={() => {}}
          >
            <Form.Item name="email">
              <Input size="large" placeholder="Email" />
            </Form.Item>
            <Form.Item name="name">
              <Input size="large" placeholder="Cardholder Name" />
            </Form.Item>
            <Form.Item name="card">
              <Input size="large" placeholder="Card Number" />
            </Form.Item>
            <div className="grid grid-flow-col auto-rows-max gap-x-1.5">
              <Form.Item name="expDate">
                <Input size="large" placeholder="Expiration Date" />
              </Form.Item>
              <Form.Item name="card">
                <Input size="large" placeholder="CVV" />
              </Form.Item>
            </div>
          </Form>
          <div className="stripe">Secure checkout with Stripe</div>
          <Button type="primary" size="large">
            Make Booking
          </Button>
        </div>
      </div>
    </div>
  )
}

export default CheckoutView
