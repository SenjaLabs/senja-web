"use client"

import React, { useState } from "react"
import { BearyAlert, SuccessAlert, PendingAlert, FailedAlert } from "@/components/alert"
import { AutoDemo } from "./auto-demo"
import { BearyAnimation, MultipleBearyAnimation, BearyWithParticles } from "./beary-animation"

export default function AlertDemoPage() {
  const [alertState, setAlertState] = useState<{
    isOpen: boolean
    type: "success" | "pending" | "failed" | "info"
    title?: string
    description?: string
    buttonText?: string
  }>({
    isOpen: false,
    type: "success"
  })

  const [basicAlertState, setBasicAlertState] = useState<{
    success: boolean
    pending: boolean
    failed: boolean
  }>({
    success: false,
    pending: false,
    failed: false
  })

  const showBearyAlert = (
    type: "success" | "pending" | "failed" | "info",
    title?: string,
    description?: string,
    buttonText?: string
  ) => {
    setAlertState({
      isOpen: true,
      type,
      title,
      description,
      buttonText
    })
  }

  const hideBearyAlert = () => {
    setAlertState(prev => ({ ...prev, isOpen: false }))
  }

  const showBasicAlert = (type: "success" | "pending" | "failed") => {
    setBasicAlertState(prev => ({ ...prev, [type]: true }))
  }

  const hideBasicAlert = (type: "success" | "pending" | "failed") => {
    setBasicAlertState(prev => ({ ...prev, [type]: false }))
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-pink-50 to-purple-50 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-block p-4 bg-white rounded-full shadow-lg mb-6 relative">
            <BearyWithParticles />
          </div>
          <h1 className="text-4xl font-bold text-gradient-sunset mb-4">
            Beary Alert Components Demo
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Koleksi alert components yang lucu dan friendly menggunakan karakter Beary. 
            Klik tombol di bawah untuk melihat berbagai jenis alert dalam aksi!
          </p>
          <div className="mt-6 flex justify-center space-x-4">
            <div className="flex items-center space-x-2 bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span>Ready to Use</span>
            </div>
            <div className="flex items-center space-x-2 bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <span>TypeScript</span>
            </div>
            <div className="flex items-center space-x-2 bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm">
              <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
              <span>Responsive</span>
            </div>
          </div>
        </div>

        {/* Advanced BearyAlert Section */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              🎭 Advanced BearyAlert Component
            </h2>
            <p className="text-gray-600">
              Komponen alert yang paling fleksibel dengan konfigurasi otomatis berdasarkan type
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <button
              onClick={() => showBearyAlert("success")}
              className="group bg-gradient-to-r from-green-400 to-green-600 hover:from-green-500 hover:to-green-700 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
            >
              <div className="text-2xl mb-2">🎉</div>
              <div className="text-sm">Success Alert</div>
              <div className="text-xs opacity-90 mt-1">Transaksi Berhasil</div>
            </button>

            <button
              onClick={() => showBearyAlert("pending")}
              className="group bg-gradient-to-r from-yellow-400 to-yellow-600 hover:from-yellow-500 hover:to-yellow-700 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
            >
              <div className="text-2xl mb-2">⏳</div>
              <div className="text-sm">Pending Alert</div>
              <div className="text-xs opacity-90 mt-1">Sedang Memproses</div>
            </button>

            <button
              onClick={() => showBearyAlert("failed")}
              className="group bg-gradient-to-r from-red-400 to-red-600 hover:from-red-500 hover:to-red-700 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
            >
              <div className="text-2xl mb-2">❌</div>
              <div className="text-sm">Failed Alert</div>
              <div className="text-xs opacity-90 mt-1">Transaksi Gagal</div>
            </button>

            <button
              onClick={() => showBearyAlert(
                "info", 
                "Informasi Penting!", 
                "Ini adalah contoh alert info dengan custom title dan description yang lebih panjang untuk menunjukkan bagaimana text wrapping bekerja.",
                "Mengerti!"
              )}
              className="group bg-gradient-to-r from-blue-400 to-blue-600 hover:from-blue-500 hover:to-blue-700 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
            >
              <div className="text-2xl mb-2">ℹ️</div>
              <div className="text-sm">Info Alert</div>
              <div className="text-xs opacity-90 mt-1">Informasi</div>
            </button>
          </div>
        </div>

        {/* Basic Alert Components Section */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              🎨 Basic Alert Components
            </h2>
            <p className="text-gray-600">
              Komponen alert individual untuk kontrol yang lebih spesifik
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <button
                onClick={() => showBasicAlert("success")}
                className="w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg"
              >
                <div className="text-xl mb-2">✅</div>
                Success Alert
              </button>
              <p className="text-sm text-gray-500 mt-2">Alert untuk transaksi berhasil</p>
            </div>

            <div className="text-center">
              <button
                onClick={() => showBasicAlert("pending")}
                className="w-full bg-yellow-500 hover:bg-yellow-600 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg"
              >
                <div className="text-xl mb-2">⏳</div>
                Pending Alert
              </button>
              <p className="text-sm text-gray-500 mt-2">Alert untuk transaksi pending</p>
            </div>

            <div className="text-center">
              <button
                onClick={() => showBasicAlert("failed")}
                className="w-full bg-red-500 hover:bg-red-600 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg"
              >
                <div className="text-xl mb-2">❌</div>
                Failed Alert
              </button>
              <p className="text-sm text-gray-500 mt-2">Alert untuk transaksi gagal</p>
            </div>
          </div>
        </div>

        {/* Beary Animation Showcase */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              🎭 Animasi Beary
            </h2>
            <p className="text-gray-600">
              Lihat berbagai animasi lucu yang tersedia untuk Beary
            </p>
          </div>
          <MultipleBearyAnimation />
        </div>

        {/* Auto Demo Section */}
        <AutoDemo />

        {/* Code Example Section */}
        <div className="bg-gray-900 rounded-2xl shadow-xl p-8 mb-8">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-white mb-2">
              💻 Contoh Penggunaan
            </h2>
            <p className="text-gray-300">
              Cara mudah menggunakan BearyAlert dalam komponen Anda
            </p>
          </div>

          <div className="bg-gray-800 rounded-xl p-6 overflow-x-auto">
            <pre className="text-green-400 text-sm">
              <code>{`import { BearyAlert } from '@/components/alert'

function MyComponent() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      <button onClick={() => setIsOpen(true)}>
        Show Success Alert
      </button>
      
      <BearyAlert
        type="success"
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title="Transaksi Berhasil!"
        description="Pembayaran Anda telah diproses."
        buttonText="Oke, Terima Kasih!"
        onButtonClick={() => console.log('Success!')}
      />
    </>
  )
}`}</code>
            </pre>
          </div>
        </div>

        {/* Features Section */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              ✨ Fitur-Fitur Alert Components
            </h2>
            <p className="text-gray-600">
              Keunggulan dan fitur yang tersedia dalam Beary Alert Components
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="text-center p-6 bg-gradient-to-br from-green-50 to-green-100 rounded-xl">
              <div className="text-3xl mb-3">🎭</div>
              <h3 className="font-semibold text-gray-800 mb-2">4 Jenis Alert</h3>
              <p className="text-sm text-gray-600">Success, Pending, Failed, dan Info dengan desain yang konsisten</p>
            </div>

            <div className="text-center p-6 bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-xl">
              <div className="text-3xl mb-3">🎪</div>
              <h3 className="font-semibold text-gray-800 mb-2">Animasi Menarik</h3>
              <p className="text-sm text-gray-600">Bounce, shake, pulse, dan sparkle effects yang lucu</p>
            </div>

            <div className="text-center p-6 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl">
              <div className="text-3xl mb-3">🔧</div>
              <h3 className="font-semibold text-gray-800 mb-2">Reusable</h3>
              <p className="text-sm text-gray-600">Mudah digunakan di berbagai komponen aplikasi</p>
            </div>

            <div className="text-center p-6 bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl">
              <div className="text-3xl mb-3">📱</div>
              <h3 className="font-semibold text-gray-800 mb-2">Responsive</h3>
              <p className="text-sm text-gray-600">Tampil sempurna di desktop dan mobile</p>
            </div>

            <div className="text-center p-6 bg-gradient-to-br from-pink-50 to-pink-100 rounded-xl">
              <div className="text-3xl mb-3">🎯</div>
              <h3 className="font-semibold text-gray-800 mb-2">TypeScript</h3>
              <p className="text-sm text-gray-600">Full type safety dan IntelliSense support</p>
            </div>

            <div className="text-center p-6 bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl">
              <div className="text-3xl mb-3">🎨</div>
              <h3 className="font-semibold text-gray-800 mb-2">Customizable</h3>
              <p className="text-sm text-gray-600">Bisa disesuaikan title, description, dan button text</p>
            </div>
          </div>
        </div>

        {/* Advanced BearyAlert */}
        <BearyAlert
          type={alertState.type}
          isOpen={alertState.isOpen}
          onClose={hideBearyAlert}
          title={alertState.title}
          description={alertState.description}
          buttonText={alertState.buttonText}
          onButtonClick={() => {
            console.log(`${alertState.type} alert button clicked!`)
          }}
        />

        {/* Basic Alert Components */}
        <SuccessAlert
          isOpen={basicAlertState.success}
          onClose={() => hideBasicAlert("success")}
          title="Transaksi Berhasil!"
          description="Pembayaran Anda telah berhasil diproses. Terima kasih telah menggunakan layanan kami!"
          buttonText="Oke, Terima Kasih!"
          onButtonClick={() => console.log("Success button clicked!")}
        />

        <PendingAlert
          isOpen={basicAlertState.pending}
          onClose={() => hideBasicAlert("pending")}
          title="Transaksi Sedang Diproses"
          description="Mohon tunggu sebentar, transaksi Anda sedang diproses. Jangan tutup aplikasi ini ya!"
          buttonText="Oke, Saya Tunggu"
          onButtonClick={() => console.log("Pending button clicked!")}
        />

        <FailedAlert
          isOpen={basicAlertState.failed}
          onClose={() => hideBasicAlert("failed")}
          title="Ups, Ada Masalah!"
          description="Maaf, transaksi Anda gagal diproses. Silakan coba lagi atau hubungi customer service jika masalah berlanjut."
          buttonText="Coba Lagi"
          onButtonClick={() => console.log("Failed button clicked!")}
        />

        {/* Footer */}
        <div className="text-center mt-12 mb-8">
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <div className="text-4xl mb-4">🎉</div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">
              Siap Menggunakan Beary Alert Components!
            </h3>
            <p className="text-gray-600 mb-6">
              Alert components ini siap digunakan di seluruh aplikasi Anda. 
              Dapatkan pengalaman yang menyenangkan dan friendly untuk pengguna!
            </p>
            <div className="flex flex-wrap justify-center gap-4 text-sm text-gray-500">
              <span>📁 src/components/alert/</span>
              <span>•</span>
              <span>📖 README.md tersedia</span>
              <span>•</span>
              <span>🎯 TypeScript support</span>
              <span>•</span>
              <span>🎨 Tailwind CSS</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
