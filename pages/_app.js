import '@/styles/globals.scss'
import Image from 'next/image'
import { wrapper } from '@/utils/store'
import { AnimatePresence } from 'framer-motion'
import Layout from '../components/layout'


function App({ Component, pageProps, router }) {
  return (
    <Layout>
      <Component {...pageProps} key={router.asPath} />
    </Layout>
  )
}

export default wrapper.withRedux(App)