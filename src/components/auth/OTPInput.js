import React, { useState, useRef, useEffect } from 'react';

const OTPInput = ({ length = 4, onComplete, onChange: onChangeProp, disabled = false }) => {
  const [otp, setOtp] = useState(new Array(length).fill(''));
  const inputs = useRef([]);

  useEffect(() => {
    if (inputs.current[0]) {
      inputs.current[0].focus();
    }
  }, []);

  const handleChange = (e, index) => {
    const value = e.target.value;
    if (value && isNaN(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value ? value.substring(value.length - 1) : '';
    setOtp(newOtp);

    const combinedOtp = newOtp.join('');
    if (onChangeProp) {
      onChangeProp(combinedOtp);
    }

    if (combinedOtp.length === length && onComplete) {
      onComplete(combinedOtp);
    }

    if (value && index < length - 1) {
      inputs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === 'Backspace') {
      if (!otp[index] && index > 0) {
        const newOtp = [...otp];
        newOtp[index - 1] = '';
        setOtp(newOtp);
        if (onChangeProp) onChangeProp(newOtp.join(''));
        inputs.current[index - 1]?.focus();
      } else if (otp[index]) {
        const newOtp = [...otp];
        newOtp[index] = '';
        setOtp(newOtp);
        if (onChangeProp) onChangeProp(newOtp.join(''));
      }
    } else if (e.key === 'ArrowLeft' && index > 0) {
      inputs.current[index - 1]?.focus();
    } else if (e.key === 'ArrowRight' && index < length - 1) {
      inputs.current[index + 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text/plain').trim().slice(0, length);
    if (!/^\d+$/.test(pastedData)) return;

    const newOtp = [...otp];
    for (let i = 0; i < pastedData.length; i++) {
      newOtp[i] = pastedData[i];
    }
    setOtp(newOtp);
    if (onChangeProp) onChangeProp(newOtp.join(''));

    if (pastedData.length === length && onComplete) {
      onComplete(pastedData);
    }

    const nextIndex = Math.min(pastedData.length, length - 1);
    inputs.current[nextIndex]?.focus();
  };

  return (
    <div className="flex justify-center items-center gap-2.5 sm:gap-4 my-6">
      {otp.map((digit, index) => (
        <input
          key={index}
          ref={(el) => (inputs.current[index] = el)}
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          maxLength={1}
          value={digit}
          onChange={(e) => handleChange(e, index)}
          onKeyDown={(e) => handleKeyDown(e, index)}
          onPaste={handlePaste}
          disabled={disabled}
          className={`
            w-12 h-12 sm:w-14 sm:h-14 text-center text-xl sm:text-2xl font-bold
            border-2 rounded-full transition-all duration-150 outline-none
            ${digit ? 'border-[#843A7F] text-[#843A7F] bg-purple-50/20' : 'border-[#843A7F]/60 text-gray-800 bg-white'}
            focus:border-[#843A7F] focus:ring-4 focus:ring-[#843A7F]/15
            disabled:opacity-50 disabled:cursor-not-allowed shadow-sm
          `}
        />
      ))}
    </div>
  );
};

export default OTPInput;
