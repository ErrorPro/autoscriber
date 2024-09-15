"use client";
import React from "react";
import { Mic, Square } from "lucide-react";
import WaveformVisualizer from "@/recordings/components/WaveformVisualizer";
import useAudioRecorder from "@/recordings/hooks/useAudioRecorder";

const AudioRecorder = () => {
  const { isRecording, error, analyser, startRecording, stopRecording } =
    useAudioRecorder();

  return (
    <div className="p-4 bg-gray-100 rounded-lg shadow-md">
      <div className="mb-4">
        <button
          onClick={isRecording ? stopRecording : startRecording}
          className={"flex items-center justify-center"}
        >
          {isRecording ? (
            <Square className="w-5 h-5 mr-2" />
          ) : (
            <Mic className="w-5 h-5 mr-2" />
          )}
          {isRecording ? "Stop Recording" : "Start Recording"}
        </button>
      </div>
      <WaveformVisualizer analyser={analyser} isPlaying={isRecording} />
      {error && (
        <div className="mt-4 p-4 bg-red-100 border-l-4 border-red-500 text-red-700">
          <p className="font-bold">Error</p>
          <p>{error}</p>
        </div>
      )}
    </div>
  );
};

export default AudioRecorder;
