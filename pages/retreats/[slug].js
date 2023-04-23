import Layout from "@/components/layout";
import { selectRetreatsState } from "@/utils/retreatsSlice";
import moment from "moment";
import Image from "next/image";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import Markdown from 'react-markdown'

export default function RetreatView(props) {
  const [data, setData] = useState(null)
  const router = useRouter()
  const retreatsState = useSelector(selectRetreatsState);
  // console.log(retreatsState)
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
      <div className="container mx-auto">
        <FullView data={data} />
      </div>
    </Layout>
  )
}

const FullView = ({ data }) => {
  if(!data){
    return <div>Loading...</div>
  }
  const { Title, Subtitle, Cover, Starts, Ends, Description } = data.attributes
  return (
    <div className="retreat full bg-whitepx-4 sm:px-6 sm:pt-8 rounded-lg m-6">
      <div className="flex header">
        <div className="thumb col">
          {Cover?.data != null &&
          <Image src={Cover.data.attributes.formats.small.url} fill alt="cover" />
          }
        </div>
        <div className="col justify-center flex flex-col">
          <div className='flex'>
            <div className="date rounded-sm">{moment(Starts, 'YYYY-MM-DD').format('MMM DD')} - {moment(Ends, 'YYYY-MM-DD').format('MMM DD')}</div>
          </div>
          <h1>{Title}</h1>
          <h5>{Subtitle}</h5>
        </div>
      </div>
      <div className="mt-6">
        <div className="desc"><Markdown>{Description}</Markdown></div>
        <ul className="feats">
          <li><Image src="/bed.svg" alt="bed" width={18} height={18} /> 4 Nights</li>
          <li><Image src="/meal.svg" alt="bed" width={18} height={18} /> Meals Included</li>
        </ul>
        <hr />
        <h3>Booking Details</h3>
        <div className="flex grid grid-flow-col auto-rows-max">
          <div className="flex flex-vertical">
            <div>Check in</div>
          </div>
          <div className="flex flex-vertical">
            <div>Check out</div>
          </div>
        </div>
      </div>
    </div>
  )
}
