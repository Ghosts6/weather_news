import React from 'react';

const LightModeBackground: React.FC = () => {
  return (
    <div className="fixed top-0 left-0 w-full h-full z-[-1] overflow-hidden pointer-events-none opacity-100 dark:opacity-0 transition-opacity duration-2000">
      {/* Radial Gradient */}
      <div className="absolute top-[15%] left-[10%] w-[500px] h-[500px] bg-radial-gradient-sky transform -translate-x-1/2 -translate-y-1/2"></div>

      {/* Sun */}
      <div className="sun-container absolute top-[15%] left-[10%]">
        <div className="sun">
          <div className="center"></div>
          <div className="ray r-1"></div>
          <div className="ray r-2"></div>
          <div className="ray r-3"></div>
          <div className="ray r-4"></div>
          <div className="ray r-5"></div>
          <div className="ray r-6"></div>
          <div className="ray r-7"></div>
          <div className="ray r-8"></div>
        </div>
      </div>

      {/* Clouds */}
      <div className="absolute top-[20%] left-[5%] cloud-container cloud1">
        <div className="cloud w-[200px]">
          <span className="left-front" />
          <span className="right-front" />
        </div>
      </div>
      <div className="absolute top-[18%] left-[18%] cloud-container cloud2">
        <div className="cloud w-[200px] transform scale-[0.8]">
          <span className="left-back" />
          <span className="right-back" />
        </div>
      </div>
      <div className="absolute top-[50%] left-[80%] cloud-container cloud3">
        <div className="cloud w-[200px] transform scale-[0.9]">
          <span className="left-front" />
          <span className="right-front" />
        </div>
      </div>
      <div className="absolute top-[80%] left-[25%] cloud-container cloud4">
        <div className="cloud w-[200px] transform scale-[0.7]">
          <span className="left-back" />
          <span className="right-back" />
        </div>
      </div>

      <style>{`
        .bg-radial-gradient-sky {
          background: radial-gradient(circle, rgba(125, 211, 252, 0.8) 0%, rgba(56, 189, 248, 0) 70%);
        }

        .sun-container {
          transform: translate(0, 0) scale(1);
          transition: transform 2s ease-in-out;
        }
        .dark .sun-container {
          transform: translate(-300%, 100%) scale(0.5);
        }

        .sun {
          position: relative;
          animation: rotate 4s linear infinite;
          --color: yellow;
          --scale: 0.5;
        }

        .center {
          height: calc(var(--scale) * 10em);
          width: calc(var(--scale) * 10em);
          background-color: var(--color);
          border-radius: 50%;
          box-shadow: 0 0 calc(var(--scale) * 3em) var(--color);
        }

        .ray {
          position: absolute;
          height: calc(var(--scale) * 3em);
          width: calc(var(--scale) * 0.5em);
          box-shadow: 0 0 calc(var(--scale) * 1em) var(--color);
          background-color: var(--color);
        }

        .r-1 { margin-left: calc(var(--scale) * 4.75em); margin-top: calc(var(--scale) * 1em); }
        .r-2 { margin-left: calc(var(--scale) * 12.25em); margin-top: calc(var(--scale) * -6.25em); transform: rotate(90deg); }
        .r-3 { margin-left: calc(var(--scale) * 4.75em); margin-top: calc(var(--scale) * -14em); }
        .r-4 { margin-left: calc(var(--scale) * -2.75em); margin-top: calc(var(--scale) * -6.25em); transform: rotate(90deg); }
        .r-5 { margin-left: calc(var(--scale) * -0.5em); margin-top: calc(var(--scale) * -1em); transform: rotate(45deg); }
        .r-6 { margin-left: calc(var(--scale) * 9.75em); margin-top: calc(var(--scale) * -1em); transform: rotate(-45deg); }
        .r-7 { margin-left: calc(var(--scale) * 10.25em); margin-top: calc(var(--scale) * -11.75em); transform: rotate(45deg); }
        .r-8 { margin-left: calc(var(--scale) * -0.5em); margin-top: calc(var(--scale) * -11.75em); transform: rotate(-45deg); }

        @keyframes rotate {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        .cloud-container { transition: transform 0.5s ease-in-out; }
        .cloud1 { animation: cloud-bob 12s infinite ease-in-out; }
        .cloud2 { animation: cloud-bob 15s infinite ease-in-out 2s; }
        .cloud3 { animation: cloud-bob 18s infinite ease-in-out 4s; }
        .cloud4 { animation: cloud-bob 21s infinite ease-in-out 6s; }

        .left-front, .right-front, .left-back, .right-back {
          background-color: #FFFFFF;
          display: inline-block;
          position: absolute;
        }
        .left-front { width: 65px; height: 65px; border-radius: 50% 50% 0 50%; top: 0; left: 30px; }
        .right-front { width: 45px; height: 45px; border-radius: 50% 50% 50% 0; top: 20px; left: 80px; }
        .left-back { width: 50px; height: 50px; border-radius: 50% 50% 0 50%; top: 0; left: 25px; }
        .right-back { width: 35px; height: 35px; border-radius: 50% 50% 50% 0; top: 15px; left: 65px; }
        
        @keyframes cloud-bob {
          0%, 100% { transform: translateY(0) translateX(0); }
          25% { transform: translateY(5px) translateX(10px); }
          50% { transform: translateY(0) translateX(20px); }
          75% { transform: translateY(-5px) translateX(10px); }
        }
      `}</style>
    </div>
  );
};

export default LightModeBackground;
