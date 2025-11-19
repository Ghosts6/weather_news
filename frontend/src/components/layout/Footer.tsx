import React from 'react';

interface FooterProps {
  navigation: React.ReactNode;
}

const Footer: React.FC<FooterProps> = ({ navigation }) => {
  return (
    <footer className="fixed bottom-0 left-0 w-full h-14 p-4 flex items-center justify-between px-4 transition-all ease-in-out z-10">
      <div className="flex-1 text-left">
        <p className="text-white">
          Kiarash B
        </p>
      </div>
      <div className="flex-none">
        {navigation}
      </div>
      <div className="flex-1 text-right">
        <p className="text-white">
          © {new Date().getFullYear()} Weather News
        </p>
      </div>
    </footer>
  );
};

export default Footer;
