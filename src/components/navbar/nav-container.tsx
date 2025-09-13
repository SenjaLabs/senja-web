import { ReactNode } from "react"

interface NavContainerProps {
  children: ReactNode
}

export function NavContainer({ children }: NavContainerProps) {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 max-w-xl mx-auto">
      <div 
        className="absolute -top-4 left-0 right-0 h-6 "
      ></div>
      <div 
        className="relative bg-gradient-to-r from-[#FFF3E0] to-[#FFE0B2] border-t border-[#FFE0B2]/50 shadow-lg max-w-xl mx-auto"
      >
        <div className="relative ">
          <div className="absolute inset-0 bg-gradient-to-t from-white/10 to-transparent rounded-t-3xl"></div>
          {children}
        </div>
      </div>
    </div>
  )
}
