import Image from 'next/image'
import dayjs from 'dayjs'
import classNames from 'classnames'

const RetreatHeader = ({ data, free }) => {
  if (free) {
    return (
      <div className={classNames('retreat-header flex', { free })}>
        <div className="thumb col">
          <Image src="/free-booking-icon.jpg" alt="free booking" fill />
        </div>
        <div className="col justify-center flex flex-col">
          <h1>Book Your Stay</h1>
          <h5>Stay at Azahara outside of retreat dates</h5>
        </div>
      </div>
    )
  }
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
