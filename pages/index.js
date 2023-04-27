import Image from 'next/image'
import { useEffect, useState } from 'react'
import dayjs from 'dayjs'
import Link from 'next/link'
import { selectRetreatsState, setRetreatsState } from '../utils/retreatsSlice';
import { useDispatch, useSelector } from "react-redux";
import AzaharaV from '../assets/azahara-v.svg'

export default function Home() {
  const retreatsState = useSelector(selectRetreatsState);
  const dispatch = useDispatch();
  useEffect(() => {
    if(retreatsState == null || retreatsState.length === 0){
      fetch('https://azahara-admin.herokuapp.com/api/retreats?populate=*')
      .then(d => d.json())
      .then(d => {
        dispatch(setRetreatsState(d.data))
      })
    }
  }, [])
  return (
    <div className="container mx-auto">
      <AzaharaV />
      <div className="retreats">
      {retreatsState?.map(retreat => {
        const { Title, Subtitle, Starts, Ends, Cover, Slug } = retreat.attributes
        return (
          <Link href={`/retreats/${Slug}`} key={retreat.id}>
          <div className="retreat card bg-whitepx-4 sm:px-6 sm:pt-8 rounded-lg m-6">
            <div className="retreat-header flex">
              <div className="thumb col">
                {Cover.data != null &&
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
          </div>
          </Link>
        )
      })}
      </div>
    </div>
  )
}
