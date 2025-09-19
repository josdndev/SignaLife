"use client";

import React, { useRef, useState, useEffect } from 'react';

const VideoRecorder = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [recording, setRecording] = useState(false);
  const [progress, setProgress] = useState(0);
  const [rPPGResults, setRPPGResults] = useState(null);

  useEffect(() => {
    let intervalId: NodeJS.Timeout;

    const getVideo = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { width: 640, height: 480 },
        });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (err) {
        console.error("Error accessing webcam: ", err);
      }
    };

    getVideo();

    if (recording) {
      setProgress(0);
      intervalId = setInterval(() => {
        setProgress((prevProgress) => {
          const newProgress = prevProgress + (100 / 30);
          if (newProgress >= 100) {
            clearInterval(intervalId);
            setRecording(false);

            // Process and send the video to the backend
            if (videoRef.current) {
              videoRef.current.pause();
              const stream = videoRef.current.srcObject as MediaStream;
              const mediaRecorder = new MediaRecorder(stream);
              let chunks: BlobPart[] = [];

              mediaRecorder.ondataavailable = (e) => {
                chunks.push(e.data);
              };

              mediaRecorder.onstop = async () => {
                const blob = new Blob(chunks, { type: 'video/webm' });
                const formData = new FormData();
                formData.append('file', blob, 'recording.webm');

                try {
                  const response = await fetch('/rppg/', {
                    method: 'POST',
                    body: formData,
                  });

                  if (response.ok) {
                    const contentType = response.headers.get("content-type");
                    if (contentType && contentType.includes("application/json")) {
                      try {
                        const data = await response.json();
                        setRPPGResults(data);
                      } catch (error) {
                        console.error("Error parsing JSON: ", error);
                        setRPPGResults("Error parsing JSON from response");
                      }
                    } else {
                      console.error("Response is not JSON");
                      setRPPGResults("Response from server is not JSON");
                    }
                  } else {
                    console.error("Error sending video: ", response.status);
                    setRPPGResults(`Error: ${response.status}`);
                  }
                } catch (error) {
                  console.error("Error sending video: ", error);
                  setRPPGResults("Error sending video to server");
                }
              };

              mediaRecorder.start();
              setTimeout(() => {
                mediaRecorder.stop();
              }, 30000);
            }

            return 100;
          }
          return newProgress;
        });
      }, 1000);
    } else {
      clearInterval(intervalId);
    }

    return () => clearInterval(intervalId);
  }, [recording, videoRef]);

  const startAnalysis = () => {
    setRecording(true);
    setRPPGResults(null); // Clear previous results
  };

  const containerStyle = {
    display: 'flex',
    padding: '20px',
    fontFamily: 'sans-serif',
  };

  const videoStyle = {
    width: '100%',
    maxWidth: '640px',
    backgroundColor: '#000',
    borderRadius: '8px',
  };

  const resultsStyle = {
    marginLeft: '30px',
    width: '100%',
    maxWidth: '400px',
    padding: '20px',
    backgroundColor: '#f9f9f9',
    borderRadius: '8px',
  };

  const progressStyle = {
    width: '100%',
    height: '10px',
    borderRadius: '5px',
    backgroundColor: '#eee',
    overflow: 'hidden',
    marginTop: '10px',
  };

  const progressBarInnerStyle = {
    height: '100%',
    backgroundColor: '#29ABE2',
    width: `${progress}%`,
  };

  const buttonStyle = {
    backgroundColor: '#29ABE2',
    color: 'white',
    padding: '10px 20px',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    marginTop: '10px',
  };

   const resultItemStyle = {
        fontSize: '16px',
        marginBottom: '8px',
   }

    const headerStyle = {
        fontSize: '1.5rem',
        fontWeight: 'bold',
        marginBottom: '15px',
    }

  return (
    <div style={containerStyle}>
      {/* Camera View */}
      <div style={{ width: '50%' }}>
        <h2>Video Recorder</h2>
        <video ref={videoRef} width="100%" height="auto" autoPlay muted style={videoStyle} />
      </div>

      {/* rPPG Data and Results */}
      <div style={resultsStyle}>
        <h2 style={headerStyle}>rPPG Data and Results</h2>

        {/* Progress Bar */}
        <div style={progressStyle}>
          <div style={progressBarInnerStyle}></div>
        </div>

        {/* Start Analysis Button */}
        <div>
          {!recording ? (
            <button onClick={startAnalysis} style={buttonStyle}>Start Analysis</button>
          ) : (
            <p>Analyzing...</p>
          )}
        </div>

        {/* rPPG Results */}
        {rPPGResults && (
          <div>
            <h3>Results:</h3>
            {typeof rPPGResults === 'object' && rPPGResults !== null ? (
              <>
                <p style={resultItemStyle}>Heart Rate: {rPPGResults.heartRate} bpm</p>
                <p style={resultItemStyle}>Respiration Rate: {rPPGResults.respirationRate} breaths/min</p>
              </>
            ) : (
              <p>Result: {rPPGResults}</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default VideoRecorder;
