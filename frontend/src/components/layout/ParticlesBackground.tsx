import React, { useEffect } from 'react';

const ParticlesBackground: React.FC = () => {
  useEffect(() => {
    const particlesScript = document.createElement('script');
    particlesScript.src = 'https://cdn.jsdelivr.net/particles.js/2.0.0/particles.min.js';
    particlesScript.onload = () => {
      const modes = ['snowy', 'rainy', 'windy'];
      const mode = modes[Math.floor(Math.random() * modes.length)];
      let particleImage = '';
      switch (mode) {
        case 'snowy':
          particleImage = '/img/snow.png';
          break;
        case 'rainy':
          particleImage = '/img/rain.png';
          break;
        case 'windy':
          particleImage = '/img/wind.png';
          break;
        default:
          particleImage = '/img/snow.png';
      }

      // @ts-ignore
      window.particlesJS('particles-js', {
        particles: {
          number: {
            value: 150,
            density: {
              enable: true,
              value_area: 800,
            },
          },
          color: {
            value: '#ffffff',
          },
          shape: {
            type: 'image',
            stroke: {
              width: 0,
              color: '#000000',
            },
            image: {
              src: particleImage,
              width: 40,
              height: 40,
            },
          },
          opacity: {
            value: 0.7,
            random: true,
            anim: {
              enable: true,
              speed: 1,
              opacity_min: 0,
              sync: false,
            },
          },
          size: {
            value: 10,
            random: true,
            anim: {
              enable: true,
              speed: 3,
              size_min: 0,
              sync: false,
            },
          },
          line_linked: {
            enable: false,
          },
          move: {
            enable: true,
            speed: 1,
            direction: 'bottom',
            random: false,
            straight: false,
            out_mode: 'out',
            bounce: false,
            attract: {
              enable: false,
              rotateX: 600,
              rotateY: 1200,
            },
          },
        },
        interactivity: {
          detect_on: 'canvas',
          events: {
            onhover: {
              enable: false,
            },
            onclick: {
              enable: false,
            },
            resize: true,
          },
        },
        retina_detect: true,
      });
    };
    document.body.appendChild(particlesScript);
  }, []);

  return <div id="particles-js" style={{ position: 'absolute', width: '100%', height: '100%', zIndex: -1 }}></div>;
};

export default ParticlesBackground;
