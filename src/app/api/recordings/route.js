import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

// In-memory storage for audio chunks
const audioChunks = new Map();

export async function POST(request) {
  try {
    const formData = await request.formData();
    const audioFile = formData.get("audio");
    const sessionId = formData.get("sessionId");

    if (!audioFile || !sessionId) {
      return NextResponse.json(
        { error: "Missing audio file or session ID" },
        { status: 400 }
      );
    }

    const chunks = audioChunks.get(sessionId) || [];
    chunks.push(await audioFile.arrayBuffer());
    audioChunks.set(sessionId, chunks);

    return NextResponse.json(
      { message: "Audio chunk received" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error processing audio chunk:", error);
    return NextResponse.json(
      { error: "Error processing audio chunk" },
      { status: 500 }
    );
  }
}

export async function PUT(request) {
  try {
    const { sessionId } = await request.json();

    if (!sessionId || !audioChunks.has(sessionId)) {
      return NextResponse.json(
        { error: "Invalid or missing session ID" },
        { status: 400 }
      );
    }

    const chunks = audioChunks.get(sessionId);
    const fullAudio = Buffer.concat(chunks.map((chunk) => Buffer.from(chunk)));

    const sessionDir = path.join(
      process.cwd(),
      "public",
      "recordings",
      sessionId
    );
    fs.mkdirSync(sessionDir, { recursive: true });

    // Save full audio
    const fullAudioPath = path.join(sessionDir, "audio.wav");
    fs.writeFileSync(fullAudioPath, fullAudio);

    // Save individual chunks
    for (let i = 0; i < chunks.length; i++) {
      const chunkPath = path.join(sessionDir, `chunk_${i + 1}.wav`);
      fs.writeFileSync(chunkPath, Buffer.from(chunks[i]));
    }

    audioChunks.delete(sessionId);

    return NextResponse.json(
      { message: "Recording finalized", sessionId },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error finalizing recording:", error);
    return NextResponse.json(
      { error: "Error finalizing recording" },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const recordingsDir = path.join(process.cwd(), "public", "recordings");
    const files = fs.readdirSync(recordingsDir);

    // Filter to include only directories (session IDs)
    const sessions = files.map((file) => {
      const filePath = path.join(recordingsDir, file);
      const stats = fs.statSync(filePath);

      if (stats.isDirectory()) {
        return file;
      }
      return null;
    });

    // Remove null entries and sort
    const validSessions = sessions
      .filter(Boolean)
      .sort((a, b) => a.localeCompare(b));

    return NextResponse.json(validSessions, { status: 200 });
  } catch (error) {
    console.error("Error fetching recordings:", error);
    return NextResponse.json(
      { error: "Error fetching recordings" },
      { status: 500 }
    );
  }
}
