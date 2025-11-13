import React, { useCallback } from "react";
import Particles from "@tsparticles/react";
import type { Engine } from "@tsparticles/engine";
import { loadSlim } from "@tsparticles/slim"; 
import type { ISourceOptions } from "@tsparticles/engine";

const DarkModeBackground: React.FC = () => {
  const particlesInit = useCallback(async (engine: Engine) => {
    await loadSlim(engine);
  }, []);

  const particlesLoaded = useCallback(async (container: any) => {
    console.log("Particles loaded successfully!", container);
  }, []);

  const options: ISourceOptions = {
    fullScreen: {
      enable: false,
      zIndex: 0,
    },
    background: {
      color: {
        value: "transparent",
      },
    },
    fpsLimit: 120,
    interactivity: {
      events: {
        onClick: {
          enable: false,
        },
        onHover: {
          enable: false,
        },
        resize: {
          enable: true,
          delay: 0.5,
        },
      },
    },
    particles: {
      color: {
        value: "#ffffff",
      },
      move: {
        enable: false,
      },
      number: {
        density: {
          enable: true,
          width: 1920,
          height: 1080,
        },
        value: 200,
      },
      opacity: {
        value: {
          min: 0.3,
          max: 1,
        },
        animation: {
          enable: true,
          speed: 1,
          sync: false,
        },
      },
      shape: {
        type: "circle",
      },
      size: {
        value: {
          min: 1,
          max: 3,
        },
      },
    },
    detectRetina: true,
  };

  // Shooting star configuration
  const shootingStarOptions: ISourceOptions = {
    fullScreen: {
      enable: false,
      zIndex: 1,
    },
    background: {
      color: {
        value: "transparent",
      },
    },
    fpsLimit: 120,
    particles: {
      number: {
        value: 0,
      },
      color: {
        value: "#ffffff",
      },
      shape: {
        type: "circle",
      },
      opacity: {
        value: 1,
      },
      size: {
        value: 3,
      },
      move: {
        enable: true,
        speed: 20,
        direction: "bottom-right",
        straight: true,
        outModes: {
          default: "destroy",
        },
      },
      life: {
        duration: {
          value: 2,
        },
      },
    },
    emitters: {
      direction: "bottom-right",
      rate: {
        delay: 3,
        quantity: 1,
      },
      size: {
        width: 0,
        height: 0,
      },
      position: {
        x: 0,
        y: 0,
      },
    },
    detectRetina: true,
  };

  return (
    <div 
      className="fixed inset-0 pointer-events-none opacity-0 dark:opacity-100 transition-opacity duration-2000" 
      style={{ 
        zIndex: 1,
        width: '100vw',
        height: '100vh',
      }}
    >
      {/* Stars */}
      <div style={{ position: 'absolute', width: '100%', height: '100%', zIndex: 1 }}>
        <Particles 
          id="tsparticles-stars" 
          init={particlesInit}
          loaded={particlesLoaded}
          options={options}
        />
      </div>

      {/* Shooting Stars */}
      <div style={{ position: 'absolute', width: '100%', height: '100%', zIndex: 2 }}>
        <Particles 
          id="tsparticles-shooting" 
          init={particlesInit}
          loaded={particlesLoaded}
          options={shootingStarOptions}
        />
      </div>

      {/* Moon with Craters */}
      <div 
        className="moon-container absolute top-[15%] left-[10%]" 
        style={{ zIndex: 3 }}
      >
        <div className="relative w-[120px] h-[120px] bg-gradient-to-br from-[#f0f0f0] to-[#e8e8e8] rounded-full moon-glow">
          <div className="absolute bg-[#c8c8c8] opacity-[0.4] rounded-full shadow-inner left-[22px] top-[30px] w-[22px] h-[22px]" />
          <div className="absolute bg-[#c8c8c8] opacity-[0.4] rounded-full shadow-inner left-[60px] top-[65px] w-[30px] h-[30px]" />
          <div className="absolute bg-[#c8c8c8] opacity-[0.4] rounded-full shadow-inner left-[30px] top-[80px] w-[18px] h-[18px]" />
        </div>
      </div>

      {/* Fallback stars if particles don't load */}
      <div className="fallback-stars" style={{ position: 'absolute', width: '100%', height: '100%', zIndex: 0 }}>
        {Array.from({ length: 50 }).map((_, i) => (
          <div
            key={i}
            className="star"
            style={{
              position: 'absolute',
              width: '2px',
              height: '2px',
              backgroundColor: 'white',
              borderRadius: '50%',
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              opacity: Math.random() * 0.5 + 0.3,
              animation: `twinkle ${Math.random() * 3 + 2}s infinite`,
            }}
          />
        ))}
      </div>

      <style>{`
        .moon-container {
          transform: translate(-300%, 100%) scale(0.5);
          transition: transform 2s ease-in-out;
        }
        .dark .moon-container {
          transform: translate(0, 0) scale(1);
        }

        .moon-glow {
          animation: moonGlow 4s ease-in-out infinite;
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

        @keyframes twinkle {
          0%, 100% {
            opacity: 0.3;
          }
          50% {
            opacity: 1;
          }
        }

        #tsparticles-stars canvas,
        #tsparticles-shooting canvas {
          display: block !important;
          position: absolute !important;
          top: 0 !important;
          left: 0 !important;
          width: 100% !important;
          height: 100% !important;
        }

        /* Make sure particles container is visible */
        #tsparticles-stars,
        #tsparticles-shooting {
          position: absolute !important;
          top: 0 !important;
          left: 0 !important;
          width: 100% !important;
          height: 100% !important;
        }
      `}</style>
    </div>
  );
};

export default DarkModeBackground;