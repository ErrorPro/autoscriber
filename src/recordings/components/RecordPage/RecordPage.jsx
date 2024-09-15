"use client";
import { useState, useEffect, useRef } from "react";
import { useParams } from "next/navigation";
import { Square, Play } from "lucide-react";
import useSWR from "swr";
import { fetcher } from "@/utils/swr";

export default function RecordingPage() {
  const [playingStates, setPlayingStates] = useState({});
  const [errors, setErrors] = useState({});
  const audioRefs = useRef({});
  const { id } = useParams();
  const { data, isLoading } = useSWR(`/api/recordings/${id}`, fetcher);

  useEffect(() => {
    if (data) {
      const newPlayingStates = {};
      data.forEach((filename) => {
        newPlayingStates[filename] = false;
      });
      setPlayingStates(newPlayingStates);
    }
  }, [data]);

  const togglePlayPause = (filename) => {
    const audioElement = audioRefs.current[filename];
    if (audioElement) {
      if (playingStates[filename]) {
        audioElement.pause();
      } else {
        audioElement.play().catch((e) => {
          console.error(`Error playing audio ${filename}:`, e);
          setErrors((prev) => ({
            ...prev,
            [filename]: "Error playing audio. Please try again.",
          }));
        });
      }
      setPlayingStates((prev) => ({
        ...prev,
        [filename]: !prev[filename],
      }));
    }
  };

  if (isLoading) {
    return <div>Loading....</div>;
  }

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Record: {id}</h1>
      {data?.map((filename) => (
        <div key={filename} className="mb-4 p-4 border rounded">
          <h2 className="text-lg font-semibold mb-2">
            {decodeURIComponent(filename)}
          </h2>
          <div className="flex space-x-2">
            <button
              onClick={() => togglePlayPause(filename)}
              className="px-4 py-2 font-bold bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              {playingStates[filename] ? <Square /> : <Play />}
            </button>
          </div>
          <audio
            ref={(el) => (audioRefs.current[filename] = el)}
            src={`/recordings/${id}/${filename}`}
            onEnded={() =>
              setPlayingStates((prev) => ({ ...prev, [filename]: false }))
            }
          />
          {errors[filename] && (
            <div className="mt-2 p-2 bg-red-100 border-l-4 border-red-500 text-red-700">
              <p className="font-bold">Error</p>
              <p>{errors[filename]}</p>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
