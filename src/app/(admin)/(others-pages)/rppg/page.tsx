
// src/app/rppg/page.tsx

import React from 'react';

import VideoRecorder from './components/VideoRecorder';


const RPPGPage = () => {
  return (
    <div >
<iframe 
  src="https://jnru67rsxyljlxpce4ag5q.streamlit.app" 
  allow="camera" 
  width="100%" 
  height="600">
  Tu navegador no soporta iframes.
</iframe>   

    </div>

  );
};

export default RPPGPage;

