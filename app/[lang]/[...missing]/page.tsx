import { notFound } from "next/navigation";

// This catch-all intentionally terminates in the 404 boundary, not an instant shell.
export const instant = false;

export default function MissingPage() { notFound(); }
