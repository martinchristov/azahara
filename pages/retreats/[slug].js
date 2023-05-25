import { selectRetreatsState } from '@/utils/retreatsSlice'
import dayjs from 'dayjs'
import Image from 'next/image'
import { useRouter } from 'next/router'
import { useEffect, useRef, useState } from 'react'
import { useSelector } from 'react-redux'
import Markdown from 'react-markdown'
import { Button, DatePicker, Form, Input, Radio, Spin } from 'antd'
import {
  LeftOutlined,
  LoadingOutlined,
  MinusSquareOutlined,
  PlusSquareOutlined,
} from '@ant-design/icons'
import { motion, AnimatePresence } from 'framer-motion'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Pagination } from 'swiper'
import AzaharaH from '../../assets/azahara-h.svg'
import CheckoutView from './_comp/checkout'

import 'swiper/css'
import 'swiper/css/pagination'
import Link from 'next/link'
import classNames from 'classnames'

export default function RetreatView(props) {
  const [data, setData] = useState(null)
  const router = useRouter()
  const retreatsState = useSelector(selectRetreatsState)
  useEffect(() => {
    if (retreatsState != null && retreatsState.length > 0) {
      setData(
        retreatsState.find((item) => item.attributes.Slug === router.query.slug)
      )
    } else {
      // initial fetch all has not been made (view is accessed directly)
      fetch(
        `https://azahara-admin.herokuapp.com/api/retreats?filters\[Slug\][$eq]=${router.query.slug}&populate=*`
      )
        .then((d) => d.json())
        .then((d) => {
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

const RetreatHeader = ({ data: { Cover, Starts, Ends, Title, Subtitle } }) => {
  return (
    <div className="flex retreat-header">
      <div className="thumb col">
        {Cover?.data != null && (
          <Image
            src={Cover.data.attributes.formats.small.url}
            fill
            alt="cover"
          />
        )}
      </div>
      <div className="col justify-center flex flex-col">
        <div className="flex">
          <div className="date rounded-sm">
            {dayjs(Starts, 'YYYY-MM-DD').format('MMM DD')} -{' '}
            {dayjs(Ends, 'YYYY-MM-DD').format('MMM DD')}
          </div>
        </div>
        <h1>{Title}</h1>
        <h5>{Subtitle}</h5>
      </div>
    </div>
  )
}

const FullView = ({ data }) => {
  const [booking, setBooking] = useState({
    checkIn: data?.attributes?.Starts,
    checkOut: data?.attributes?.Ends,
    adults: 1,
    children: 0,
    room: null,
  })
  const [step, setStep] = useState(1)
  if (!data) {
    return <div>Loading...</div>
  }
  const handleUpdateBooking = (field) => (value) => {
    const $booking = { ...booking }
    $booking[field] =
      field.indexOf('check') === 0 ? value?.format('YYYY-MM-DD') : value
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
            x: -(step - 1) * window.innerWidth,
          }}
          transition={{
            type: 'spring',
            stiffness: 270,
            damping: 30,
          }}
        >
          <div className="retreat view full">
            <div className="inner rounded-lg flex flex-col">
              <div className="flex relative mt-3 nav-heading">
                <Link href="/">
                  <Button
                    onClick={() => setStep(1)}
                    type="link"
                    size="large"
                    className="back-btn"
                  >
                    <LeftOutlined />
                  </Button>
                </Link>
                <h5>Retreat booking</h5>
              </div>
              <RetreatHeader data={data.attributes} />
              <div className="mt-6 full-details">
                <div className="desc">
                  <Markdown>{data.attributes.Description}</Markdown>
                </div>
                <hr />
                <h3>Booking Details</h3>
                <div className="flex grid grid-flow-col auto-rows-max gap-x-1.5">
                  <div className="flex flex-col">
                    <div className="label">Check in</div>
                    <DatePicker
                      size="large"
                      allowClear={false}
                      inputReadOnly
                      value={dayjs(booking.checkIn, 'YYYY-MM-DD')}
                      disabledDate={(date) =>
                        date.valueOf() < now.valueOf() ||
                        date.valueOf() > dayjs(booking.checkOut, 'YYYY-MM-DD')
                      }
                      format="DD MMM"
                      onChange={handleUpdateBooking('checkIn')}
                    />
                  </div>
                  <div className="flex flex-col">
                    <div className="label">Check out</div>
                    <DatePicker
                      size="large"
                      allowClear={false}
                      inputReadOnly
                      value={dayjs(booking.checkOut, 'YYYY-MM-DD')}
                      disabledDate={(date) =>
                        date.valueOf() < dayjs(booking.checkIn, 'YYYY-MM-DD')
                      }
                      format="DD MMM"
                      onChange={handleUpdateBooking('checkOut')}
                    />
                  </div>
                </div>
                <div className="flex grid grid-flow-col auto-rows-max gap-x-1.5 mt-3">
                  <div className="flex flex-col">
                    <div className="label">Adults</div>
                    <Amount
                      value={booking.adults}
                      min={1}
                      onChange={handleUpdateBooking('adults')}
                    />
                  </div>
                  <div className="flex flex-col">
                    <div className="label">Children (5+)</div>
                    <Amount
                      value={booking.children}
                      min={0}
                      onChange={handleUpdateBooking('children')}
                    />
                  </div>
                </div>
                <ul className="feats">
                  <li>
                    <Image src="/bed.svg" alt="bed" width={18} height={18} />{' '}
                    {dayjs(booking.checkOut).diff(
                      booking.checkIn,
                      'day',
                      false
                    )}{' '}
                    Nights
                  </li>
                  <li>
                    <Image src="/meal.svg" alt="bed" width={18} height={18} />{' '}
                    Meals Included
                  </li>
                </ul>
                <hr />
                <div className="transportation">
                  <h4>Transportation to venue</h4>
                  <Radio.Group
                    value={booking.pickup}
                    onChange={(e, v) => {
                      handleUpdateBooking('pickup')(e.target.value)
                    }}
                  >
                    <Radio.Button value={true}>Airport pickup</Radio.Button>
                    <Radio.Button value={false}>
                      Bus, taxi or other
                    </Radio.Button>
                  </Radio.Group>
                  {booking.pickup && (
                    <p>
                      <small>
                        We offer an airport pickup service charged separately.
                        The cost starts from $100 from Malaga and $70 from
                        Granada and depends on number of passengers.
                      </small>
                    </p>
                  )}
                  {booking.pickup === false && (
                    <p>
                      <small>
                        Information on how to get the bus will be shared on your
                        email after booking.
                      </small>
                    </p>
                  )}
                </div>
              </div>
              <Button
                className="next-btn"
                type="primary"
                size="large"
                onClick={() => setStep(2)}
              >
                Choose Accommodation
              </Button>
            </div>
          </div>
          <RoomsView
            {...{
              setStep,
              step,
              booking,
              setBooking,
              retreat: data.attributes,
            }}
          />
          <CheckoutView
            {...{
              setStep,
              data: data.attributes,
              booking,
              retreat: data.attributes,
              calcPrice,
              RetreatHeader,
            }}
          />
        </motion.div>
      </div>
    </>
  )
}

const RoomsView = ({ setStep, step, booking, setBooking, retreat }) => {
  const scrollviewRef = useRef()
  const [selected, setSelected] = useState(-1)
  const [loading, setLoading] = useState(true)
  const [results, setResults] = useState([])
  const prevStep = useRef()
  const handleClick = (index) => () => {
    if (selected === -1) {
      setSelected(index)
    }
  }
  useEffect(() => {
    if (prevStep.current < step && step == 2) {
      setLoading(true)
      fetch('/api/accommodation?' + new URLSearchParams(booking))
        .then((d) => d.json())
        .then((d) => {
          setLoading(false)
          setResults(d)
        })
    }
    prevStep.current = step
  }, [step])
  const handleConfirmClick = () => {
    setBooking({
      ...booking,
      room: {
        calendarID: results[selected].Calendar_ID,
        title: results[selected].Title,
        bookingPrice: results[selected].bookingPrice,
      },
    })
    setStep(3)
  }
  const fullWidth = window.innerWidth > 720 ? 630 : window.innerWidth
  return (
    <div
      className={classNames('rooms-view view', { scrollLock: selected !== -1 })}
      ref={scrollviewRef}
    >
      <div className="inner rounded-lg flex flex-col">
        <div className="flex relative mt-3 nav-heading">
          <Button
            onClick={() => setStep(1)}
            type="link"
            size="large"
            className="back-btn"
          >
            <LeftOutlined />
          </Button>
          <h5>Choose Accommodation</h5>
        </div>
        {/* <h4>Choose Accommodation</h4> */}
        <AnimatePresence>
          {selected !== -1 && step === 2 && (
            <motion.div
              className="dimmer"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => {
                setSelected(-1)
              }}
            />
          )}
        </AnimatePresence>
        {loading && (
          <div className="spin-container">
            <Spin className="spinner" indicator={<LoadingOutlined spin />} />
          </div>
        )}
        {!loading && (
          <ul className="results">
            {results.map((result, index) => {
              return (
                <li key={result.Title} onClick={handleClick(index)}>
                  <motion.div
                    className={classNames('expander', {
                      expanded: selected === index,
                    })}
                    animate={
                      selected === index
                        ? {
                            x: -20,
                            y:
                              -index * 208 -
                              160 +
                              (scrollviewRef.current != null
                                ? scrollviewRef.current.scrollTop
                                : 0),
                            height: window.innerHeight - 20,
                            width: fullWidth - 20,
                            zIndex: 1000,
                          }
                        : {
                            x: 0,
                            y: 0,
                            width: fullWidth - 60,
                            height: 198,
                            zIndex: 0,
                          }
                    }
                    transition={{
                      type: 'spring',
                      stiffness: 220,
                      damping: 20,
                    }}
                  >
                    <div className="gallery">
                      {result.Gallery.data && (
                        <Swiper
                          pagination={true}
                          modules={[Pagination]}
                          className="mySwiper"
                        >
                          {result.Gallery.data.map((image) => (
                            <SwiperSlide key={image.id}>
                              <Image src={image.attributes.url} alt="g1" fill />
                            </SwiperSlide>
                          ))}
                        </Swiper>
                      )}
                    </div>
                    <div className="flex grid grid-cols-12 p-3">
                      <div className="col-span-8 flex flex-col">
                        <h3>{result.Title}</h3>
                        <ul className="feats">
                          <li>{result.Shared ? 'Shared' : 'Private'}</li>
                          <li>Sleeps {result.Beds}</li>
                          <li className="desktop-only">Meals included</li>
                        </ul>
                      </div>
                      <div className="col-span-4 flex flex-col prices text-right">
                        <strong>{calcPrice(result, booking, retreat)}</strong>
                        <small>
                          Final price for {booking.adults + booking.children}
                        </small>
                      </div>
                    </div>
                    <p className="p-3">
                      <small>{result.Description}</small>
                    </p>
                    <div className="bottom flex mt-auto m-3">
                      <Button size="large" onClick={() => setSelected(-1)}>
                        Cancel
                      </Button>
                      <Button
                        type="primary"
                        onClick={handleConfirmClick}
                        size="large"
                        className="ml-2 flex-1"
                      >
                        Confirm
                      </Button>
                    </div>
                  </motion.div>
                </li>
              )
            })}
          </ul>
        )}
      </div>
    </div>
  )
}

const calcPrice = (room, booking, retreat, isDeposit) => {
  let price = room.bookingPrice + retreat.Price * booking.adults
  if (isDeposit) price = price / 2
  return `€${price.toFixed(2)}`
}

const Amount = ({ value = 1, min = 0, onChange }) => {
  return (
    <div className="flex amount">
      <Button
        onClick={() => {
          if (value > min) onChange(value - 1)
        }}
        type="ghost"
        size="large"
        disabled={value <= min}
        icon={<MinusSquareOutlined />}
      ></Button>
      <div className="value">{value}</div>
      <Button
        onClick={() => {
          onChange(value + 1)
        }}
        type="ghost"
        size="large"
        icon={<PlusSquareOutlined />}
      ></Button>
    </div>
  )
}
