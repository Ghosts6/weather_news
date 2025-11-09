import React from 'react';

interface NavigationProps {
  sections: string[];
  currentSection: number;
  onNavigate: (index: number) => void;
}

const Navigation: React.FC<NavigationProps> = ({ sections, currentSection, onNavigate }) => {
  return (
    <div className="fixed right-4 top-1/2 transform -translate-y-1/2 flex flex-col gap-4">
      {sections.map((section, index) => (
        <button
          key={index}
          onClick={() => onNavigate(index)}
          className={`w-3 h-3 rounded-full ${currentSection === index ? 'bg-white' : 'bg-gray-500'}`}
          aria-label={`Go to section ${section}`}
        />
      ))}
    </div>
  );
};

export default Navigation;
