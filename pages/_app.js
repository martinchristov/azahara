import '@/styles/globals.scss'
import { wrapper } from '@/utils/store'
import Layout from '../components/layout'


function App({ Component, pageProps, router }) {
  return (
    <Layout>
      <Component {...pageProps} key={router.asPath} />
    </Layout>
  )
}

export default wrapper.withRedux(App)