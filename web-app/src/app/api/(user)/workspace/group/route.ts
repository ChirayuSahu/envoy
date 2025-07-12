import { NextResponse, NextRequest } from "next/server";
import connectMongo from "@/utils/connectMongo";
import Workspace from "@/models/workspace";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const uuid = searchParams.get("uuid");

  try {
    await connectMongo();

    const workspace = await Workspace.findOne({ uuid: uuid }).populate({ path: "groups", model: "Group", select: "-envs" });
    const groups = workspace.groups;

    return NextResponse.json({ groups }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ message: "Internal Server Error." }, { status: 500 });
  }
}
