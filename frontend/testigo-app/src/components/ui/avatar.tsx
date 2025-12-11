import React from 'react'

type avatarInitialsProps = {
    avatarInitials: string
    onClick?: ()=> void
}


const Avatar = ({avatarInitials, onClick}: avatarInitialsProps) => {
  return (
    <div className="bg-secondary rounded-full w-10 h-10 flex items-center justify-center text-white font-bold" onClick={onClick}>{avatarInitials}
            </div>
  )
}

export default Avatar
