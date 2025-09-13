"use client"

import React, { useState } from "react"
import { BearyAlert } from "./beary-alert"

/**
 * Contoh penggunaan sederhana BearyAlert
 * 
 * Komponen ini menunjukkan cara paling mudah menggunakan BearyAlert
 * untuk berbagai skenario transaksi.
 */
export function SimpleAlertExample() {
  const [alertState, setAlertState] = useState<{
    isOpen: boolean
    type: "success" | "pending" | "failed" | "info"
    title?: string
    description?: string
  }>({
    isOpen: false,
    type: "success"
  })

  const showAlert = (
    type: "success" | "pending" | "failed" | "info",
    title?: string,
    description?: string
  ) => {
    setAlertState({
      isOpen: true,
      type,
      title,
      description
    })
  }

  const hideAlert = () => {
    setAlertState(prev => ({ ...prev, isOpen: false }))
  }

  return (
    <div className="p-6 max-w-md mx-auto">
      <h2 className="text-2xl font-bold text-center mb-6">
        Beary Alert Demo 🐻
      </h2>
      
      <div className="space-y-3">
        <button
          onClick={() => showAlert("success")}
          className="w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
        >
          🎉 Transaksi Berhasil
        </button>
        
        <button
          onClick={() => showAlert("pending")}
          className="w-full bg-yellow-500 hover:bg-yellow-600 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
        >
          ⏳ Sedang Memproses
        </button>
        
        <button
          onClick={() => showAlert("failed")}
          className="w-full bg-red-500 hover:bg-red-600 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
        >
          ❌ Transaksi Gagal
        </button>
        
        <button
          onClick={() => showAlert("info", "Info Penting!", "Ini adalah contoh alert info dengan custom title dan description.")}
          className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
        >
          ℹ️ Informasi
        </button>
      </div>

      <BearyAlert
        type={alertState.type}
        isOpen={alertState.isOpen}
        onClose={hideAlert}
        title={alertState.title}
        description={alertState.description}
        onButtonClick={() => {
          console.log(`${alertState.type} alert button clicked!`)
        }}
      />
    </div>
  )
}
