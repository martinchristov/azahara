import '@/styles/globals.scss'
import Image from 'next/image'
import { wrapper } from '@/utils/store'
import { AnimatePresence } from 'framer-motion'


function App({ Component, pageProps, router }) {
  return (
    <AnimatePresence mode="wait" initial={false}>
      <Component {...pageProps} key={router.asPath} />
    </AnimatePresence>
  )
}

export default wrapper.withRedux(App)