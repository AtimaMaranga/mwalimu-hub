const DAILY_API = "https://api.daily.co/v1";

function getApiKey(): string {
  const key = process.env.DAILY_API_KEY;
  if (!key) throw new Error("DAILY_API_KEY is not set");
  return key;
}

function headers() {
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${getApiKey()}`,
  };
}

/** Create a private Daily.co room for a lesson */
export async function createDailyRoom(lessonId: string): Promise<{ url: string; name: string }> {
  // Room names max 41 chars, must be lowercase alphanumeric + hyphens
  const name = `lesson-${lessonId}`.slice(0, 41).toLowerCase();
  const exp = Math.floor(Date.now() / 1000) + 5 * 60 * 60; // 5 hours from now

  const res = await fetch(`${DAILY_API}/rooms`, {
    method: "POST",
    headers: headers(),
    body: JSON.stringify({
      name,
      privacy: "private",
      properties: {
        exp,
        max_participants: 2,
        enable_chat: false,
        enable_knocking: false,
        start_video_off: false,
        start_audio_off: false,
      },
    }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    console.error("Daily room creation failed:", err);
    throw new Error(`Failed to create Daily room: ${res.status}`);
  }

  const room = await res.json();
  return { url: room.url, name: room.name };
}

/** Create a meeting token for a participant */
export async function createDailyToken(
  roomName: string,
  userId: string,
  userName: string,
  isOwner: boolean
): Promise<string> {
  const exp = Math.floor(Date.now() / 1000) + 5 * 60 * 60;

  const res = await fetch(`${DAILY_API}/meeting-tokens`, {
    method: "POST",
    headers: headers(),
    body: JSON.stringify({
      properties: {
        room_name: roomName,
        user_name: userName,
        user_id: userId,
        is_owner: isOwner,
        exp,
      },
    }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    console.error("Daily token creation failed:", err);
    throw new Error(`Failed to create Daily token: ${res.status}`);
  }

  const data = await res.json();
  return data.token;
}

/** Delete a Daily.co room (best-effort cleanup) */
export async function deleteDailyRoom(roomName: string): Promise<void> {
  try {
    await fetch(`${DAILY_API}/rooms/${roomName}`, {
      method: "DELETE",
      headers: headers(),
    });
  } catch {
    // best-effort
  }
}
