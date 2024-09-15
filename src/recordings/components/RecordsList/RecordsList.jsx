"use client";
import React from "react";
import Link from "next/link";
import useSWR from "swr";
import { Mic, PlusCircle } from "lucide-react";
import { fetcher } from "@/utils/swr";

// This should be done via CSS
function truncateFilename(filename, maxLength = 25) {
  if (filename.length <= maxLength) return filename;
  return filename.substr(0, maxLength - 3) + "...";
}

export default function RecordsList() {
  const { data: recordings, error } = useSWR("/api/recordings", fetcher);

  if (error) return <div>Failed to load recordings</div>;
  if (!recordings) return <div>Loading...</div>;

  return (
    <ul className="space-y-0">
      <li className="border-b border-gray-200 pb-0">
        <Link
          href="/records/new"
          className="flex items-center p-2 hover:bg-gray-100 rounded transition-colors duration-150"
        >
          <PlusCircle className="mr-3 h-5 w-5 text-green-500" />
          <span className="font-medium text-gray-800 ml-8">New record</span>
        </Link>
      </li>
      {recordings.map((recording) => (
        <li key={recording}>
          <Link
            href={`/records/${encodeURIComponent(recording)}`}
            className="flex items-center p-2 hover:bg-gray-100 rounded transition-colors duration-150"
          >
            <Mic className="mr-3 h-5 w-5 text-blue-500 flex-shrink-0" />
            <span className="font-mono text-sm text-gray-800 truncate">
              {truncateFilename(recording)}
            </span>
          </Link>
        </li>
      ))}
    </ul>
  );
}
