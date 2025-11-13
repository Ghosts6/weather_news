import React from 'react';
import LightModeBackground from './LightModeBackground';
import DarkModeBackground from './DarkModeBackground';

const ParticlesBackground: React.FC = () => {
  return (
    <>
      <LightModeBackground />
      <DarkModeBackground />
    </>
  );
};

export default ParticlesBackground;
