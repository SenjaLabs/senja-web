"use client"

import React from "react"
import Image from "next/image"

/**
 * Komponen animasi Beary yang lucu untuk hiasan halaman demo
 */
export function BearyAnimation() {
  return (
    <div className="relative">
      {/* Floating Beary */}
      <div className="absolute -top-4 -right-4 animate-float">
        <Image
          src="/beary/beary.png"
          alt="Floating Beary"
          width={40}
          height={40}
          className="opacity-60"
        />
      </div>
      
      {/* Sparkles */}
      <div className="absolute -top-2 -left-2 w-2 h-2 bg-yellow-400 rounded-full animate-sparkle"></div>
      <div className="absolute top-1 -right-1 w-1.5 h-1.5 bg-yellow-300 rounded-full animate-sparkle animation-delay-2000"></div>
      <div className="absolute -bottom-1 left-1 w-1 h-1 bg-yellow-400 rounded-full animate-sparkle animation-delay-4000"></div>
    </div>
  )
}

/**
 * Komponen untuk menampilkan multiple Beary dengan animasi berbeda
 */
export function MultipleBearyAnimation() {
  return (
    <div className="flex justify-center items-center space-x-4 py-8">
      <div className="animate-happy-bounce">
        <Image
          src="/beary/user-success.png"
          alt="Happy Beary"
          width={60}
          height={60}
        />
      </div>
      
      <div className="animate-float">
        <Image
          src="/beary/beary.png"
          alt="Floating Beary"
          width={60}
          height={60}
        />
      </div>
      
      <div className="animate-wiggle">
        <Image
          src="/beary/user-profil.png"
          alt="Wiggling Beary"
          width={60}
          height={60}
        />
      </div>
    </div>
  )
}

/**
 * Komponen untuk menampilkan Beary dengan efek partikel
 */
export function BearyWithParticles() {
  return (
    <div className="relative inline-block">
      <div className="relative">
        <Image
          src="/beary/beary.png"
          alt="Beary with Particles"
          width={80}
          height={80}
          className="animate-happy-bounce"
        />
        
        {/* Particle effects */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/2 w-1 h-1 bg-yellow-400 rounded-full animate-sparkle"></div>
          <div className="absolute top-1/4 left-0 w-0.5 h-0.5 bg-pink-400 rounded-full animate-sparkle animation-delay-2000"></div>
          <div className="absolute top-1/2 right-0 w-0.5 h-0.5 bg-blue-400 rounded-full animate-sparkle animation-delay-4000"></div>
          <div className="absolute bottom-0 left-1/4 w-1 h-1 bg-green-400 rounded-full animate-sparkle animation-delay-2000"></div>
          <div className="absolute bottom-1/4 right-1/4 w-0.5 h-0.5 bg-purple-400 rounded-full animate-sparkle"></div>
        </div>
      </div>
    </div>
  )
}
