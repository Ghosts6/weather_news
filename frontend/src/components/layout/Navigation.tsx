import React from 'react';

interface NavigationProps {
  sections: string[];
  currentSection: number;
  onNavigate: (index: number) => void;
}

const Navigation: React.FC<NavigationProps> = ({ sections, currentSection, onNavigate }) => {
  return (
    <div className="fixed bottom-2 left-1/2 transform -translate-x-1/2 z-50">
      <div className="flex items-center justify-center gap-2 bg-gray-700/30 backdrop-blur-md border border-white/10 rounded-full px-6 py-1 shadow-lg">
        <button
          onClick={() => onNavigate(0)}
          className={`flex items-center justify-center transition-all duration-300 p-1 rounded-full
            ${currentSection === 0 ? '' : 'hover:scale-110'}`}
          aria-label="Go to Home section"
          aria-current={currentSection === 0 ? 'true' : 'false'}
        >
          <svg
            className={`w-5 h-5 ${currentSection === 0 ? 'text-blue-500' : 'text-white'}`}
            fill="currentColor"
            viewBox="0 0 24 24"
          >
            <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
          </svg>
        </button>

        {sections.slice(1).map((section, index) => ( 
          <button
            key={index + 1}
            onClick={() => onNavigate(index + 1)} 
            className={`transition-all duration-300 ${
              currentSection === index + 1 
                ? 'w-2 h-2 bg-white rounded-full'
                : 'w-2 h-2 bg-white/40 rounded-full hover:bg-white/60'
            }`}
            aria-label={`Go to section ${index + 1}`}
            aria-current={currentSection === index + 1 ? 'true' : 'false'}
          />
        ))}
      </div>
    </div>
  );
};

export default Navigation;