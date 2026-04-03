import { useState, useRef, useEffect } from "react";
import { Send, Search, Check, CheckCheck, Paperclip, MoreVertical, Loader2, MessageSquare } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useMessaging, type Conversation } from "@/hooks/useMessaging";
import { useAuth } from "@/contexts/AuthContext";

// ── Conversation list item ────────────────────────────────────────
function ConvItem({
  conv,
  active,
  onClick,
}: {
  conv: Conversation;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full text-left px-4 py-3.5 border-b border-border/60 hover:bg-muted/40 transition-colors flex gap-3 items-start",
        active && "bg-secondary/60"
      )}
    >
      {/* Avatar */}
      <div className="relative shrink-0">
        {conv.otherAvatar ? (
          <img
            src={conv.otherAvatar}
            alt={conv.otherName}
            className="w-10 h-10 rounded-full object-cover"
          />
        ) : (
          <div className="w-10 h-10 rounded-full bg-gradient-brand flex items-center justify-center">
            <span className="font-display text-primary-foreground font-bold text-sm">
              {conv.otherInitials}
            </span>
          </div>
        )}
      </div>
      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-0.5">
          <p className="font-body font-semibold text-foreground text-sm truncate">{conv.otherName}</p>
          <span className="font-body text-xs text-muted-foreground shrink-0 ml-1">{conv.lastTime}</span>
        </div>
        <p className="font-body text-xs text-muted-foreground truncate">{conv.propertyTitle}</p>
        <p className="font-body text-xs text-muted-foreground truncate mt-0.5">{conv.lastMessage}</p>
      </div>
      {conv.unread > 0 && (
        <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center shrink-0 mt-0.5">
          <span className="font-body text-primary-foreground text-xs font-bold">{conv.unread}</span>
        </div>
      )}
    </button>
  );
}

// ── Main component ────────────────────────────────────────────────
export default function DashboardMessages() {
  const { user } = useAuth();
  const { conversations, loading, totalUnread, sendMessage, markConversationRead } =
    useMessaging("hote");

  const [activeKey, setActiveKey] = useState<string | null>(null);
  const [newMsg, setNewMsg] = useState("");
  const [search, setSearch] = useState("");
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  // Auto-select first conversation
  useEffect(() => {
    if (!activeKey && conversations.length > 0) {
      const first = conversations[0];
      setActiveKey(`${first.otherId}__${first.propertyId}`);
      markConversationRead(first.otherId, first.propertyId);
    }
  }, [conversations, activeKey, markConversationRead]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [activeKey, conversations]);

  const active = activeKey
    ? conversations.find((c) => `${c.otherId}__${c.propertyId}` === activeKey)
    : null;

  const filtered = conversations.filter(
    (c) =>
      c.otherName.toLowerCase().includes(search.toLowerCase()) ||
      c.propertyTitle.toLowerCase().includes(search.toLowerCase())
  );

  const handleSelect = (conv: Conversation) => {
    const key = `${conv.otherId}__${conv.propertyId}`;
    setActiveKey(key);
    markConversationRead(conv.otherId, conv.propertyId);
  };

  const handleSend = async () => {
    if (!active || !newMsg.trim() || sending) return;
    setSending(true);
    await sendMessage(active.otherId, active.propertyId, newMsg);
    setNewMsg("");
    setSending(false);
  };

  // ── Empty / loading states ────────────────────────────────────
  const renderEmpty = () => (
    <div className="flex-1 flex flex-col items-center justify-center gap-3 text-center px-6">
      <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
        <MessageSquare className="w-7 h-7 text-muted-foreground" />
      </div>
      <p className="font-body font-semibold text-foreground">Aucun message</p>
      <p className="font-body text-sm text-muted-foreground">
        Vos conversations avec les voyageurs apparaîtront ici.
      </p>
    </div>
  );

  return (
    <div className="space-y-4">
      <div>
        <h2 className="font-display text-2xl font-bold text-foreground">Messages</h2>
        <p className="font-body text-muted-foreground text-sm mt-0.5">
          {totalUnread > 0
            ? `${totalUnread} message(s) non lu(s)`
            : "Toutes vos conversations"}
        </p>
      </div>

      <div
        className="bg-card border border-border rounded-2xl shadow-card overflow-hidden"
        style={{ height: "600px" }}
      >
        {loading ? (
          <div className="flex h-full items-center justify-center">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
          </div>
        ) : (
          <div className="flex h-full">
            {/* ── Sidebar list ── */}
            <div className="w-72 shrink-0 border-r border-border flex flex-col">
              <div className="p-3 border-b border-border">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                  <Input
                    placeholder="Rechercher..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-8 h-9 font-body text-sm border-border"
                  />
                </div>
              </div>
              <div className="flex-1 overflow-y-auto">
                {filtered.length === 0 && (
                  <p className="font-body text-xs text-muted-foreground text-center pt-8 px-4">
                    Aucune conversation trouvée
                  </p>
                )}
                {filtered.map((conv) => (
                  <ConvItem
                    key={`${conv.otherId}__${conv.propertyId}`}
                    conv={conv}
                    active={activeKey === `${conv.otherId}__${conv.propertyId}`}
                    onClick={() => handleSelect(conv)}
                  />
                ))}
              </div>
            </div>

            {/* ── Chat area ── */}
            <div className="flex-1 flex flex-col min-w-0">
              {!active ? (
                renderEmpty()
              ) : (
                <>
                  {/* Header */}
                  <div className="px-5 py-3.5 border-b border-border flex items-center gap-3 bg-muted/20">
                    {active.otherAvatar ? (
                      <img
                        src={active.otherAvatar}
                        alt={active.otherName}
                        className="w-9 h-9 rounded-full object-cover shrink-0"
                      />
                    ) : (
                      <div className="w-9 h-9 rounded-full bg-gradient-brand flex items-center justify-center shrink-0">
                        <span className="font-display text-primary-foreground font-bold text-sm">
                          {active.otherInitials}
                        </span>
                      </div>
                    )}
                    <div className="flex-1">
                      <p className="font-body font-semibold text-foreground text-sm">
                        {active.otherName}
                      </p>
                      <p className="font-body text-xs text-muted-foreground">
                        {active.propertyTitle}
                      </p>
                    </div>
                    <Badge className="bg-accent/15 text-accent font-body text-xs border-0">
                      Voyageur
                    </Badge>
                    <button className="w-8 h-8 rounded-full hover:bg-muted flex items-center justify-center text-muted-foreground">
                      <MoreVertical className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Messages */}
                  <div className="flex-1 overflow-y-auto px-5 py-5 space-y-4">
                    {active.messages.map((msg) => {
                      const isMe = msg.sender_id === user?.id;
                      return (
                        <div
                          key={msg.id}
                          className={cn("flex gap-2.5", isMe ? "flex-row-reverse" : "flex-row")}
                        >
                          {!isMe && (
                            <div className="w-7 h-7 rounded-full bg-gradient-brand flex items-center justify-center shrink-0 self-end">
                              <span className="font-display text-primary-foreground font-bold text-xs">
                                {active.otherInitials}
                              </span>
                            </div>
                          )}
                          <div
                            className={cn(
                              "max-w-xs lg:max-w-sm flex flex-col gap-1",
                              isMe ? "items-end" : "items-start"
                            )}
                          >
                            <div
                              className={cn(
                                "px-4 py-2.5 rounded-2xl font-body text-sm leading-relaxed",
                                isMe
                                  ? "bg-gradient-brand text-primary-foreground rounded-tr-sm"
                                  : "bg-muted text-foreground rounded-tl-sm"
                              )}
                            >
                              {msg.content}
                            </div>
                            <div
                              className={cn(
                                "flex items-center gap-1",
                                isMe ? "flex-row-reverse" : ""
                              )}
                            >
                              <span className="font-body text-xs text-muted-foreground">
                                {new Date(msg.created_at).toLocaleTimeString("fr-FR", {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })}
                              </span>
                              {isMe &&
                                (msg.read_at ? (
                                  <CheckCheck className="w-3.5 h-3.5 text-primary" />
                                ) : (
                                  <Check className="w-3.5 h-3.5 text-muted-foreground" />
                                ))}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                    <div ref={bottomRef} />
                  </div>

                  {/* Input */}
                  <div className="px-4 py-3 border-t border-border bg-background/50">
                    <div className="flex gap-2 items-end">
                      <button className="w-9 h-9 rounded-full hover:bg-muted flex items-center justify-center text-muted-foreground shrink-0">
                        <Paperclip className="w-4 h-4" />
                      </button>
                      <Input
                        placeholder="Écrire un message..."
                        value={newMsg}
                        onChange={(e) => setNewMsg(e.target.value)}
                        onKeyDown={(e) =>
                          e.key === "Enter" && !e.shiftKey && handleSend()
                        }
                        className="flex-1 font-body rounded-xl border-border"
                      />
                      <Button
                        onClick={handleSend}
                        disabled={!newMsg.trim() || sending}
                        size="sm"
                        className="bg-gradient-brand text-primary-foreground hover:opacity-90 w-9 h-9 p-0 rounded-full shrink-0"
                      >
                        {sending ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Send className="w-4 h-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
