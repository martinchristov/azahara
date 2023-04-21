import Image from 'next/image'
import { Inter } from 'next/font/google'
import { useEffect, useState } from 'react'
import moment from 'moment'
import Link from 'next/link'

const inter = Inter({ subsets: ['latin'] })

export default function Home() {
  const [retreats, setRetreats] = useState([])
  useEffect(() => {
    fetch('https://azahara-admin.herokuapp.com/api/retreats?populate=*')
    .then(d => d.json())
    .then(d => {
      setRetreats(d.data)
      console.log(d)
    })
  }, [])
  return (
    <div className="container mx-auto">
      <div className="retreats">
      {retreats.map(retreat => {
        const { Title, Subtitle, Starts, Ends, Cover, Slug } = retreat.attributes
        return (
          <Link href={`/retreats/${Slug}`} key={retreat.id}>
          <div className="retreat bg-whitepx-4 sm:px-6 sm:pt-8 rounded-lg m-6">
            <div className="thumb col">
              {Cover.data != null &&
              <Image src={Cover.data.attributes.formats.small.url} fill alt="cover" />
              }
            </div>
            <div className="col">
              <div className='flex'>
                <div className="date rounded-sm">{moment(Starts, 'YYYY-MM-DD').format('MMM DD')} - {moment(Ends, 'YYYY-MM-DD').format('MMM DD')}</div>
              </div>
              <h2>{Title}</h2>
              <h3>{Subtitle}</h3>
            </div>
          </div>
          </Link>
        )
      })}
      </div>
    </div>
  )
}
