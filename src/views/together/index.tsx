import { useState, useEffect } from "react";
import { useT } from "@/lib/i18n";
import { useView } from "@/lib/view";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { QRCodeSVG } from "qrcode.react";
import { 
  Users, 
  Link, 
  Copy, 
  Check, 
  Play, 
  Pause, 
  SkipForward, 
  SkipBack, 
  Volume2,
  MessageSquare,
  UserPlus,
  LogOut,
  Settings,
  Crown
} from "lucide-react";

type Participant = {
  id: string;
  name: string;
  avatar?: string;
  isHost: boolean;
  joinedAt: Date;
};

type SessionState = {
  isPlaying: boolean;
  position: number;
  speed: number;
};

export function TogetherView({ active }: { active: boolean }) {
  const t = useT();
  const [sessionActive, setSessionActive] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [isHost, setIsHost] = useState(false);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [sessionState, setSessionState] = useState<SessionState>({
    isPlaying: false,
    position: 0,
    speed: 1,
  });
  const [copied, setCopied] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [messages, setMessages] = useState<Array<{ user: string; text: string; time: Date }>>([]);
  const [chatInput, setChatInput] = useState("");

  const createSession = () => {
    const id = Math.random().toString(36).substring(2) + Math.random().toString(36).substring(2);
    setSessionId(id);
    setSessionActive(true);
    setIsHost(true);
    setParticipants([{
      id: "host",
      name: "You (Host)",
      isHost: true,
      joinedAt: new Date(),
    }]);
  };

  const joinSession = (id: string) => {
    setSessionId(id);
    setSessionActive(true);
    setIsHost(false);
    setParticipants([
      { id: "host", name: "Host", isHost: true, joinedAt: new Date() },
      { id: "you", name: "You", isHost: false, joinedAt: new Date() },
    ]);
  };

  const copyInvitation = async () => {
    if (sessionId) {
      await navigator.clipboard.writeText(`${window.location.origin}/together/join/${sessionId}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const leaveSession = () => {
    setSessionActive(false);
    setSessionId(null);
    setIsHost(false);
    setParticipants([]);
    setSessionState({ isPlaying: false, position: 0, speed: 1 });
  };

  const togglePlay = () => {
    setSessionState(prev => ({ ...prev, isPlaying: !prev.isPlaying }));
    // In real implementation, sync with all participants
  };

  const seek = (delta: number) => {
    setSessionState(prev => ({ ...prev, position: Math.max(0, prev.position + delta) }));
    // In real implementation, sync with all participants
  };

  const sendMessage = () => {
    if (chatInput.trim()) {
      setMessages([...messages, { user: "You", text: chatInput, time: new Date() }]);
      setChatInput("");
    }
  };

  if (!active) return null;

  return (
    <div className="flex min-h-full flex-col gap-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-ink">{t("nav.together")}</h1>
          <p className="text-sm text-ink-dim">{t("together.description")}</p>
        </div>
        {!sessionActive ? (
          <Button onClick={createSession} size="lg">
            <Play className="mr-2 h-5 w-5" />
            {t("together.create_session")}
          </Button>
        ) : (
          <Button onClick={leaveSession} variant="outline">
            <LogOut className="mr-2 h-4 w-4" />
            {t("together.leave_session")}
          </Button>
        )}
      </div>

      {!sessionActive ? (
        /* Create/Join Session Screen */
        <div className="flex flex-col items-center justify-center flex-1 gap-6">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-6 w-6" />
                {t("together.watch_together")}
              </CardTitle>
              <CardDescription>{t("together.create_description")}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button onClick={createSession} className="w-full" size="lg">
                <Play className="mr-2 h-5 w-5" />
                {t("together.create_session")}
              </Button>
              
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-edge" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-canvas px-2 text-ink-dim">{t("common.or")}</span>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-sm">{t("together.join_with_code")}</Label>
                <div className="flex gap-2">
                  <Input placeholder="Enter session code" />
                  <Button onClick={() => joinSession("demo")} variant="secondary">
                    {t("together.join")}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>{t("together.features")}</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-ink-dim">
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-500" />
                  {t("together.feature_sync")}
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-500" />
                  {t("together.feature_chat")}
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-500" />
                  {t("together.feature_qr")}
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-500" />
                  {t("together.feature_host")}
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>
      ) : (
        /* Active Session Screen */
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Main Content Area */}
          <div className="lg:col-span-2 space-y-6">
            {/* Video Placeholder */}
            <Card className="aspect-video flex items-center justify-center bg-canvas-subtle">
              <div className="text-center">
                <Play className="mx-auto mb-4 h-16 w-16 text-ink-dim" />
                <p className="text-lg text-ink-dim">{t("together.select_content")}</p>
                <p className="text-sm text-ink-dim">{t("together.sync_playback")}</p>
              </div>
            </Card>

            {/* Playback Controls */}
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-center gap-4">
                  <Button variant="ghost" size="icon" onClick={() => seek(-10)}>
                    <SkipBack className="h-5 w-5" />
                  </Button>
                  <Button size="lg" onClick={togglePlay}>
                    {sessionState.isPlaying ? (
                      <Pause className="h-6 w-6" />
                    ) : (
                      <Play className="h-6 w-6" />
                    )}
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => seek(10)}>
                    <SkipForward className="h-5 w-5" />
                  </Button>
                  <div className="ml-4 flex items-center gap-2">
                    <Volume2 className="h-5 w-5 text-ink-dim" />
                    <div className="w-24 h-1 bg-edge rounded-full">
                      <div className="w-2/3 h-full bg-accent rounded-full" />
                    </div>
                  </div>
                </div>
                <div className="mt-4">
                  <div className="w-full h-1 bg-edge rounded-full">
                    <div 
                      className="h-full bg-accent rounded-full transition-all" 
                      style={{ width: `${(sessionState.position / 100) * 100}%` }}
                    />
                  </div>
                  <div className="mt-2 flex justify-between text-xs text-ink-dim">
                    <span>{formatTime(sessionState.position)}</span>
                    <span>{formatTime(100)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Chat */}
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <MessageSquare className="h-5 w-5" />
                    {t("together.chat")}
                  </CardTitle>
                  <Button variant="ghost" size="sm" onClick={() => setShowChat(!showChat)}>
                    {showChat ? t("common.hide") : t("common.show")}
                  </Button>
                </div>
              </CardHeader>
              {showChat && (
                <CardContent>
                  <div className="h-48 overflow-y-auto space-y-2 mb-3">
                    {messages.length === 0 ? (
                      <p className="text-sm text-ink-dim text-center py-4">{t("together.no_messages")}</p>
                    ) : (
                      messages.map((msg, i) => (
                        <div key={i} className="text-sm">
                          <span className="font-medium text-accent">{msg.user}</span>
                          <span className="text-ink ml-2">{msg.text}</span>
                        </div>
                      ))
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Input
                      value={chatInput}
                      onChange={(e) => setChatInput(e.target.value)}
                      onKeyPress={(e) => e.key === "Enter" && sendMessage()}
                      placeholder={t("together.type_message")}
                    />
                    <Button onClick={sendMessage}>{t("together.send")}</Button>
                  </div>
                </CardContent>
              )}
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Session Info */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Link className="h-5 w-5" />
                  {t("together.session_info")}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="text-sm">
                  <p className="text-ink-dim">{t("together.session_id")}</p>
                  <code className="block mt-1 p-2 bg-canvas-subtle rounded text-xs font-mono">
                    {sessionId}
                  </code>
                </div>
                <div className="flex gap-2">
                  <Button onClick={copyInvitation} variant="outline" size="sm" className="flex-1">
                    {copied ? <Check className="h-4 w-4 mr-2" /> : <Copy className="h-4 w-4 mr-2" />}
                    {copied ? t("common.copied") : t("common.copy")}
                  </Button>
                </div>
                <div className="rounded-lg border border-edge p-2 bg-canvas text-center">
                  <QRCodeSVG 
                    value={`${window.location.origin}/together/join/${sessionId}`} 
                    size={120}
                    className="mx-auto"
                  />
                  <p className="text-xs text-ink-dim mt-2">{t("together.scan_qr")}</p>
                </div>
              </CardContent>
            </Card>

            {/* Participants */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  {t("together.participants", { count: participants.length })}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {participants.map((participant) => (
                    <div key={participant.id} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-accent/10 text-accent">
                          {participant.avatar ? (
                            <img src={participant.avatar} alt={participant.name} className="h-8 w-8 rounded-full" />
                          ) : (
                            <span className="text-sm font-semibold">{participant.name[0]}</span>
                          )}
                        </div>
                        <div>
                          <p className="text-sm font-medium">{participant.name}</p>
                          {participant.isHost && (
                            <div className="flex items-center gap-1 text-xs text-accent">
                              <Crown className="h-3 w-3" />
                              {t("together.host")}
                            </div>
                          )}
                        </div>
                      </div>
                      {isHost && !participant.isHost && (
                        <Button variant="ghost" size="sm">
                          <Settings className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                  <Button variant="outline" size="sm" className="w-full">
                    <UserPlus className="h-4 w-4 mr-2" />
                    {t("together.invite_more")}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

// Add Label component import
const Label = ({ children, className, ...props }: any) => (
  <label className={`text-sm font-medium text-ink ${className || ""}`} {...props}>
    {children}
  </label>
);

const Input = ({ className, ...props }: any) => (
  <input
    className={`w-full px-3 py-2 bg-canvas border border-edge rounded-md text-ink focus:outline-none focus:ring-2 focus:ring-accent ${className || ""}`}
    {...props}
  />
);
