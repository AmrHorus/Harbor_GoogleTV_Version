import { useState } from "react";
import { useT } from "@/lib/i18n";
import { useView } from "@/lib/view";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { QRCodeSVG } from "qrcode.react";
import { Users, Link, RefreshCw, Trash2, Copy, Check, Shield, UserPlus } from "lucide-react";

type FamilyMember = {
  id: string;
  name: string;
  email: string;
  joinedAt: Date;
  avatar?: string;
};

type Invitation = {
  id: string;
  token: string;
  url: string;
  createdAt: Date;
  expiresAt?: Date;
  maxUses?: number;
  currentUses: number;
  isActive: boolean;
};

export function FamilyView({ active }: { active: boolean }) {
  const t = useT();
  const { user } = useAuth();
  const [members, setMembers] = useState<FamilyMember[]>([]);
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [familyName, setFamilyName] = useState("My Harbor Family");
  const [maxMembers, setMaxMembers] = useState(5);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const generateInvitation = () => {
    const token = Math.random().toString(36).substring(2) + Math.random().toString(36).substring(2);
    const invitation: Invitation = {
      id: Date.now().toString(),
      token,
      url: `${window.location.origin}/family/join/${token}`,
      createdAt: new Date(),
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      maxUses: 1,
      currentUses: 0,
      isActive: true,
    };
    setInvitations([...invitations, invitation]);
  };

  const revokeInvitation = (id: string) => {
    setInvitations(invitations.map(inv => inv.id === id ? { ...inv, isActive: false } : inv));
  };

  const regenerateInvitation = (id: string) => {
    setInvitations(invitations.map(inv => {
      if (inv.id === id) {
        const newToken = Math.random().toString(36).substring(2) + Math.random().toString(36).substring(2);
        return {
          ...inv,
          token: newToken,
          url: `${window.location.origin}/family/join/${newToken}`,
          createdAt: new Date(),
          currentUses: 0,
          isActive: true,
        };
      }
      return inv;
    }));
  };

  const copyToClipboard = async (text: string, id: string) => {
    await navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const removeMember = (memberId: string) => {
    setMembers(members.filter(m => m.id !== memberId));
  };

  if (!active) return null;

  return (
    <div className="flex min-h-full flex-col gap-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-ink">{t("nav.family")}</h1>
          <p className="text-sm text-ink-dim">{t("family.description")}</p>
        </div>
        <Button onClick={generateInvitation}>
          <UserPlus className="mr-2 h-4 w-4" />
          {t("family.invite")}
        </Button>
      </div>

      {/* Family Info Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            {familyName}
          </CardTitle>
          <CardDescription>
            {t("family.members_count", { count: members.length, max: maxMembers })}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <Label htmlFor="family-name">{t("family.name")}</Label>
              <Input
                id="family-name"
                value={familyName}
                onChange={(e) => setFamilyName(e.target.value)}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="max-members">{t("family.max_members")}</Label>
              <Input
                id="max-members"
                type="number"
                value={maxMembers}
                onChange={(e) => setMaxMembers(parseInt(e.target.value) || 5)}
                min={1}
                max={10}
                className="mt-1 w-24"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Members Section */}
      <Card>
        <CardHeader>
          <CardTitle>{t("family.members")}</CardTitle>
          <CardDescription>{t("family.members_description")}</CardDescription>
        </CardHeader>
        <CardContent>
          {members.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <Users className="mb-4 h-12 w-12 text-ink-dim" />
              <p className="text-ink-dim">{t("family.no_members")}</p>
              <p className="text-sm text-ink-dim">{t("family.invite_to_add")}</p>
            </div>
          ) : (
            <div className="space-y-3">
              {members.map((member) => (
                <div key={member.id} className="flex items-center justify-between rounded-lg border border-edge-soft p-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-accent/10 text-accent">
                      {member.avatar ? (
                        <img src={member.avatar} alt={member.name} className="h-10 w-10 rounded-full" />
                      ) : (
                        <span className="text-lg font-semibold">{member.name[0]}</span>
                      )}
                    </div>
                    <div>
                      <p className="font-medium">{member.name}</p>
                      <p className="text-sm text-ink-dim">{member.email}</p>
                      <p className="text-xs text-ink-dim">
                        {t("family.joined", { date: member.joinedAt.toLocaleDateString() })}
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeMember(member.id)}
                    disabled={member.id === user?.id}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Invitations Section */}
      <Card>
        <CardHeader>
          <CardTitle>{t("family.invitations")}</CardTitle>
          <CardDescription>{t("family.invitations_description")}</CardDescription>
        </CardHeader>
        <CardContent>
          {invitations.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <Link className="mb-4 h-12 w-12 text-ink-dim" />
              <p className="text-ink-dim">{t("family.no_invitations")}</p>
              <Button onClick={generateInvitation} variant="outline" className="mt-4">
                {t("family.create_invitation")}
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {invitations.map((invitation) => (
                <div key={invitation.id} className="rounded-lg border border-edge-soft p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <Shield className={`h-4 w-4 ${invitation.isActive ? "text-green-500" : "text-red-500"}`} />
                        <span className={`text-sm ${invitation.isActive ? "text-green-500" : "text-red-500"}`}>
                          {invitation.isActive ? t("family.active") : t("family.revoked")}
                        </span>
                      </div>
                      <p className="mt-2 text-sm text-ink-dim">
                        {t("family.created", { date: invitation.createdAt.toLocaleDateString() })}
                      </p>
                      {invitation.expiresAt && (
                        <p className="text-xs text-ink-dim">
                          {t("family.expires", { date: invitation.expiresAt.toLocaleDateString() })}
                        </p>
                      )}
                      <p className="mt-1 text-xs text-ink-dim">
                        {t("family.uses", { current: invitation.currentUses, max: invitation.maxUses || "∞" })}
                      </p>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <div className="rounded-lg border border-edge p-2 bg-canvas">
                        <QRCodeSVG value={invitation.url} size={80} />
                      </div>
                      <div className="flex gap-1">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => copyToClipboard(invitation.url, `copy-${invitation.id}`)}
                        >
                          {copiedId === `copy-${invitation.id}` ? (
                            <Check className="h-4 w-4" />
                          ) : (
                            <Copy className="h-4 w-4" />
                          )}
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => regenerateInvitation(invitation.id)}
                        >
                          <RefreshCw className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => revokeInvitation(invitation.id)}
                          disabled={!invitation.isActive}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
