import React from 'react';

const Button = ({
  children,
  onClick,
  type = 'button',
  variant = 'primary',
  fullWidth = true,
  className = '',
  disabled = false,
}) => {
  const baseStyles = 'px-6 py-3 rounded-full font-medium transition duration-300';
  const variantStyles = {
    primary: 'bg-[#8D4087] text-white hover:opacity-90 ',
    secondary: 'border-2 border-[#8D4087] text-[#8D4087] hover:bg-purple-50',
    link: 'text-[#8D4087] hover:text-[#8D4087] bg-transparent'
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${baseStyles} ${variantStyles[variant]} ${fullWidth ? 'w-full' : ''} ${className} ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
    >
      {children}
    </button>
  );
};

export default Button; 
