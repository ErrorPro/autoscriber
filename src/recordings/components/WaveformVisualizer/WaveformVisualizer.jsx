import React, { useRef, useEffect } from "react";

const WaveformVisualizer = ({ analyser, isPlaying }) => {
  const canvasRef = useRef(null);
  const animationFrameId = useRef(null);

  useEffect(() => {
    if (isPlaying) {
      drawWaveform();
    } else if (animationFrameId.current) {
      cancelAnimationFrame(animationFrameId.current);
    }

    return () => {
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
    };
  }, [isPlaying, analyser]);

  const drawWaveform = () => {
    const canvas = canvasRef.current;
    const canvasCtx = canvas.getContext("2d");

    const draw = () => {
      const WIDTH = canvas.width;
      const HEIGHT = canvas.height;

      analyser.fftSize = 2048;
      const bufferLength = analyser.fftSize;
      const dataArray = new Uint8Array(bufferLength);

      canvasCtx.clearRect(0, 0, WIDTH, HEIGHT);
      analyser.getByteTimeDomainData(dataArray);

      canvasCtx.lineWidth = 2;
      canvasCtx.strokeStyle = "rgb(0, 0, 0)";
      canvasCtx.beginPath();

      const sliceWidth = (WIDTH * 1.0) / bufferLength;
      let x = 0;

      for (let i = 0; i < bufferLength; i++) {
        const v = dataArray[i] / 128.0;
        const y = (v * HEIGHT) / 2;

        if (i === 0) {
          canvasCtx.moveTo(x, y);
        } else {
          canvasCtx.lineTo(x, y);
        }

        x += sliceWidth;
      }

      canvasCtx.lineTo(canvas.width, canvas.height / 2);
      canvasCtx.stroke();

      animationFrameId.current = requestAnimationFrame(draw);
    };

    draw();
  };

  return (
    <canvas
      ref={canvasRef}
      width="300"
      height="100"
      className="w-full border border-gray-300 rounded-md"
    />
  );
};

export default WaveformVisualizer;
