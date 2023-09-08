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
import RetreatHeader from './_comp/header'

import 'swiper/css'
import 'swiper/css/pagination'
import Link from 'next/link'
import classNames from 'classnames'

export default function RetreatView(props) {
  const [data, setData] = useState(null)
  const router = useRouter()
  const retreatsState = useSelector(selectRetreatsState)
  useEffect(() => {
    if (router.query.slug !== 'free')
      if (retreatsState != null && retreatsState.length > 0) {
        setData(
          retreatsState.find(
            (item) => item.attributes.Slug === router.query.slug
          )
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
      {router.query.slug === 'free' && <FullView free />}
    </div>
  )
}

const FullView = ({ data, free }) => {
  const [booking, setBooking] = useState({
    checkIn: !free ? data?.attributes?.Starts : undefined,
    checkOut: !free ? data?.attributes?.Ends : undefined,
    adults: 1,
    children: 0,
    room: null,
  })
  const containerRef = useRef()
  const [step, setStep] = useState(1)
  const [width, setWidth] = useState(0)
  useEffect(() => {
    window.addEventListener('resize', () => {
      setWidth(window.innerWidth)
    })
    setWidth(window.innerWidth)
  }, [])
  if (!data && !free) {
    return <div>Loading...</div>
  }
  const handleUpdateBooking = (field) => (value) => {
    const $booking = { ...booking }
    $booking[field] =
      field.indexOf('check') === 0 ? value?.format('YYYY-MM-DD') : value
    setBooking($booking)
  }
  const now = dayjs()
  console.log(booking)
  return (
    <>
      <div className="absolute">
        <AzaharaH />
      </div>
      <div className="relative view-slider" ref={containerRef}>
        <motion.div
          className="silsila"
          animate={{
            x: -(step - 1) * width,
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
                {!free ? <h5>Retreat Booking</h5> : <h5>Back to retreats</h5>}
              </div>
              <RetreatHeader free={free} data={data?.attributes} />
              <div className="mt-6 full-details">
                {!free && (
                  <>
                    <div className="desc">
                      <Markdown>{data.attributes.Description}</Markdown>
                    </div>
                    <hr />
                  </>
                )}
                <h3>Booking Details</h3>
                <div className="flex grid grid-flow-col auto-rows-max gap-x-1.5">
                  <div className="flex flex-col">
                    <div className="label">Check in</div>
                    <DatePicker
                      size="large"
                      allowClear={false}
                      inputReadOnly
                      value={
                        booking.checkIn
                          ? dayjs(booking.checkIn, 'YYYY-MM-DD')
                          : null
                      }
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
                      value={
                        booking.checkOut
                          ? dayjs(booking.checkOut, 'YYYY-MM-DD')
                          : null
                      }
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
                  {!free && (
                    <li>
                      <Image src="/meal.svg" alt="bed" width={18} height={18} />{' '}
                      Meals Included
                    </li>
                  )}
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
              free,
              retreat: data?.attributes,
            }}
          />
          <CheckoutView
            {...{
              setStep,
              step,
              data: data?.attributes,
              booking,
              free,
              retreat: data?.attributes,
              calcPrice,
            }}
          />
          <div className="thankyou view">
            <div className="inner rounded-lg flex flex-col">
              <div className="center">
                <h1>Booking Confirmed</h1>
                <div className="confirm-details">
                  <div className="row">
                    <div className="col">
                      <span>check-in</span>
                      <div>
                        {dayjs(booking.checkIn, 'YYYY-MM-DD').format('D MMMM')}
                      </div>
                    </div>
                    <div className="col">
                      <span>check-out</span>
                      <div>
                        {dayjs(booking.checkOut, 'YYYY-MM-DD').format('D MMMM')}
                      </div>
                    </div>
                  </div>
                  <div className="row">
                    <div className="col">
                      <span>guests</span>
                      <div>{booking.adults + booking.children}</div>
                    </div>
                    <div className="col">
                      <span>payment</span>
                      <div>
                        {calcPrice(
                          booking.room,
                          booking,
                          data?.attributes,
                          true
                        )}{' '}
                        <small>due on arrival</small>
                      </div>
                    </div>
                  </div>
                  {data && (
                    <div className="row">
                      <div className="col">
                        <span>event</span>
                        <div>{data.attributes.Title}</div>
                      </div>
                    </div>
                  )}
                </div>
                <p>
                  Thank you for your booking!
                  <br />
                  You will also receive an email confirmation. Looking forward
                  to see you soon inshaAllah!
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </>
  )
}

const RoomsView = ({ setStep, step, booking, setBooking, retreat }) => {
  const scrollviewRef = useRef()
  const [selectedIndex, setSelectedIndex] = useState(-1)
  const [selectedRoom, setSelectedRoom] = useState(null)
  const [loading, setLoading] = useState(true)
  const [results, setResults] = useState([])
  const prevStep = useRef()
  const router = useRouter()
  const handleClick = (index, room) => () => {
    if (selectedIndex === -1) {
      setSelectedIndex(index)
      setSelectedRoom(room)
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
  useEffect(() => {
    router.beforePopState(({ as }) => {
      if (as !== router.asPath) {
        // Will run when leaving the current page; on back/forward actions
        // Add your logic here, like toggling the modal state
        setSelectedIndex((_selected) => {
          if (_selected !== -1) {
            window.history.pushState(null, '', router.asPath)
            return -1
          }
          setStep((_step) => {
            if (_step === 2) {
              window.history.pushState(null, '', router.asPath)
              return 1
            }
            return _step
          })
          return _selected
        })
        return false
      }
      return true
    })

    return () => {
      router.beforePopState(() => true)
    }
  }, [router])
  const handleConfirmClick = () => {
    setBooking({
      ...booking,
      room: {
        calendarID: selectedRoom.Calendar_ID,
        title: selectedRoom.Title,
        bookingPrice: selectedRoom.bookingPrice,
        shared: selectedRoom.Shared,
      },
    })
    setStep(3)
  }
  const fullWidth = window.innerWidth > 720 ? 630 : window.innerWidth
  return (
    <div
      className={classNames('rooms-view view', {
        scrollLock: selectedIndex !== -1,
      })}
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
          {selectedIndex !== -1 && step === 2 && (
            <motion.div
              className="dimmer"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => {
                setSelectedIndex(-1)
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
            {results
              .filter((result) => result.available)
              .sort((a, b) => a.bookingPrice - b.bookingPrice)
              .map((result, index) => {
                return (
                  <RoomResult
                    key={result.Title}
                    {...{
                      result,
                      handleClick,
                      index,
                      scrollviewRef,
                      setSelectedIndex,
                      handleConfirmClick,
                      fullWidth,
                      booking,
                      retreat,
                    }}
                    isSelected={selectedIndex === index}
                  />
                )
              })}
          </ul>
        )}
      </div>
    </div>
  )
}

const RoomResult = ({
  result,
  handleClick,
  isSelected,
  index,
  scrollviewRef,
  setSelectedIndex,
  handleConfirmClick,
  fullWidth,
  booking,
  retreat,
}) => {
  const pRef = useRef()
  const [expHeight, setExpHeight] = useState(0)
  useEffect(() => {
    const calcSetHeight = () => {
      const winHeight = window.innerHeight - 20
      const calcHeight = pRef.current.clientHeight + 400
      setExpHeight(calcHeight < winHeight ? winHeight : calcHeight)
    }
    calcSetHeight()
    window.addEventListener('resize', calcSetHeight)
  }, [])
  return (
    <li onClick={handleClick(index, result)}>
      <motion.div
        className={classNames('expander', {
          expanded: isSelected,
        })}
        animate={
          isSelected
            ? {
                x: -20,
                y:
                  -index * 208 -
                  160 +
                  (scrollviewRef.current != null
                    ? scrollviewRef.current.scrollTop
                    : 0),
                height: expHeight,
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
              {result.Gallery.data
                .sort((a, b) =>
                  a.attributes.name < b.attributes.name ? -1 : 1
                )
                .map((image) => {
                  const url = image.attributes.formats.hasOwnProperty('large')
                    ? image.attributes.formats.large.url
                    : image.attributes.url
                  return (
                    <SwiperSlide key={image.id}>
                      <Image src={url} alt="g1" fill />
                    </SwiperSlide>
                  )
                })}
            </Swiper>
          )}
        </div>
        <div className="flex grid grid-cols-12 p-3">
          <div className="col-span-8 flex flex-col">
            <h3>{result.Title}</h3>
            <ul className="feats">
              <li>{result.Shared ? 'Shared' : 'Private'}</li>
              <li>Sleeps {result.Beds}</li>
              {retreat != null && (
                <li className="desktop-only">Meals included</li>
              )}
            </ul>
          </div>
          <div className="col-span-4 flex flex-col prices text-right">
            <strong>{calcPrice(result, booking, retreat)}</strong>
            <small>Final price for {booking.adults + booking.children}</small>
          </div>
        </div>
        <p className="p-3" ref={pRef}>
          <small>{result.Description}</small>
        </p>
        <div className="bottom flex mt-auto m-3">
          <Button size="large" onClick={() => setSelectedIndex(-1)}>
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
}

const calcPrice = (room, booking, retreat, isDeposit, isString = true) => {
  if (!room) return null
  let price = room.bookingPrice
  if (retreat) {
    price += retreat.Price * booking.adults
  }
  if (isDeposit) price = price / 2
  if (!price) return ''
  if (isString) return `€${price.toFixed(2)}`
  return price
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
