import Layout from "@/components/layout";
import { selectRetreatsState } from "@/utils/retreatsSlice";
import dayjs from "dayjs";
import Image from "next/image";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import Markdown from 'react-markdown'
import { Button, DatePicker } from "antd";
import { MinusSquareOutlined, PlusSquareOutlined } from "@ant-design/icons";
import { motion } from "framer-motion";

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
      fetch(`https://azahara-admin.herokuapp.com/api/retreats?filters\[Slug\][$eq]=${router.query.slug}`)
      .then(d => d.json())
      .then(d => {
        setData(d.data[0])
      })
    }
  }, [])
  return (
    <Layout>
      <div className="container mx-auto overflow-hidden">
        {data && <FullView {...{ data }} />}
      </div>
    </Layout>
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
  const { Title, Subtitle, Cover, Starts, Ends, Description } = data.attributes
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
    <div className="retreat full bg-white px-4 sm:px-6 sm:pt-8 rounded-lg m-6 flex flex-col">
      <div className="flex header">
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
      <div className="mt-6 full-details">
        <div className="desc"><Markdown>{Description}</Markdown></div>
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
        {/* <div>
          <RangePicker value={[dayjs(booking.checkIn, 'YYYY-MM-DD'), dayjs(booking.checkOut, 'YYYY-MM-DD')]} format="YYYY-MM-DD" placeholder={['Check In', 'Check Out']} />
        </div> */}
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
      </div>
      <Button className="next-btn" type="primary" size="large" onClick={() => setStep(2)}>Choose Accommodation</Button>
    </div>

    <div className="rooms-view">
      <div className="bg-white px-4 sm:px-6 sm:pt-8 rounded-lg m-6 flex flex-col">
        <div className="flex">
          <Button onClick={() => setStep(1)}>back</Button>
        </div>
        <h4>Select Accommodation</h4>
        <ul className="results">
          <li>
            <div className="gallery" />
            <div className="flex grid grid-col-12">
              <div className="col-7 flex flex-col">
                <h3>Casa Aisha</h3>
                <ul className="flex">
                  <li>Sleeps 4</li>
                </ul>
              </div>
            </div>
          </li>
        </ul>
      </div>
    </div>
    </motion.div>
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