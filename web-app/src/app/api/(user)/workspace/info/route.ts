import { NextResponse, NextRequest } from "next/server";
import connectMongo from "@/utils/connectMongo";
import Workspace from "@/models/workspace";
import Group from "@/models/group";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const uuid = searchParams.get("uuid");

  try {
    await connectMongo();

    const workspace = await Workspace.findOne({ uuid: uuid })
    .populate({
      path: "groups",
      model: "Group",
    });

    return NextResponse.json({ workspace }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
