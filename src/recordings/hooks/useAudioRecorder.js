import { useState, useRef, useCallback } from "react";
import useSWR from "swr";
import useSWRMutation from "swr/mutation";

const generateSessionId = () => {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
    var r = (Math.random() * 16) | 0,
      v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};

const sendAudioChunk = async (url, { arg }) => {
  const { audioBlob, sessionId } = arg;
  const formData = new FormData();
  formData.append("audio", audioBlob, "audio.wav");
  formData.append("sessionId", sessionId);

  const response = await fetch(url, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    throw new Error("Failed to upload audio chunk");
  }

  return response.json();
};

const finalizeRecording = async (url, { arg }) => {
  const response = await fetch(url, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ sessionId: arg.sessionId }),
  });

  if (!response.ok) {
    throw new Error("Failed to finalize recording");
  }

  return response.json();
};

const useAudioRecorder = () => {
  const [isRecording, setIsRecording] = useState(false);
  const sessionId = useRef(generateSessionId());
  const mediaRecorder = useRef(null);
  const audioChunks = useRef([]);
  const analyserRef = useRef(null);
  const chunkInterval = useRef(null);
  const [microphoneAccess, setMicrophoneAccess] = useState(false);

  const { trigger: triggerSendChunk, error: sendChunkError } = useSWRMutation(
    "/api/recordings",
    sendAudioChunk
  );

  const { trigger: triggerFinalize, error: finalizeError } = useSWRMutation(
    "/api/recordings",
    finalizeRecording
  );

  const error = sendChunkError || finalizeError || microphoneAccess;

  const sendAudioChunkSWR = async (audioBlob) => {
    try {
      await triggerSendChunk({ audioBlob, sessionId: sessionId.current });
      console.log("Audio chunk uploaded successfully");
    } catch (error) {
      console.error("Error sending audio chunk:", error);
    }
  };

  const finalizeRecordingSWR = async () => {
    try {
      clearInterval(chunkInterval.current);
      setIsRecording(false);

      // Send any remaining audio chunks
      if (audioChunks.current.length > 0) {
        const audioBlob = new Blob(audioChunks.current, {
          type: "audio/wav",
        });
        await sendAudioChunkSWR(audioBlob);
        audioChunks.current = [];
      }

      const result = await triggerFinalize({ sessionId: sessionId.current });
      console.log("Recording finalized:", result);
    } catch (error) {
      console.error("Error finalizing recording:", error);
    }
  };

  const startRecording = useCallback(async () => {
    try {
      setMicrophoneAccess(null);
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorder.current = new MediaRecorder(stream);
      audioChunks.current = [];

      mediaRecorder.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunks.current.push(event.data);
        }
      };

      mediaRecorder.current.onstop = () => {
        finalizeRecordingSWR();
      };

      // Set up audio context and analyser for waveform
      const audioContext = new (window.AudioContext ||
        window.webkitAudioContext)();
      const source = audioContext.createMediaStreamSource(stream);
      analyserRef.current = audioContext.createAnalyser();
      source.connect(analyserRef.current);

      mediaRecorder.current.start(1000); // Capture data every 1 second
      setIsRecording(true);

      // Set up interval to send chunks every 5 seconds
      chunkInterval.current = setInterval(() => {
        if (
          mediaRecorder.current &&
          mediaRecorder.current.state === "recording" &&
          audioChunks.current.length > 0
        ) {
          const audioBlob = new Blob(audioChunks.current, {
            type: "audio/wav",
          });
          sendAudioChunkSWR(audioBlob);
          audioChunks.current = [];
        }
      }, 5000);

      mediaRecorder.current.onerror = (event) => {
        console.error("MediaRecorder error:", event);
        clearInterval(chunkInterval.current);
      };

      mediaRecorder.current.onstart = () => {
        console.log("MediaRecorder started");
      };
    } catch (err) {
      setMicrophoneAccess("Error accessing microphone");
      console.error("Error accessing microphone:", err);
    }
  }, []);

  const stopRecording = useCallback(() => {
    if (mediaRecorder.current) {
      mediaRecorder.current.stop();
    }
  }, []);

  return {
    isRecording,
    error,
    analyser: analyserRef.current,
    startRecording,
    stopRecording,
  };
};

export default useAudioRecorder;
