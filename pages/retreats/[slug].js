import Layout from "@/components/layout";
import { selectRetreatsState } from "@/utils/retreatsSlice";
import dayjs from "dayjs";
import Image from "next/image";
import { useRouter } from "next/router";
import { useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
import Markdown from 'react-markdown'
import { Button, DatePicker, Form, Input, Radio } from "antd";
import { LeftOutlined, MinusSquareOutlined, PlusSquareOutlined } from "@ant-design/icons";
import { motion } from "framer-motion";
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination } from "swiper"
import AzaharaH from '../../assets/azahara-h.svg'

import "swiper/css";
import "swiper/css/pagination";
import Link from "next/link";
import classNames from "classnames";

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
    <div className="container mx-auto">
      {data && <FullView {...{ data }} />}
    </div>
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
    $booking[field] = field.indexOf('check') === 0 ? value?.format('YYYY-MM-DD') : value
    setBooking($booking)
  }
  const now = dayjs()
  return (
    <>
      <div className="absolute">
        <AzaharaH />
      </div>
      <div className="relative view-slider">
        <motion.div
          className="silsila"
          animate={{
            x: -(step - 1) * window.innerWidth
          }}
          transition={{
            type: "spring",
            stiffness: 270,
            damping: 30,
          }}
        >
        <div className="retreat view full">
          <div className="inner rounded-lg flex flex-col">
            <div className="flex relative mt-3 nav-heading">
              <Link href="/">
                <Button onClick={() => setStep(1)} type="link" size="large" className="back-btn"><LeftOutlined /></Button>
              </Link>
              <h5>Retreat booking</h5>
            </div>
            <RetreatHeader data={data.attributes} />
            <div className="mt-6 full-details">
              <div className="desc"><Markdown>{data.attributes.Description}</Markdown></div>
              <hr />
              <h3>Booking Details</h3>
              <div className="flex grid grid-flow-col auto-rows-max gap-x-1.5">
                <div className="flex flex-col">
                  <div className="label">Check in</div>
                  <DatePicker size="large" inputReadOnly value={dayjs(booking.checkIn, 'YYYY-MM-DD')} disabledDate={(date) => date.valueOf() < now.valueOf() || date.valueOf() > dayjs(booking.checkOut, 'YYYY-MM-DD')} format="DD MMM" onChange={handleUpdateBooking('checkIn')} />
                </div>
                <div className="flex flex-col">
                  <div className="label">Check out</div>
                  <DatePicker size="large" inputReadOnly value={dayjs(booking.checkOut, 'YYYY-MM-DD')} disabledDate={(date) => date.valueOf() < dayjs(booking.checkIn, 'YYYY-MM-DD')} format="DD MMM" onChange={handleUpdateBooking('checkOut')} />
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
        </div>
        <RoomsView {...{ setStep }} />
        <CheckoutView {...{ setStep, data: data.attributes, booking }} />
        </motion.div>
      </div>
    </>
  )
}

const RoomsView = ({ setStep }) => {
  const scrollviewRef = useRef()
  const [selected, setSelected] = useState(-1)
  const mockResults = [
    {
      Title: 'Private Casa Aisha',
      Description: '2 double bedroom, 2 bathroom house that sleeps up to 4. Light filled living area with fireplace and French doors opening to the patio with views of the Mediterranean and beyond. Large kitchen/dining room that opens to a shaded porch as well as garden, with panoramic views of the mountains and the sea. Parking for 2 cars.',
      Gallery: ['https://res.cloudinary.com/dnqihasfp/image/upload/v1682332677/small_casa_aisha_f99ca5f2db.jpg', 'https://res.cloudinary.com/dnqihasfp/image/upload/v1682332756/small_studio_ibn_bassal_9639670757.jpg']
    },
    {
      Title: 'Private Casa Bin Yameen',
      Description: '2 double bedroom, 2 bathroom house that sleeps up to 4. Light filled living area with fireplace and French doors opening to the patio with views of the Mediterranean and beyond. Large kitchen/dining room that opens to a shaded porch as well as garden, with panoramic views of the mountains and the sea. Parking for 2 cars.',
      Gallery: ['https://res.cloudinary.com/dnqihasfp/image/upload/v1682332756/small_studio_ibn_bassal_9639670757.jpg', 'https://res.cloudinary.com/dnqihasfp/image/upload/v1682332677/small_casa_aisha_f99ca5f2db.jpg']
    },
    {
      Title: 'Private Casa Bin Yameen',
      Description: '2 double bedroom, 2 bathroom house that sleeps up to 4. Light filled living area with fireplace and French doors opening to the patio with views of the Mediterranean and beyond. Large kitchen/dining room that opens to a shaded porch as well as garden, with panoramic views of the mountains and the sea. Parking for 2 cars.',
      Gallery: ['https://res.cloudinary.com/dnqihasfp/image/upload/v1682332756/small_studio_ibn_bassal_9639670757.jpg', 'https://res.cloudinary.com/dnqihasfp/image/upload/v1682332677/small_casa_aisha_f99ca5f2db.jpg']
    },
    {
      Title: 'Private Casa Bin Yameen',
      Description: '2 double bedroom, 2 bathroom house that sleeps up to 4. Light filled living area with fireplace and French doors opening to the patio with views of the Mediterranean and beyond. Large kitchen/dining room that opens to a shaded porch as well as garden, with panoramic views of the mountains and the sea. Parking for 2 cars.',
      Gallery: ['https://res.cloudinary.com/dnqihasfp/image/upload/v1682332756/small_studio_ibn_bassal_9639670757.jpg', 'https://res.cloudinary.com/dnqihasfp/image/upload/v1682332677/small_casa_aisha_f99ca5f2db.jpg']
    }
  ]
  const handleClick = (index) => () => {
    if(selected === -1){
       setSelected(index)
    }
  }
  console.log(scrollviewRef.current)
  return (
    <div className="rooms-view view" ref={scrollviewRef}>
      <div className="inner rounded-lg flex flex-col">
        <div className="flex relative mt-3 nav-heading">
          <Button onClick={() => setStep(1)} type="link" size="large" className="back-btn"><LeftOutlined /></Button>
          <h5>Choose Accommodation</h5>
        </div>
        {/* <h4>Choose Accommodation</h4> */}
        <ul className="results">
          {mockResults.map((result, index) => {
            return (
              <li key={result.Title} onClick={handleClick(index)}>
                <motion.div
                  className={classNames('expander', { expanded: selected === index })}
                  animate={selected === index ? {
                    x: -20,
                    y: -index * 208 - 160 + (scrollviewRef.current != null ? scrollviewRef.current.scrollTop : 0),
                    height: (window.innerHeight - 20),
                    width: window.innerWidth - 20,
                    zIndex: 10
                  } : {
                    x: 0,
                    y: 0,
                    width: window.innerWidth - 60,
                    height: 198,
                    transitionEnd: {
                      zIndex: 0
                    }
                  }}
                  transition={{
                    type: "spring",
                    stiffness: 220,
                    damping: 20,
                  }}
                >
                  <div className="gallery">
                    <Swiper pagination={true} modules={[Pagination]} className="mySwiper">
                      <SwiperSlide><Image src="https://res.cloudinary.com/dnqihasfp/image/upload/v1682332677/small_casa_aisha_f99ca5f2db.jpg" alt="g1" fill /></SwiperSlide>
                      <SwiperSlide><Image src="https://res.cloudinary.com/dnqihasfp/image/upload/v1682332756/small_studio_ibn_bassal_9639670757.jpg" alt="g1" fill /></SwiperSlide>
                    </Swiper>
                  </div>
                  <div className="flex grid grid-cols-12 p-3">
                    <div className="col-span-8 flex flex-col">
                      <h3>{result.Title}</h3>
                      <ul className="feats">
                        <li>Sleeps 4</li>
                        <li>3 Beds</li>
                      </ul>
                    </div>
                    <div className="col-span-4 flex flex-col prices text-right">
                      <strong>$300</strong>
                      <small>Final price</small>
                    </div>
                  </div>
                  <p className="p-3"><small>{result.Description}</small></p>
                  <div className="bottom flex mt-auto m-3">
                    <Button size="large" onClick={() => setSelected(-1)}>Cancel</Button>
                    <Button type="primary" onClick={() => setStep(3)} size="large" className="ml-2 flex-1">Confirm</Button>
                  </div>
                </motion.div>
              </li>
            )
          })}
        </ul>
      </div>
    </div>
  )
}


const CheckoutView = ({ setStep, data, booking }) => {
  const [form] = Form.useForm();
  return (
    <div className="checkout-view view">
      <div className="inner rounded-lg flex flex-col">
        {/* <div className="flex relative mt-3">
          <Button onClick={() => setStep(2)} type="link" size="large" className="back-btn"><LeftOutlined /></Button>
        </div> */}
        <div className="flex relative mt-3 nav-heading">
          <Button onClick={() => setStep(2)} type="link" size="large" className="back-btn"><LeftOutlined /></Button>
          <h5>Retreat Booking</h5>
        </div>
        <RetreatHeader data={data} />
        <hr />
        <h4>Booking Details</h4>
        <div className="details">
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
            <Form.Item name="email"><Input size="large" placeholder="Email" /></Form.Item>
            <Form.Item name="name"><Input size="large" placeholder="Cardholder Name" /></Form.Item>
            <Form.Item name="card"><Input size="large" placeholder="Card Number" /></Form.Item>
            <div className="grid grid-flow-col auto-rows-max gap-x-1.5">
              <Form.Item name="expDate"><Input size="large" placeholder="Expiration Date" /></Form.Item>
              <Form.Item name="card"><Input size="large" placeholder="CVV" /></Form.Item>
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
      <Button onClick={() => { if(value > min) onChange(value - 1) }} type="ghost" size="large" disabled={value <= min} icon={<MinusSquareOutlined />}></Button>
      <div className="value">{value}</div>
      <Button onClick={() => { onChange(value + 1) }} type="ghost" size="large" icon={<PlusSquareOutlined />}></Button>
    </div>
  )
}