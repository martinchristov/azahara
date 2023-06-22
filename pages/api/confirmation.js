export default async function handler(req, res) {
  const { booking, retreat, details } = req.body
  console.log(booking, retreat, details)
  console.log('SEND EMAILS HERE')
  res.send({ ok: true })
}
