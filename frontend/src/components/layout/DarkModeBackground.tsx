import React, { useMemo } from 'react';

const DarkModeBackground: React.FC = () => {
  const starBoxShadow = useMemo(() => {
    const numStars = 300;
    return Array.from({ length: numStars })
      .map(() => `${Math.random() * 1920}px ${Math.random() * 1000}px #fff`)
      .join(', ');
  }, []);

  const meteorData = useMemo(() => {
    const numMeteors = 8;
    return Array.from({ length: numMeteors }).map(() => {
      const duration = Math.random() * 7 + 3;
      const delay = -(Math.random() * duration);

      return {
        top: `${Math.random() * 250 + 50}px`,
        left: `${Math.random() * 90 + 9}%`,
        duration: `${duration}s`,
        delay: `${delay}s`,
      };
    });
  }, []);


  return (
    <div className="fixed inset-0 pointer-events-none transition-opacity duration-[2000ms] opacity-0 dark:opacity-100 z-[1]">

      {/* Moon */}
      <div className="moon-container absolute top-[15%] left-[10%] z-10">
        <div className="relative w-[120px] h-[120px] rounded-full bg-gradient-to-br from-[#f0f0f0] to-[#e8e8e8] animate-moonGlow">

          <div className="absolute left-[22px] top-[30px] w-[22px] h-[22px] rounded-full bg-[#c8c8c8] opacity-40 shadow-inner" />
          <div className="absolute left-[60px] top-[65px] w-[30px] h-[30px] rounded-full bg-[#c8c8c8] opacity-40 shadow-inner" />
          <div className="absolute left-[30px] top-[80px] w-[18px] h-[18px] rounded-full bg-[#c8c8c8] opacity-40 shadow-inner" />

        </div>
      </div>

      {/* Starfield */}
      <div className="w-[1px] h-[1px] bg-transparent" style={{ boxShadow: starBoxShadow }} />

      {/* Meteors */}
      {meteorData.map((m, i) => (
        <div
          key={i}
          className="meteor"
          style={{
            top: m.top,
            left: m.left,
            animationDuration: m.duration,
            animationDelay: m.delay,
          }}
        />
      ))}

      <style>{`
        .moon-container {
          transform: translate(-300%, 100%) scale(0.5);
          transition: transform 2s ease-in-out;
        }
        .dark .moon-container {
          transform: translate(0, 0) scale(1);
        }

        @keyframes moonGlow {
          0%, 100% {
            box-shadow: 0 0 40px rgba(240, 240, 240, 0.6),
                        inset -5px -5px 15px rgba(0, 0, 0, 0.2);
          }
          50% {
            box-shadow: 0 0 70px rgba(255, 255, 255, 0.9),
                        inset -5px -5px 15px rgba(0, 0, 0, 0.2);
          }
        }

        .animate-moonGlow {
          animation: moonGlow 4s ease-in-out infinite;
        }

        .meteor {
          position: absolute;
          width: 300px;
          height: 1px;
          transform: rotate(-45deg);
          background-image: linear-gradient(to right, #fff, rgba(255,255,255,0));
          animation-name: meteor;
          animation-timing-function: linear;
          animation-iteration-count: infinite;
        }

        .meteor:before {
          content: "";
          position: absolute;
          width: 4px;
          height: 5px;
          border-radius: 50%;
          margin-top: -2px;
          background: rgba(255,255,255,.7);
          box-shadow: 0 0 15px 3px #fff;
        }

        @keyframes meteor {
          0% {
            opacity: 1;
            margin-top: -300px;
            margin-right: -300px;
          }
          12% { opacity: 0; }
          15% {
            margin-top: 300px;
            margin-left: -600px;
            opacity: 0;
          }
          100% { opacity: 0; }
        }
      `}</style>
    </div>
  );
};

export default DarkModeBackground;