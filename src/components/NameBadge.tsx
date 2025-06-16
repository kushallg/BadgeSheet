
import React from 'react';

interface NameBadgeProps {
  name: string;
  color?: string;
}

const NameBadge: React.FC<NameBadgeProps> = ({ name, color = '#F15025' }) => {
  return (
    <div className="name-badge bg-gradient-to-br from-blue-50 to-white border-2 border-blue-200 rounded-xl shadow-lg overflow-hidden">
      {/* Back to original larger dimensions: 336px x 240px */}
      <div className="w-84 h-60 relative">
        {/* Header with decorative border */}
        <div 
          className="h-16 relative"
          style={{ 
            background: `linear-gradient(to right, ${color}, ${color}dd)` 
          }}
        >
          <div className="absolute inset-0 bg-white/10"></div>
          <div className="flex items-center justify-center h-full">
            <div className="text-white text-sm font-bold tracking-widest uppercase">
              HELLO MY NAME IS
            </div>
          </div>
          {/* Decorative corner elements */}
          <div className="absolute top-0 left-0 w-4 h-4 border-l-4 border-t-4 border-white/30"></div>
          <div className="absolute top-0 right-0 w-4 h-4 border-r-4 border-t-4 border-white/30"></div>
        </div>
        
        {/* Main name area */}
        <div className="flex-1 flex items-center justify-center px-6 py-8 bg-white relative min-h-[140px]">
          {/* Background pattern */}
          <div className="absolute inset-0 opacity-5">
            <div className="w-full h-full bg-gradient-to-br from-blue-100 to-transparent"></div>
          </div>
          
          {/* Name text */}
          <div className="relative z-10 text-center">
            <div className="text-2xl font-bold text-gray-800 leading-tight break-words max-w-full">
              {name}
            </div>
          </div>
          
          {/* Decorative side borders */}
          <div 
            className="absolute left-0 top-4 bottom-4 w-1 rounded-full"
            style={{ 
              background: `linear-gradient(to bottom, ${color}80, ${color})` 
            }}
          ></div>
          <div 
            className="absolute right-0 top-4 bottom-4 w-1 rounded-full"
            style={{ 
              background: `linear-gradient(to bottom, ${color}80, ${color})` 
            }}
          ></div>
        </div>
        
        {/* Footer */}
        <div className="bg-gray-50 border-t border-gray-200 h-10 flex items-center justify-center">
          <div className="text-sm text-gray-500 font-medium tracking-wider uppercase">
            Event Badge
          </div>
        </div>
        
        {/* Decorative corner cuts */}
        <div className="absolute bottom-0 left-0 w-0 h-0 border-l-6 border-b-6 border-l-transparent border-b-gray-50"></div>
        <div className="absolute bottom-0 right-0 w-0 h-0 border-r-6 border-b-6 border-r-transparent border-b-gray-50"></div>
      </div>
    </div>
  );
};

export default NameBadge;
