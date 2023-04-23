import Layout from "@/components/layout";
import { selectRetreatsState } from "@/utils/retreatsSlice";
import moment from "moment";
import Image from "next/image";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import Markdown from 'react-markdown'
import { Button, DatePicker } from "antd";
import { MinusSquareOutlined, PlusSquareOutlined } from "@ant-design/icons";

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
    <div className="retreat full bg-whitepx-4 sm:px-6 sm:pt-8 rounded-lg m-6 flex flex-col">
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
      <div className="mt-6 full-details">
        <div className="desc"><Markdown>{Description}</Markdown></div>
        <hr />
        <h3>Booking Details</h3>
        <div className="flex grid grid-flow-col auto-rows-max gap-x-1.5">
          <div className="flex flex-col">
            <div className="label">Check in</div>
            <DatePicker onChange={() => {}} />
          </div>
          <div className="flex flex-col">
            <div className="label">Check out</div>
            <DatePicker onChange={() => {}} />
          </div>
        </div>
        <div className="flex grid grid-flow-col auto-rows-max gap-x-1.5 mt-3">
          <div className="flex flex-col">
            <div className="label">Adults</div>
            <Amount value={1} min={1} />
          </div>
          <div className="flex flex-col">
            <div className="label">Children (5+)</div>
            <Amount value={0} min={0} />
          </div>
        </div>
        <ul className="feats">
          <li><Image src="/bed.svg" alt="bed" width={18} height={18} /> 4 Nights</li>
          <li><Image src="/meal.svg" alt="bed" width={18} height={18} /> Meals Included</li>
        </ul>
      </div>
      <Button type="primary" size="large">Choose Accommodation</Button>
    </div>
  )
}

const Amount = ({ value = 1, min = 0 }) => {
  return (
    <div className="flex amount">
      <Button type="ghost" size="large" icon={<PlusSquareOutlined />}></Button>
      <div className="value">{value}</div>
      <Button type="ghost" size="large" disabled={value <= min} icon={<MinusSquareOutlined />}></Button>
    </div>
  )
}