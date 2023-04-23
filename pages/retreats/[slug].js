import Layout from "@/components/layout";
import { selectRetreatsState } from "@/utils/retreatsSlice";
import { wrapper } from "@/utils/store";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";

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
  console.log(data)
  return (
    <Layout>
      <div className="container mx-auto">
        <div className="bg-white px-4 sm:px-6 sm:pt-8 rounded-lg m-6">retreat</div>
      </div>
    </Layout>
  )
}

// export const getServerSideProps = wrapper.getServerSideProps($store => ({req, res, ...etc}) => {
//   console.log($store.getState())
//   console.log(etc)
//   // const { store } = wrapper.useWrappedStore(selectRetreatsState)
//   // console.log(store)
// });