import React from 'react'
import Header from './Header'
import Footer from './Footer'

const LayoutGeneral = ({ children }: { children: React.ReactNode }) => {
  return (
    <>
      <Header />
      <main className="flex-1">
        {children}
      </main>
      <Footer />
    </>
  )
}

export default LayoutGeneral
