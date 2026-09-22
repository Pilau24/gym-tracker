import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { getSessionFromToken } from "@/lib/session";
import {
  isWidgetSettings,
  isWidgetSizes,
  isKnownWidgetType,
  normalizeWidgetType,
  replaceProfileWidgets,
  type ProfileWidgetInput,
} from "@/lib/profile-widgets";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isWidgetInput(value: unknown): value is ProfileWidgetInput {
  if (!isRecord(value) || typeof value.widgetType !== "string") return false;
  if (!/^[a-z0-9][a-z0-9_-]{0,63}$/.test(value.widgetType)) return false;
  return (
    isKnownWidgetType(normalizeWidgetType(value.widgetType)) &&
    isWidgetSizes(value.sizes) &&
    isWidgetSettings(value.settings)
  );
}

export async function PUT(request: Request) {
  const session = getSessionFromToken(
    (await cookies()).get("passkey_session")?.value,
  );
  if (!session) {
    return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Request body must be valid JSON." }, { status: 400 });
  }

  if (
    !isRecord(body) ||
    !Array.isArray(body.widgets) ||
    body.widgets.length > 100 ||
    !body.widgets.every(isWidgetInput)
  ) {
    return NextResponse.json(
      { error: "Widgets must be a list of valid widget configurations." },
      { status: 400 },
    );
  }

  const widgetTypes = body.widgets.map((widget) =>
    normalizeWidgetType(widget.widgetType),
  );
  if (new Set(widgetTypes).size !== widgetTypes.length) {
    return NextResponse.json(
      { error: "Each widget type may only appear once." },
      { status: 400 },
    );
  }

  await replaceProfileWidgets(
    session.userId,
    body.widgets.map((widget) => ({
      ...widget,
      widgetType: normalizeWidgetType(widget.widgetType),
    })),
  );
  return NextResponse.json({ saved: body.widgets.length });
}
