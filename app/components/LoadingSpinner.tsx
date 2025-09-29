"use client";

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  text?: string;
  className?: string;
}

export default function LoadingSpinner({ 
  size = 'md', 
  text = 'Loading...', 
  className = '' 
}: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'w-6 h-6',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16'
  };

  const textSizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg',
    xl: 'text-xl'
  };

  return (
    <div className={`flex flex-col items-center justify-center ${className}`}>
      {/* Main Spinner */}
      <div className="relative">
        {/* Outer Ring */}
        <div className={`${sizeClasses[size]} border-4 border-gray-200 rounded-full`}></div>
        
        {/* Animated Ring */}
        <div className={`${sizeClasses[size]} border-4 border-transparent border-t-[#FFBF00] border-r-[#FFBF00] rounded-full absolute top-0 left-0 animate-spin`}></div>
        
        {/* Inner Pulse */}
        <div className={`${sizeClasses[size]} absolute top-0 left-0 flex items-center justify-center`}>
          <div className="w-2 h-2 bg-[#FFBF00] rounded-full animate-pulse"></div>
        </div>
      </div>
      
      {/* Loading Text */}
      {text && (
        <div className={`mt-4 text-gray-600 font-medium ${textSizeClasses[size]} animate-pulse`}>
          {text}
        </div>
      )}
    </div>
  );
}

// Full Screen Loading Component
export function FullScreenLoading({ text = 'Loading...' }: { text?: string }) {
  return (
    <div className="fixed inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-2xl p-8 border border-gray-200">
        <LoadingSpinner size="xl" text={text} />
      </div>
    </div>
  );
}

// Inline Loading Component
export function InlineLoading({ text = 'Loading...' }: { text?: string }) {
  return (
    <div className="flex items-center justify-center py-8">
      <LoadingSpinner size="md" text={text} />
    </div>
  );
}

// Button Loading Component
export function ButtonLoading({ text = 'Loading...' }: { text?: string }) {
  return (
    <div className="flex items-center justify-center gap-3">
      <LoadingSpinner size="sm" text="" />
      <span className="text-sm font-medium text-gray-600">{text}</span>
    </div>
  );
}

// Card Loading Component
export function CardLoading({ text = 'Loading...' }: { text?: string }) {
  return (
    <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-100">
      <LoadingSpinner size="lg" text={text} />
    </div>
  );
}
