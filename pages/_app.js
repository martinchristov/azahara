import '@/styles/globals.scss'
import Image from 'next/image'

const Layout = ({ children }) => {
  return (
    <main className="min-h-screen">
      <Image className="mobile-only bg" src="/bg.jpg" alt="bg" fill />
      <Image className="desktop-only bg" src="/bg-desktop.jpg" alt="bg" fill />
      {children}
    </main>
  )
}

export default function App({ Component, pageProps }) {
  return (
  <Layout>
    <Component {...pageProps} />
  </Layout>
  )
}
