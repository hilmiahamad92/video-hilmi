// Shared ElevenLabs SDK client. The SDK reads ELEVENLABS_API_KEY from the
// environment (loaded from .env.local by `npm start`); never put the key in code.
import { ElevenLabsClient } from "@elevenlabs/elevenlabs-js";

let client = null;

/** Returns the client, or null when no API key is configured. */
export function elevenlabs() {
  if (!process.env.ELEVENLABS_API_KEY) return null;
  client ||= new ElevenLabsClient();
  return client;
}

export { ElevenLabsError } from "@elevenlabs/elevenlabs-js";
