import Layout from "@/components/layout";
import { selectRetreatsState } from "@/utils/retreatsSlice";
import dayjs from "dayjs";
import Image from "next/image";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import Markdown from 'react-markdown'
import { Button, DatePicker, Form, Input, Radio } from "antd";
import { LeftOutlined, MinusSquareOutlined, PlusSquareOutlined } from "@ant-design/icons";
import { motion } from "framer-motion";
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination } from "swiper"

import "swiper/css";
import "swiper/css/pagination";

const { RangePicker } = DatePicker;

export default function RetreatView(props) {
  const [data, setData] = useState(null)
  const router = useRouter()
  const retreatsState = useSelector(selectRetreatsState);
  useEffect(() => {
    if((retreatsState != null && retreatsState.length > 0)){
      setData(retreatsState.find(item => item.attributes.Slug === router.query.slug))
    } else {
      // initial fetch all has not been made (view is accessed directly)
      fetch(`https://azahara-admin.herokuapp.com/api/retreats?filters\[Slug\][$eq]=${router.query.slug}&populate=*`)
      .then(d => d.json())
      .then(d => {
        setData(d.data[0])
      })
    }
  }, [])
  return (
    <Layout>
      <div className="container mx-auto">
        {data && <FullView {...{ data }} />}
      </div>
    </Layout>
  )
}

const RetreatHeader = ({ data: { Cover, Starts, Ends, Title, Subtitle }}) => {
  return (
    <div className="flex retreat-header">
      <div className="thumb col">
        {Cover?.data != null &&
        <Image src={Cover.data.attributes.formats.small.url} fill alt="cover" />
        }
      </div>
      <div className="col justify-center flex flex-col">
        <div className='flex'>
          <div className="date rounded-sm">{dayjs(Starts, 'YYYY-MM-DD').format('MMM DD')} - {dayjs(Ends, 'YYYY-MM-DD').format('MMM DD')}</div>
        </div>
        <h1>{Title}</h1>
        <h5>{Subtitle}</h5>
      </div>
    </div>
  )
}

const FullView = ({ data }) => {
  const [booking, setBooking] = useState({ checkIn: data?.attributes?.Starts, checkOut: data?.attributes?.Ends, adults: 1, children: 0, room: null })
  const [step, setStep] = useState(1)
  if(!data){
    return <div>Loading...</div>
  }
  const handleUpdateBooking = (field) => (value) => {
    const $booking = {...booking}
    $booking[field] = field.indexOf('check') === 0 ? value.format('YYYY-MM-DD') : value
    setBooking($booking)
  }
  const now = dayjs()
  console.log(data.attributes)
  return (

    <motion.div
      className="relative"
      animate={{
        x: -(step - 1) * window.innerWidth
      }}
      transition={{
        type: "spring",
        stiffness: 270,
        damping: 30,
      }}
    >
    <div className="retreat full px-4 sm:px-6 sm:pt-8 rounded-lg m-6 flex flex-col">
      <RetreatHeader data={data.attributes} />
      <div className="mt-6 full-details">
        <div className="desc"><Markdown>{data.attributes.Description}</Markdown></div>
        <hr />
        <h3>Booking Details</h3>
        <div className="flex grid grid-flow-col auto-rows-max gap-x-1.5">
          <div className="flex flex-col">
            <div className="label">Check in</div>
            <DatePicker value={dayjs(booking.checkIn, 'YYYY-MM-DD')} disabledDate={(date) => date.valueOf() < now.valueOf() || date.valueOf() > dayjs(booking.checkOut, 'YYYY-MM-DD')} format="DD MMM" onChange={handleUpdateBooking('checkIn')} />
          </div>
          <div className="flex flex-col">
            <div className="label">Check out</div>
            <DatePicker value={dayjs(booking.checkOut, 'YYYY-MM-DD')} disabledDate={(date) => date.valueOf() < dayjs(booking.checkIn, 'YYYY-MM-DD')} format="DD MMM" onChange={handleUpdateBooking('checkOut')} />
          </div>
        </div>
        <div className="flex grid grid-flow-col auto-rows-max gap-x-1.5 mt-3">
          <div className="flex flex-col">
            <div className="label">Adults</div>
            <Amount value={booking.adults} min={1} onChange={handleUpdateBooking('adults')} />
          </div>
          <div className="flex flex-col">
            <div className="label">Children (5+)</div>
            <Amount value={booking.children} min={0} onChange={handleUpdateBooking('children')} />
          </div>
        </div>
        <ul className="feats">
          <li><Image src="/bed.svg" alt="bed" width={18} height={18} /> {dayjs(booking.checkOut).diff(booking.checkIn, 'day', false)} Nights</li>
          <li><Image src="/meal.svg" alt="bed" width={18} height={18} /> Meals Included</li>
        </ul>
        <hr />
        <div className="transportation">
          <h4>Transportation to venue</h4>
          <Radio.Group value={booking.pickup} onChange={(e, v) => { handleUpdateBooking('pickup')(e.target.value) }}>
            <Radio.Button value={true}>Airport pickup</Radio.Button>
            <Radio.Button value={false}>Bus, taxi or other</Radio.Button>
          </Radio.Group>
          {booking.pickup &&
          <p>
            <small>We offer an airport pickup service charged separately. The cost starts from $100 from Malaga and $70 from Granada and depends on number of passengers.</small>
          </p>
          }
          {(booking.pickup === false) &&
          <p>
            <small>Information on how to get the bus will be shared on your email after booking.</small>
          </p>
          }
        </div>
      </div>
      <Button className="next-btn" type="primary" size="large" onClick={() => setStep(2)}>Choose Accommodation</Button>
    </div>
    <RoomsView {...{ setStep }} />
    <CheckoutView {...{ setStep, data: data.attributes, booking }} />
    </motion.div>
  )
}

const RoomsView = ({ setStep }) => {
  return (
    <div className="rooms-view">
      <div className="px-4 sm:px-6 sm:pt-8 rounded-lg m-6 flex flex-col">
        <div className="flex relative mt-3">
          <Button onClick={() => setStep(1)} type="link" size="large" className="back-btn"><LeftOutlined /></Button>
        </div>
        <h4>Choose Accommodation</h4>
        <ul className="results">
          <li onClick={() => { setStep(3) }}>
            <div className="gallery">
              <Swiper pagination={true} modules={[Pagination]} className="mySwiper">
                <SwiperSlide><Image src="https://res.cloudinary.com/dnqihasfp/image/upload/v1682332677/small_casa_aisha_f99ca5f2db.jpg" alt="g1" fill /></SwiperSlide>
                <SwiperSlide><Image src="https://res.cloudinary.com/dnqihasfp/image/upload/v1682332677/small_casa_aisha_f99ca5f2db.jpg" alt="g1" fill /></SwiperSlide>
              </Swiper>
            </div>
            <div className="flex grid grid-cols-12 p-2">
              <div className="col-span-8 flex flex-col">
                <h3>Casa Aisha</h3>
                <ul className="feats">
                  <li>Sleeps 4</li>
                  <li>3 Beds</li>
                </ul>
              </div>
              <div className="col-span-4 flex flex-col prices">
                <strong>$300</strong>
                <small>$130 per night</small>
              </div>
            </div>
          </li>
        </ul>
      </div>
    </div>
  )
}

const CheckoutView = ({ setStep, data, booking }) => {
  const [form] = Form.useForm();
  return (
    <div className="checkout-view">
      <div className="px-4 sm:px-6 sm:pt-8 rounded-lg m-6 flex flex-col">
        <div className="flex relative mt-3">
          <Button onClick={() => setStep(2)} type="link" size="large" className="back-btn"><LeftOutlined /></Button>
        </div>
        {/* <h4>Complete Your Booking</h4> */}
        <RetreatHeader data={data} />
        <hr />
        <div className="details">
          <h4>Booking details</h4>
          <ul>
            <li>
              <span>Dates</span>
              <strong>{dayjs(booking.checkIn).format('DD MMM')} - {dayjs(booking.checkOut).format('DD MMM')}</strong>
            </li>
            <li>
              <span>Guests</span>
              <strong>{booking.adults} {booking.adults === 1 ? 'adult' : 'adults'}, {booking.children === 0 ? 'no children' : `${booking.children} children`}</strong>
            </li>
            <li>
              <span>Accommodation</span>
              <strong>(TODO) Casa Aisha</strong>
            </li>
            <li>
              <span>Extras</span>
              <ul className="feats">
                <li><Image src="/meal.svg" alt="bed" width={18} height={18} /> Meals Included</li>
              </ul>
            </li>
            <li className="total">
              <span>Total amount due</span>
              <strong>$500</strong>
            </li>
          </ul>
        </div>
        <div className="payment">
          <h4>Payment details</h4>
          <Form
            // {...formItemLayout}
            layout="vertical"
            form={form}
            onValuesChange={() => { }}
          >
            <Form.Item name="email"><Input placeholder="Email" /></Form.Item>
            <Form.Item name="name"><Input placeholder="Cardholder Name" /></Form.Item>
            <Form.Item name="card"><Input placeholder="Card Number" /></Form.Item>
            <div className="grid grid-flow-col auto-rows-max gap-x-1.5">
              <Form.Item name="expDate"><Input placeholder="Expiration Date" /></Form.Item>
              <Form.Item name="card"><Input placeholder="CVV" /></Form.Item>
            </div>
          </Form>
          <div className="stripe">Secure checkout with Stripe</div>
          <Button type="primary" size="large">Make Booking</Button>
        </div>
      </div>
    </div>
  )
}

const Amount = ({ value = 1, min = 0, onChange }) => {
  return (
    <div className="flex amount">
      <Button onClick={() => { onChange(value + 1) }} type="ghost" size="large" icon={<PlusSquareOutlined />}></Button>
      <div className="value">{value}</div>
      <Button onClick={() => { if(value > min) onChange(value - 1) }} type="ghost" size="large" disabled={value <= min} icon={<MinusSquareOutlined />}></Button>
    </div>
  )
}