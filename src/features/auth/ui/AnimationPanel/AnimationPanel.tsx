import React from 'react';
import { HexParticles } from '@/features/auth/ui/HexParticles/HexParticles';
import './AnimationPanel.css';

import letraS from '@/assets/WordS.png';
import letraG from '@/assets/WordG.png';
import letraI from '@/assets/Wordi.png';

export function AnimationPanel() {
  return (
    <>
      <HexParticles />
      <div className="anim-bg" />
      <div className="anim-container">
        <div className="anim-logo-custom">
          <img src={letraS} alt="S" className="anim-letter" />
          <img src={letraG} alt="G" className="anim-letter" />
          <img src={letraI} alt="I" className="anim-letter" />
        </div>
      </div>
    </>
  );
}
