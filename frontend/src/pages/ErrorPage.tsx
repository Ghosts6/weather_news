import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';

interface ErrorPageProps {
  code: number;
  message: string;
}

const ErrorPage: React.FC<ErrorPageProps> = ({ code, message }) => {
  useEffect(() => {
    const canvas = document.querySelector('canvas');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const letters = 'ABCDEFGHIJKLMNOPQRSTUVXYZ0123456789';
    const matrix = letters.split('');
    const fontSize = 12;
    const columns = Math.floor(canvas.width / fontSize);
    const drops: number[] = Array(columns).fill(1);

    const draw = () => {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = '#0F0'; // Green text
      ctx.font = `${fontSize}px monospace`;

      for (let i = 0; i < drops.length; i++) {
        const text = matrix[Math.floor(Math.random() * matrix.length)];
        ctx.fillText(text, i * fontSize, drops[i] * fontSize);

        if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) {
          drops[i] = 0;
        }
        drops[i]++;
      }
    };

    const interval = setInterval(draw, 40);

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      // Recalculate columns and reset drops on resize
      const newColumns = Math.floor(canvas.width / fontSize);
      drops.length = 0;
      for(let i = 0; i < newColumns; i++) {
        drops.push(1);
      }
    };

    window.addEventListener('resize', handleResize);

    return () => {
      clearInterval(interval);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <div className="bg-black absolute inset-0 overflow-hidden">
      <canvas className="fixed top-0 left-0 w-full h-full"></canvas>
      <div className="relative z-10 flex flex-col items-center justify-center h-full text-white text-center px-4">
        <div className="bg-black bg-opacity-50 backdrop-blur-sm p-8 rounded-lg border border-green-500/30">
          <h1 className="text-6xl md:text-8xl font-bold text-green-500" style={{ textShadow: '0 0 10px #0F0, 0 0 20px #0F0' }}>
            {code}
          </h1>
          <p className="text-xl md:text-2xl mt-4 font-light text-gray-300">
            {message}
          </p>
          <Link
            to="/"
            className="mt-8 inline-block bg-green-500 text-black font-bold py-3 px-6 rounded-md hover:bg-green-400 transition-colors duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-green-400 focus:ring-opacity-75"
          >
            Return to Home
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ErrorPage;
