import React from "react";

interface LogoProps {
  size?: "sm" | "md" | "lg";
  withText?: boolean;
  className?: string;
}

const Logo: React.FC<LogoProps> = ({ 
  size = "md", 
  withText = true,
  className = "" 
}) => {
  const sizeMap = {
    sm: "w-8 h-8",
    md: "w-10 h-10",
    lg: "w-12 h-12"
  };

  const textSizeMap = {
    sm: "text-lg",
    md: "text-xl md:text-2xl",
    lg: "text-2xl md:text-3xl"
  };

  return (
    <div className={`flex items-center ${className}`}>
      <div className="mr-2">
        <svg className={sizeMap[size]} viewBox="0 0 50 50" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="25" cy="25" r="25" fill="hsl(var(--primary))" />
          <path d="M15 20C15 16.5 20 13 25 13C30 13 35 16.5 35 20C35 23.5 32 25 30 25H20C18 25 15 23.5 15 20Z" fill="hsl(var(--accent))" />
          <path d="M18 28C18 28 17 35 25 35C33 35 32 28 32 28" stroke="hsl(var(--secondary))" strokeWidth="2" />
        </svg>
      </div>
      {withText && (
        <div>
          <h1 className={`text-primary font-poppins font-bold ${textSizeMap[size]}`}>Annadaan Connect</h1>
          <p className="text-secondary text-xs md:text-sm font-medium">Community Food Sharing</p>
        </div>
      )}
    </div>
  );
};

export default Logo;
