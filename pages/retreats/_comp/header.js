import Image from 'next/image'
import dayjs from 'dayjs'

const RetreatHeader = ({ data }) => {
  return (
    <div className="flex retreat-header">
      <div className="thumb col">
        {data?.Cover?.data != null && (
          <Image
            src={data.Cover.data.attributes.formats.small.url}
            fill
            alt="cover"
          />
        )}
      </div>
      {data && (
        <div className="col justify-center flex flex-col">
          <div className="flex">
            <div className="date rounded-sm">
              {dayjs(data.Starts, 'YYYY-MM-DD').format('MMM DD')} -{' '}
              {dayjs(data.Ends, 'YYYY-MM-DD').format('MMM DD')}
            </div>
          </div>
          <h1>{data.Title}</h1>
          <h5>{data.Subtitle}</h5>
        </div>
      )}
    </div>
  )
}
export default RetreatHeader
