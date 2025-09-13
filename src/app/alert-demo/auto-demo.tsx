"use client"

import React, { useState, useEffect } from "react"
import { BearyAlert } from "@/components/alert"

/**
 * Komponen Auto Demo untuk menampilkan alert secara otomatis
 * Berguna untuk showcase atau presentasi
 */
export function AutoDemo() {
  const [currentAlert, setCurrentAlert] = useState<{
    isOpen: boolean
    type: "success" | "pending" | "failed" | "info"
    title: string
    description: string
    buttonText: string
  }>({
    isOpen: false,
    type: "success",
    title: "",
    description: "",
    buttonText: ""
  })

  const [isRunning, setIsRunning] = useState(false)
  const [currentIndex, setCurrentIndex] = useState(0)

  const alertSequence = [
    {
      type: "success" as const,
      title: "Selamat Datang! 🎉",
      description: "Selamat datang di demo Beary Alert Components! Mari kita lihat berbagai jenis alert yang tersedia.",
      buttonText: "Lanjutkan Demo"
    },
    {
      type: "pending" as const,
      title: "Demo Sedang Berjalan ⏳",
      description: "Demo otomatis sedang berjalan. Anda akan melihat berbagai jenis alert secara berurutan.",
      buttonText: "Tunggu Sebentar"
    },
    {
      type: "info" as const,
      title: "Informasi Demo ℹ️",
      description: "Ini adalah alert jenis info. Alert ini cocok untuk memberikan informasi penting kepada pengguna.",
      buttonText: "Mengerti"
    },
    {
      type: "failed" as const,
      title: "Demo Hampir Selesai! 😅",
      description: "Jangan khawatir, ini hanya demo! Alert failed ini menunjukkan bagaimana menampilkan pesan error dengan cara yang friendly.",
      buttonText: "Selesai Demo"
    }
  ]

  const startAutoDemo = () => {
    setIsRunning(true)
    setCurrentIndex(0)
    showNextAlert()
  }

  const stopAutoDemo = () => {
    setIsRunning(false)
    setCurrentAlert(prev => ({ ...prev, isOpen: false }))
  }

  const showNextAlert = () => {
    if (currentIndex < alertSequence.length) {
      const alert = alertSequence[currentIndex]
      setCurrentAlert({
        isOpen: true,
        type: alert.type,
        title: alert.title,
        description: alert.description,
        buttonText: alert.buttonText
      })
    } else {
      // Demo selesai
      setIsRunning(false)
    }
  }

  const handleAlertClose = () => {
    setCurrentAlert(prev => ({ ...prev, isOpen: false }))
    
    if (isRunning) {
      // Tunggu sebentar sebelum menampilkan alert berikutnya
      setTimeout(() => {
        setCurrentIndex(prev => prev + 1)
        if (currentIndex + 1 < alertSequence.length) {
          showNextAlert()
        } else {
          setIsRunning(false)
        }
      }, 1000)
    }
  }

  return (
    <div className="bg-white rounded-2xl shadow-xl p-8">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">
          🎬 Auto Demo Mode
        </h2>
        <p className="text-gray-600">
          Tonton demo otomatis untuk melihat semua jenis alert secara berurutan
        </p>
      </div>

      <div className="flex flex-col items-center space-y-4">
        {!isRunning ? (
          <button
            onClick={startAutoDemo}
            className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-semibold py-4 px-8 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
          >
            <div className="flex items-center space-x-2">
              <span className="text-xl">▶️</span>
              <span>Mulai Auto Demo</span>
            </div>
          </button>
        ) : (
          <div className="text-center">
            <div className="flex items-center justify-center space-x-2 mb-4">
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-green-600 font-semibold">Demo Berjalan...</span>
            </div>
            <div className="text-sm text-gray-500 mb-4">
              Alert {currentIndex + 1} dari {alertSequence.length}
            </div>
            <button
              onClick={stopAutoDemo}
              className="bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-6 rounded-lg transition-colors"
            >
              ⏹️ Stop Demo
            </button>
          </div>
        )}

        {/* Progress Bar */}
        {isRunning && (
          <div className="w-full max-w-md">
            <div className="bg-gray-200 rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full transition-all duration-500"
                style={{ width: `${((currentIndex + 1) / alertSequence.length) * 100}%` }}
              ></div>
            </div>
          </div>
        )}
      </div>

      <BearyAlert
        type={currentAlert.type}
        isOpen={currentAlert.isOpen}
        onClose={handleAlertClose}
        title={currentAlert.title}
        description={currentAlert.description}
        buttonText={currentAlert.buttonText}
        onButtonClick={handleAlertClose}
      />
    </div>
  )
}
