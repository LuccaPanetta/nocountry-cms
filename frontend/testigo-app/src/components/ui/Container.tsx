import { FC, ReactNode } from "react"

const Container: FC<{ children: ReactNode }> = ({ children }) => {
  return (
    <div className="w-full max-w-[300px] flex flex-col py-8 m-auto md:max-w-[646px] lg:max-w-[1277px]">
      {children}
    </div>
  )
}

export default Container