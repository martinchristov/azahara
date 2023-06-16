import Image from 'next/image'
import { useEffect, useState } from 'react'
import dayjs from 'dayjs'
import Link from 'next/link'
import { selectRetreatsState, setRetreatsState } from '../utils/retreatsSlice'
import { useDispatch, useSelector } from 'react-redux'
import AzaharaV from '../assets/azahara-v.svg'

export default function Home() {
  const retreatsState = useSelector(selectRetreatsState)
  const dispatch = useDispatch()
  useEffect(() => {
    if (retreatsState == null || retreatsState.length === 0) {
      fetch('https://azahara-admin.herokuapp.com/api/retreats?populate=*')
        .then((d) => d.json())
        .then((d) => {
          dispatch(setRetreatsState(d.data))
        })
    }
  }, [])
  return (
    <div className="view-slider">
      <div className="view landing">
        <div className="container mx-auto">
          <div className="az-container">
            <AzaharaV />
          </div>
          <div className="retreats">
            <h2>Upcoming Retreats</h2>
            {retreatsState?.map((retreat) => {
              const { Title, Subtitle, Starts, Ends, Cover, Slug } =
                retreat.attributes
              return (
                <Link href={`/retreats/${Slug}`} key={retreat.id}>
                  <div className="retreat card sm:px-6 sm:pt-8 rounded-lg m-6">
                    <div className="retreat-header flex">
                      <div className="thumb col">
                        {Cover.data != null && (
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
                            {dayjs(Starts, 'YYYY-MM-DD').format('MMMM DD')} -{' '}
                            {dayjs(Ends, 'YYYY-MM-DD').format('MMMM DD')}
                          </div>
                        </div>
                        <h1>{Title}</h1>
                        <h5>{Subtitle}</h5>
                      </div>
                    </div>
                  </div>
                </Link>
              )
            })}
            <h2>Other stays</h2>
            <Link href="/retreats/free">
              <div className="retreat card other-stay sm:px-6 sm:pt-8 rounded-lg m-6">
                <div className="retreat-header flex">
                  <div className="thumb col">
                    <Image
                      src="/free-booking-icon.jpg"
                      alt="free booking"
                      fill
                    />
                  </div>
                  <div className="col justify-center flex flex-col">
                    <h1>Free Booking</h1>
                    <h5>Stay at Azahara outside of retreat dates</h5>
                  </div>
                </div>
              </div>
            </Link>
            <a
              target="_blank"
              href="https://docs.google.com/forms/d/e/1FAIpQLSfPr_mWB8WN5xHMwwqeIV7e6gANOuDAWfoDibilcMPxBmqYXw/viewform?pli=1"
            >
              <div className="retreat card other-stay sm:px-6 sm:pt-8 rounded-lg m-6">
                <div className="retreat-header flex">
                  <div className="thumb col">
                    <Image src="/volunteer-icon.jpg" alt="volunteer" fill />
                  </div>
                  <div className="col justify-center flex flex-col">
                    <h1>Become a volunteer</h1>
                    <h5>
                      Join the family of contributors that make Azahara work
                    </h5>
                  </div>
                </div>
              </div>
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
