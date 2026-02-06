import React from 'react';


const WavyBackground = () => {
    return (
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="w-[200%] h-[200%] bg-gradient-to-r from-blue-900 via-green-500 to-yellow-500 animate-wave opacity-90" />

      </div>
    )
  }

  export default WavyBackground;
  