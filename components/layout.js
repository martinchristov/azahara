import { motion } from "framer-motion";
import Image from "next/image";
import AzaharaV from '../assets/azahara-v.svg'

const Layout = ({ children }) => {
  return (
    <main className="min-h-screen">
      <Image className="mobile-only bg" src="/bg.jpg" alt="bg" fill />
      <Image className="desktop-only bg" src="/bg-desktop.jpg" alt="bg" fill />
      {/* <motion.div
        initial={{ x: 300, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        exit={{ x: -300, opacity: 0 }}
        transition={{
          type: "spring",
          stiffness: 460,
          damping: 40,
        }}
      > */}
      {children}
      {/* </motion.div> */}
    </main>
  )
}

export default Layout