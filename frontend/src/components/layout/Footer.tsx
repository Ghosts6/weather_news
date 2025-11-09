import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="w-full h-14 flex items-center justify-center px-4 transition-all ease-in-out relative">
      <p className="text-white">
        © {new Date().getFullYear()} Weather News. All Rights Reserved.
      </p>
    </footer>
  );
};

export default Footer;
