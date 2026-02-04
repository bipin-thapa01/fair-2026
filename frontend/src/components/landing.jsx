import React from 'react'
import landingVid from '../assets/landing.mp4'

export default function LandingAnim() {
  return (
    <div style={{ position: 'relative', width: '100%', height: 'auto' }}>
      <video
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
        style={{
          width: '100%',
          height: 'auto',
          objectFit: 'cover',
          display: 'block'
        }}
      >
        <source src={landingVid} type="video/mp4" />
        Your browser does not support the video tag.
      </video>

      {/* Gradient overlay */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(180deg, rgba(2,44,51,0.48), rgba(2,44,51,0.2))'
        }}
      />

      {/* Content overlay */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          zIndex: 2,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'column',
          gap: 24,
          width: '90%',
          maxWidth: 1100,
          margin: '0 auto'
        }}
      >
        {/* Hero text goes here */}
      </div>
    </div>
  )
}
