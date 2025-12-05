import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

interface ErrorPageProps {
  code: number;
  message: string;
}

const ErrorPage: React.FC<ErrorPageProps> = ({ code, message }) => {
  const [glitchActive, setGlitchActive] = useState(false);

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
      ctx.fillStyle = '#0F0';
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
      const newColumns = Math.floor(canvas.width / fontSize);
      drops.length = 0;
      for(let i = 0; i < newColumns; i++) {
        drops.push(1);
      }
    };

    window.addEventListener('resize', handleResize);

    // Random glitch effect
    const glitchInterval = setInterval(() => {
      setGlitchActive(true);
      setTimeout(() => setGlitchActive(false), 200);
    }, 3000);

    return () => {
      clearInterval(interval);
      clearInterval(glitchInterval);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <div className="bg-black absolute inset-0 overflow-hidden">
      <canvas className="fixed top-0 left-0 w-full h-full"></canvas>
      
      <div className="fixed inset-0 pointer-events-none z-20 opacity-10">
        <div className="scanline"></div>
      </div>

      <div className="relative z-10 flex flex-col items-center justify-center h-full text-white text-center px-4">
        <div className="error-container max-w-2xl w-full bg-black/70 backdrop-blur-md p-12 rounded-2xl border-2 border-green-500/50 shadow-2xl relative overflow-hidden">
          <div className="corner-glow top-left"></div>
          <div className="corner-glow top-right"></div>
          <div className="corner-glow bottom-left"></div>
          <div className="corner-glow bottom-right"></div>

          {/* Error Code */}
          <div className="mb-6">
            <h1 
              className={`text-9xl md:text-[12rem] font-bold text-green-500 led-text ${glitchActive ? 'glitch' : ''}`}
              data-text={code}
            >
              {code}
            </h1>
          </div>

          <div className="terminal-window bg-black/50 border border-green-500/30 rounded-lg p-6 mb-8">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-3 h-3 rounded-full bg-red-500 animate-pulse"></div>
              <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
              <div className="w-3 h-3 rounded-full bg-green-500"></div>
              <span className="text-green-500 text-xs ml-2 font-mono">ERROR_LOG.txt</span>
            </div>
            <div className="text-left">
              <p className="text-xl md:text-2xl font-mono text-green-400">
                <span className="text-red-500">&gt;</span> {message}
              </p>
              <p className="text-sm text-green-500/60 font-mono mt-2">
                <span className="animate-pulse">_</span>
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/"
              className="group relative inline-flex items-center justify-center px-8 py-4 font-bold text-black bg-green-500 rounded-lg overflow-hidden transition-all duration-300 hover:bg-green-400 hover:scale-105 hover:shadow-[0_0_20px_rgba(0,255,0,0.5)] active:scale-95"
            >
              <span className="relative z-10 flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
                Return to Home
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-green-400 to-green-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </Link>

            <button
              onClick={() => window.history.back()}
              className="group relative inline-flex items-center justify-center px-8 py-4 font-bold text-green-500 bg-transparent border-2 border-green-500 rounded-lg overflow-hidden transition-all duration-300 hover:text-black hover:scale-105 hover:shadow-[0_0_20px_rgba(0,255,0,0.3)] active:scale-95"
            >
              <span className="relative z-10 flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Go Back
              </span>
              <div className="absolute inset-0 bg-green-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </button>
          </div>

          <div className="matrix-overlay"></div>
        </div>

        <p className="mt-8 text-green-500/50 text-sm font-mono">
          [SYSTEM] Connection lost to the mainframe...
        </p>
      </div>

      <style>{`
        @keyframes led-glow {
          0%, 100% {
            text-shadow: 
              0 0 10px #0F0,
              0 0 20px #0F0,
              0 0 30px #0F0,
              0 0 40px #0F0;
          }
          50% {
            text-shadow: 
              0 0 20px #0F0,
              0 0 30px #0F0,
              0 0 40px #0F0,
              0 0 50px #0F0,
              0 0 60px #0F0;
          }
        }

        @keyframes flicker {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.8; }
        }

        @keyframes scanline-move {
          0% { transform: translateY(-100%); }
          100% { transform: translateY(100%); }
        }

        @keyframes corner-pulse {
          0%, 100% { opacity: 0.3; }
          50% { opacity: 0.8; }
        }

        .led-text {
          animation: led-glow 3s ease-in-out infinite;
          font-family: 'Courier New', monospace;
          letter-spacing: 0.1em;
        }

        .glitch {
          animation: glitch 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94) both;
        }

        @keyframes glitch {
          0% {
            transform: translate(0);
          }
          20% {
            transform: translate(-2px, 2px);
          }
          40% {
            transform: translate(-2px, -2px);
          }
          60% {
            transform: translate(2px, 2px);
          }
          80% {
            transform: translate(2px, -2px);
          }
          100% {
            transform: translate(0);
          }
        }

        .scanline {
          width: 100%;
          height: 100px;
          background: linear-gradient(
            to bottom,
            transparent 0%,
            rgba(0, 255, 0, 0.1) 50%,
            transparent 100%
          );
          animation: scanline-move 6s linear infinite;
        }

        .corner-glow {
          position: absolute;
          width: 30px;
          height: 30px;
          background: radial-gradient(circle, rgba(0, 255, 0, 0.8) 0%, transparent 70%);
          animation: corner-pulse 2s ease-in-out infinite;
        }

        .corner-glow.top-left {
          top: -5px;
          left: -5px;
        }

        .corner-glow.top-right {
          top: -5px;
          right: -5px;
        }

        .corner-glow.bottom-left {
          bottom: -5px;
          left: -5px;
        }

        .corner-glow.bottom-right {
          bottom: -5px;
          right: -5px;
        }

        .error-container {
          animation: flicker 3s ease-in-out infinite;
        }

        .error-container:hover .matrix-overlay {
          opacity: 0.1;
        }

        .matrix-overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(
            180deg,
            transparent 0%,
            rgba(0, 255, 0, 0.05) 50%,
            transparent 100%
          );
          opacity: 0;
          transition: opacity 0.3s ease;
          pointer-events: none;
        }

        .terminal-window {
          position: relative;
        }

        ::-webkit-scrollbar {
          width: 8px;
        }

        ::-webkit-scrollbar-track {
          background: #000;
        }

        ::-webkit-scrollbar-thumb {
          background: #0F0;
          border-radius: 4px;
        }

        ::-webkit-scrollbar-thumb:hover {
          background: #0F0;
          box-shadow: 0 0 10px #0F0;
        }
      `}</style>
    </div>
  );
};

export default ErrorPage;