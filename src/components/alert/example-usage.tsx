"use client"

import React, { useState } from "react"
import { BearyAlert, SuccessAlert, PendingAlert, FailedAlert } from "./index"

/**
 * Contoh penggunaan komponen alert Beary
 * 
 * Komponen ini menunjukkan cara menggunakan berbagai jenis alert
 * yang telah dibuat dengan gambar beary yang lucu dan friendly.
 */
export function AlertExampleUsage() {
  const [successOpen, setSuccessOpen] = useState(false)
  const [pendingOpen, setPendingOpen] = useState(false)
  const [failedOpen, setFailedOpen] = useState(false)
  const [bearySuccessOpen, setBearySuccessOpen] = useState(false)
  const [bearyPendingOpen, setBearyPendingOpen] = useState(false)
  const [bearyFailedOpen, setBearyFailedOpen] = useState(false)
  const [bearyInfoOpen, setBearyInfoOpen] = useState(false)

  return (
    <div className="p-8 space-y-4">
      <h1 className="text-3xl font-bold text-center mb-8">
        Contoh Penggunaan Beary Alert Components 🐻
      </h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Basic Alert Components */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Basic Alert Components</h2>
          
          <button
            onClick={() => setSuccessOpen(true)}
            className="w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
          >
            Show Success Alert
          </button>
          
          <button
            onClick={() => setPendingOpen(true)}
            className="w-full bg-yellow-500 hover:bg-yellow-600 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
          >
            Show Pending Alert
          </button>
          
          <button
            onClick={() => setFailedOpen(true)}
            className="w-full bg-red-500 hover:bg-red-600 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
          >
            Show Failed Alert
          </button>
        </div>

        {/* Advanced Beary Alert Component */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Advanced Beary Alert</h2>
          
          <button
            onClick={() => setBearySuccessOpen(true)}
            className="w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
          >
            Beary Success Alert
          </button>
          
          <button
            onClick={() => setBearyPendingOpen(true)}
            className="w-full bg-yellow-500 hover:bg-yellow-600 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
          >
            Beary Pending Alert
          </button>
          
          <button
            onClick={() => setBearyFailedOpen(true)}
            className="w-full bg-red-500 hover:bg-red-600 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
          >
            Beary Failed Alert
          </button>
          
          <button
            onClick={() => setBearyInfoOpen(true)}
            className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
          >
            Beary Info Alert
          </button>
        </div>
      </div>

      {/* Basic Alert Components */}
      <SuccessAlert
        isOpen={successOpen}
        onClose={() => setSuccessOpen(false)}
        onButtonClick={() => {}}
      />

      <PendingAlert
        isOpen={pendingOpen}
        onClose={() => setPendingOpen(false)}
        onButtonClick={() => {}}
      />

      <FailedAlert
        isOpen={failedOpen}
        onClose={() => setFailedOpen(false)}
        onButtonClick={() => {}}
      />

      {/* Advanced Beary Alert Components */}
      <BearyAlert
        type="success"
        isOpen={bearySuccessOpen}
        onClose={() => setBearySuccessOpen(false)}
        onButtonClick={() => {}}
        showSparkles={true}
      />

      <BearyAlert
        type="pending"
        isOpen={bearyPendingOpen}
        onClose={() => setBearyPendingOpen(false)}
        onButtonClick={() => {}}
      />

      <BearyAlert
        type="failed"
        isOpen={bearyFailedOpen}
        onClose={() => setBearyFailedOpen(false)}
        onButtonClick={() => {}}
      />

      <BearyAlert
        type="info"
        isOpen={bearyInfoOpen}
        onClose={() => setBearyInfoOpen(false)}
        title="Informasi Khusus! 🎯"
        description="Ini adalah contoh custom title dan description untuk alert info."
        buttonText="Saya Mengerti!"
        onButtonClick={() => {}}
      />
    </div>
  )
}

/**
 * Hook untuk menggunakan alert dengan mudah
 */
export function useBearyAlert() {
  const [alertState, setAlertState] = useState<{
    isOpen: boolean
    type: "success" | "pending" | "failed" | "info"
    title?: string
    description?: string
    buttonText?: string
    onButtonClick?: () => void
  }>({
    isOpen: false,
    type: "success"
  })

  const showAlert = (
    type: "success" | "pending" | "failed" | "info",
    options?: {
      title?: string
      description?: string
      buttonText?: string
      onButtonClick?: () => void
    }
  ) => {
    setAlertState({
      isOpen: true,
      type,
      ...options
    })
  }

  const hideAlert = () => {
    setAlertState(prev => ({ ...prev, isOpen: false }))
  }

  const AlertComponent = () => (
    <BearyAlert
      type={alertState.type}
      isOpen={alertState.isOpen}
      onClose={hideAlert}
      title={alertState.title}
      description={alertState.description}
      buttonText={alertState.buttonText}
      onButtonClick={alertState.onButtonClick}
    />
  )

  return {
    showAlert,
    hideAlert,
    AlertComponent
  }
}
