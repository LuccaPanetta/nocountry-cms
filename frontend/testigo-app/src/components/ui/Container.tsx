import { FC, ReactNode } from "react"

const Container: FC<{ children: ReactNode }> = ({ children }) => {
  return (
    <div className="w-full max-w-full px-4 py-8 mx-auto md:max-w-[646px] lg:max-w-[1277px] flex flex-col">
      {children}
    </div>
  )
}

export default Container