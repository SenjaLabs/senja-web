import { ReactNode } from "react"

interface NavContainerProps {
  children: ReactNode
}

export function NavContainer({ children }: NavContainerProps) {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-50">
      <div 
        className="absolute -top-4 left-0 right-0 h-6 bg-gradient-to-b from-transparent to-white/30"
        style={{ backdropFilter: 'blur(12px)' }}
      ></div>
      <div 
        className="relative bg-white/90 border-t border-white/20 shadow-lg"
        style={{ backdropFilter: 'blur(3px) saturate(150%)' }}
      >
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-t from-white/10 to-transparent rounded-t-3xl"></div>
          {children}
        </div>
      </div>
    </div>
  )
}
