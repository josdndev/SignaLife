
// src/app/rppg/page.tsx

import React from 'react';

import VideoRecorder from './components/VideoRecorder';


const RPPGPage = () => {
  return (
    <div >
<iframe
  src="https://rppg-1-dk5z.vercel.app/"
  allow="camera; microphone"
  width="100%"
  height="600">
  Tu navegador no soporta iframes.
</iframe>

    </div>

  );
};

export default RPPGPage;
