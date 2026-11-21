// Shared by the parser-time reveal, CSS paths and hydrated dock timeline.
export const bootEntryMs = 560;
export const bootHoldMs = 280;
export const bootExitBufferMs = 90;
export const bootDockMs = 480;
export const bootRevealMs = 520;
// Without hydration, hold the curtain through the same window a normal dock uses.
export const bootFallbackRevealMs = bootEntryMs + bootHoldMs + bootExitBufferMs + bootDockMs + bootRevealMs;
export const bootDrawName = "boot-draw";
export const bootStartMark = "astrabrew:boot-visible";
