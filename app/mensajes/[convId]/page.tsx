import type { Metadata } from "next";
import { ChatView } from "@/components/mensajes/ChatView";

export const metadata: Metadata = {
  title: "Chat",
  robots: { index: false, follow: false },
};

type Params = { params: Promise<{ convId: string }> };

export default async function ChatPage({ params }: Params) {
  const { convId } = await params;
  return (
    <main className="mx-auto max-w-2xl px-4 py-6">
      <ChatView convId={convId} />
    </main>
  );
}
