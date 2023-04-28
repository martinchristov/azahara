
export default async function handler(req, res) {
  const params = new URLSearchParams({
    populate: '*',
    'filters\[Active\][$eq]': true,
  })
  await fetch(`https://azahara-admin.herokuapp.com/api/rooms?${params}`)
  .then(d => d.json())
  .then(d => {
    res.status(200).json(d)
  })
}