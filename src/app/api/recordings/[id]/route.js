import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function GET(req) {
  const { pathname } = req.nextUrl;
  const id = pathname.split("/").pop();

  if (!id) {
    return NextResponse.json(
      { error: "Folder name is required" },
      { status: 400 }
    );
  }

  const directoryPath = path.join(process.cwd(), "public", "recordings", id);

  try {
    const files = fs.readdirSync(directoryPath);

    // Filter out directories, only return files
    const onlyFiles = files.filter((file) =>
      fs.statSync(path.join(directoryPath, file)).isFile()
    );

    return NextResponse.json(onlyFiles);
  } catch (error) {
    console.error("Error reading directory:", error);
    return NextResponse.json(
      { error: "Error reading directory" },
      { status: 500 }
    );
  }
}
