import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { Send, ImagePlus, X } from "lucide-react";
import { useInquiryMessages, useSendMessage, useSignedImageUrls } from "@/hooks/use-b2b";

function MessageImages({ paths }: { paths: string[] }) {
  const { data: urls } = useSignedImageUrls(paths);
  if (!urls || urls.length === 0) return null;
  return (
    <div className="flex flex-wrap gap-2 mt-2">
      {urls.map((url) => (
        <a key={url} href={url} target="_blank" rel="noreferrer">
          <img src={url} alt="Chat attachment" className="h-24 w-24 object-cover border border-border" />
        </a>
      ))}
    </div>
  );
}

export default function InquiryChat({ inquiry, isAdmin }: { inquiry: any; isAdmin: boolean }) {
  const { data: messages, isLoading } = useInquiryMessages(inquiry?.id);
  const send = useSendMessage(inquiry?.id);
  const { data: images } = useSignedImageUrls(inquiry?.image_paths);
  const [text, setText] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const fileRef = useRef<HTMLInputElement>(null);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages?.length]);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const body = text.trim();
    if (!body && files.length === 0) return;
    send.mutate({ body, isAdmin, files }, {
      onSuccess: () => {
        setText("");
        setFiles([]);
        if (fileRef.current) fileRef.current.value = "";
      },
      onError: (err: any) => toast.error(err.message),
    });
  };


  return (
    <div className="border border-border flex flex-col h-[520px]">
      <div className="border-b border-border p-4">
        <p className="font-heading font-bold">{inquiry.product_name}</p>
        <p className="text-xs text-muted-foreground">
          {inquiry.categories?.name || "Uncategorised"}
          {inquiry.quantity ? ` · ${inquiry.quantity} units` : ""}
          {inquiry.target_price ? ` · target $${Number(inquiry.target_price).toFixed(2)}` : ""}
          {` · ${inquiry.status}`}
        </p>
        {images && images.length > 0 && (
          <div className="flex gap-2 mt-3 overflow-x-auto">
            {images.map((url) => (
              <a key={url} href={url} target="_blank" rel="noreferrer">
                <img src={url} alt="Inquiry attachment" className="h-16 w-16 object-cover border border-border" />
              </a>
            ))}
          </div>
        )}
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-secondary/30">
        {isLoading ? (
          <p className="text-sm text-muted-foreground">Loading conversation...</p>
        ) : messages && messages.length > 0 ? (
          messages.map((m) => {
            const mine = m.is_admin === isAdmin;
            return (
              <div key={m.id} className={`flex ${mine ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[75%] px-3 py-2 text-sm whitespace-pre-wrap ${mine ? "bg-foreground text-background" : "bg-background border border-border"}`}>
                  <p className="text-[10px] uppercase tracking-wide opacity-70 mb-1">{m.is_admin ? "Direct-Link team" : "Buyer"}</p>
                  {m.body}
                </div>
              </div>
            );
          })
        ) : (
          <p className="text-sm text-muted-foreground">No messages yet.</p>
        )}
        {!isAdmin && (
          <p className="text-xs text-muted-foreground text-center pt-2">
            Our team will respond here — you'll see replies as soon as they arrive.
          </p>
        )}
        <div ref={endRef} />
      </div>

      <form onSubmit={submit} className="border-t border-border p-3 flex gap-2">
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          maxLength={2000}
          placeholder="Type a message..."
          className="flex-1 border border-border bg-background px-3 py-2 text-sm"
        />
        <button type="submit" disabled={send.isPending || !text.trim()} className="bg-foreground text-background px-4 py-2 disabled:opacity-50">
          <Send size={16} />
        </button>
      </form>
    </div>
  );
}
