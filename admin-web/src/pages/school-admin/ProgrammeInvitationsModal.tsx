import React, { useState, useEffect } from 'react';
import { Modal } from '../../components/Modal';
import { Button } from '../../components/Button';
import { api } from '../../services/api';
import { alertService } from '../../services/alertService';
import { ProgrammeInvite, Programme } from '../../types';
import { Link2, Copy, Check, ShieldAlert, Trash2, Calendar, Users, Plus, Loader2 } from 'lucide-react';

interface ProgrammeInvitationsModalProps {
  isOpen: boolean;
  onClose: () => void;
  programme: Programme | null;
}

export const ProgrammeInvitationsModal: React.FC<ProgrammeInvitationsModalProps> = ({
  isOpen,
  onClose,
  programme
}) => {
  const [invites, setInvites] = useState<ProgrammeInvite[]>([]);
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const [copiedToken, setCopiedToken] = useState<string | null>(null);

  // Form State
  const [maxUses, setMaxUses] = useState<string>('');
  const [expiresAt, setExpiresAt] = useState<string>('');

  useEffect(() => {
    if (isOpen && programme?.id) {
      loadInvites();
    }
  }, [isOpen, programme]);

  const loadInvites = async () => {
    if (!programme?.id) return;
    setLoading(true);
    try {
      const list = await api.listProgrammeInvites(programme.id);
      setInvites(list);
    } catch (err: any) {
      alertService.handleApiError(err, 'Failed to load programme invitation links.');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!programme?.id) return;

    setCreating(true);
    try {
      const usesNum = maxUses.trim() ? parseInt(maxUses, 10) : undefined;
      const expIso = expiresAt.trim() ? new Date(expiresAt).toISOString() : undefined;

      await api.createProgrammeInvite(programme.id, {
        max_uses: usesNum,
        expires_at: expIso
      });

      alertService.showSuccess('Invitation Link Created', 'A new unique invitation URL has been generated successfully.');
      setMaxUses('');
      setExpiresAt('');
      loadInvites();
    } catch (err: any) {
      alertService.handleApiError(err, 'Failed to generate invitation link.');
    } finally {
      setCreating(false);
    }
  };

  const handleRevokeInvite = async (inviteId: string) => {
    try {
      await api.revokeProgrammeInvite(inviteId);
      alertService.showSuccess('Link Revoked', 'The invitation token has been revoked and can no longer be used.');
      loadInvites();
    } catch (err: any) {
      alertService.handleApiError(err, 'Failed to revoke invitation link.');
    }
  };

  const copyToClipboard = (token: string) => {
    const origin = window.location.origin;
    const url = `${origin}/programme-invite/${token}`;
    navigator.clipboard.writeText(url);
    setCopiedToken(token);
    setTimeout(() => setCopiedToken(null), 2500);
    alertService.showInfo('Link Copied', 'Invitation URL copied to clipboard.');
  };

  if (!programme) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Invitation Links — ${programme.title}`}>
      <div className="space-y-6">
        {/* Helper Banner */}
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 text-xs text-amber-900 leading-relaxed flex items-start space-x-3">
          <Link2 className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <p className="font-bold mb-1">Secure Programme Invitations</p>
            <p>Generate shareable unique links for WhatsApp groups, email broadcasts, or select alumni cohorts. Invitation links require members to authenticate and register.</p>
          </div>
        </div>

        {/* Create New Invite Form */}
        <form onSubmit={handleCreateInvite} className="bg-gray-50 border border-gray-200 rounded-2xl p-4 space-y-4">
          <h4 className="font-bold text-xs uppercase tracking-wider text-gray-700 flex items-center gap-1.5">
            <Plus className="w-4 h-4 text-amber-600" />
            Generate New Invitation Link
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Usage Limit (Max Registrations)</label>
              <input
                type="number"
                min="1"
                placeholder="Unlimited if empty"
                value={maxUses}
                onChange={(e) => setMaxUses(e.target.value)}
                className="w-full bg-white border border-gray-300 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[#F4C542]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Expiration Date (Optional)</label>
              <input
                type="datetime-local"
                value={expiresAt}
                onChange={(e) => setExpiresAt(e.target.value)}
                className="w-full bg-white border border-gray-300 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[#F4C542]"
              />
            </div>
          </div>

          <Button type="submit" isLoading={creating} className="w-full py-2.5 bg-[#111111] hover:bg-black text-white text-xs font-bold rounded-xl flex items-center justify-center space-x-2">
            <Link2 className="w-3.5 h-3.5 text-[#F4C542]" />
            <span>Generate Shareable Link</span>
          </Button>
        </form>

        {/* Existing Invitations List */}
        <div className="space-y-3">
          <h4 className="font-bold text-xs uppercase tracking-wider text-gray-700 flex items-center justify-between">
            <span>Active & Past Invitation Links ({invites.length})</span>
            {loading && <Loader2 className="w-4 h-4 animate-spin text-amber-600" />}
          </h4>

          {invites.length === 0 ? (
            <div className="text-center py-6 bg-white border border-gray-200 rounded-2xl text-xs text-gray-500">
              No invitation links generated yet. Use the form above to create your first link.
            </div>
          ) : (
            <div className="space-y-2.5 max-h-[280px] overflow-y-auto pr-1">
              {invites.map((inv) => {
                const origin = window.location.origin;
                const fullUrl = `${origin}/programme-invite/${inv.token}`;
                const isCopied = copiedToken === inv.token;

                return (
                  <div key={inv.id} className={`p-3.5 rounded-2xl border text-xs transition-all ${inv.is_revoked ? 'bg-gray-50 border-gray-200 opacity-60' : 'bg-white border-gray-200 hover:border-amber-400'}`}>
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <span className="font-mono text-[11px] font-bold text-[#111111] truncate">{fullUrl}</span>
                      <div className="flex items-center space-x-1.5 shrink-0">
                        {!inv.is_revoked && (
                          <button
                            onClick={() => copyToClipboard(inv.token)}
                            className="px-2.5 py-1 bg-[#FFF7D6] hover:bg-amber-200 text-[#854D0E] font-bold rounded-lg border border-amber-300 inline-flex items-center gap-1 cursor-pointer transition-colors"
                          >
                            {isCopied ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                            <span>{isCopied ? 'Copied' : 'Copy'}</span>
                          </button>
                        )}
                        {!inv.is_revoked && (
                          <button
                            onClick={() => handleRevokeInvite(inv.id)}
                            title="Revoke Link"
                            className="p-1 text-rose-600 hover:bg-rose-50 rounded-lg cursor-pointer transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-3 text-[11px] text-gray-500">
                      <span className="inline-flex items-center gap-1">
                        <Users className="w-3 h-3 text-gray-400" />
                        <span>Uses: <b>{inv.use_count}</b> / {inv.max_uses || '∞'}</span>
                      </span>
                      {inv.expires_at && (
                        <span className="inline-flex items-center gap-1">
                          <Calendar className="w-3 h-3 text-gray-400" />
                          <span>Expires: {new Date(inv.expires_at).toLocaleDateString()}</span>
                        </span>
                      )}
                      {inv.is_revoked && (
                        <span className="bg-rose-100 text-rose-700 font-bold px-2 py-0.5 rounded-full text-[10px]">
                          REVOKED
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
};
