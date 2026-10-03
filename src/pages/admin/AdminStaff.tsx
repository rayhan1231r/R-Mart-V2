import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  ShieldAlert,
  UserPlus,
  Trash2,
  Edit2,
  Search,
  Crown,
  Key,
  Check,
  AlertTriangle,
  Lock,
  Mail,
  Phone,
  UserCheck,
  RefreshCw,
  Info,
} from 'lucide-react';
import {
  getAdminStaff,
  createAdminStaff,
  updateAdminStaff,
  deleteAdminStaff,
  PRIMARY_OWNER_EMAIL,
} from '../../lib/store';
import { useAuth } from '../../context/AuthContext';
import type { AdminStaff as AdminStaffRecord, AdminRole } from '../../types';

const AVAILABLE_PERMISSIONS = [
  { id: 'all', label: 'Full Access (All Modules)', desc: 'Unrestricted control across all features' },
  { id: 'products', label: 'Products & Catalog', desc: 'Add, edit, delete products & categories' },
  { id: 'orders', label: 'Orders & Fulfillment', desc: 'Process orders, update shipping status, notes' },
  { id: 'courier', label: 'Courier Dispatch Hub', desc: 'Create courier consignments & track parcels' },
  { id: 'inventory', label: 'Inventory & Stock', desc: 'Manage warehouse stock & low inventory alerts' },
  { id: 'customers', label: 'Customers & Security', desc: 'View customers, ban/unban users & manage IPs' },
  { id: 'marketing', label: 'Coupons & Banners', desc: 'Create promotional vouchers & hero banners' },
  { id: 'reviews', label: 'Customer Reviews', desc: 'Moderate, approve or delete user reviews' },
  { id: 'settings', label: 'Store Settings & Policies', desc: 'Edit store details, delivery zones & static pages' },
];

export const AdminStaff: React.FC = () => {
  const { user } = useAuth();
  const [staffList, setStaffList] = useState<AdminStaffRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | AdminRole>('all');
  const [feedback, setFeedback] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // Add Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newRole, setNewRole] = useState<AdminRole>('admin');
  const [newPassword, setNewPassword] = useState('');
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>(['all']);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Edit Modal State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState<AdminStaffRecord | null>(null);
  const [editRole, setEditRole] = useState<AdminRole>('admin');
  const [editStatus, setEditStatus] = useState<'active' | 'suspended'>('active');
  const [editPermissions, setEditPermissions] = useState<string[]>([]);
  const [editPassword, setEditPassword] = useState('');

  // Delete Confirm Modal State
  const [staffToDelete, setStaffToDelete] = useState<AdminStaffRecord | null>(null);

  const isCurrentCallerOwner =
    user?.email?.toLowerCase().trim() === PRIMARY_OWNER_EMAIL.toLowerCase() ||
    user?.adminRole === 'owner';

  const loadStaff = async () => {
    setLoading(true);
    try {
      const list = await getAdminStaff();
      setStaffList(list);
    } catch (err: any) {
      setFeedback({ message: err?.message || 'Failed to load staff list.', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStaff();
  }, []);

  const showFeedback = (message: string, type: 'success' | 'error' = 'success') => {
    setFeedback({ message, type });
    setTimeout(() => setFeedback(null), 4000);
  };

  const handleTogglePermission = (permId: string, currentList: string[], setter: (v: string[]) => void) => {
    if (permId === 'all') {
      setter(['all']);
      return;
    }

    const withoutAll = currentList.filter((p) => p !== 'all');
    if (withoutAll.includes(permId)) {
      const filtered = withoutAll.filter((p) => p !== permId);
      setter(filtered.length === 0 ? ['all'] : filtered);
    } else {
      setter([...withoutAll, permId]);
    }
  };

  const handleCreateStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !newEmail.trim()) {
      showFeedback('Name and Email are required.', 'error');
      return;
    }

    const cleanEmail = newEmail.toLowerCase().trim();
    if (!cleanEmail.includes('@') || !cleanEmail.includes('.')) {
      showFeedback('Please provide a valid email address.', 'error');
      return;
    }

    if (!newPassword || newPassword.length < 6) {
      showFeedback('Password must be at least 6 characters.', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      await createAdminStaff(
        {
          name: newName.trim(),
          email: cleanEmail,
          phone: newPhone.trim() || undefined,
          role: newRole,
          status: 'active',
          permissions: selectedPermissions,
        },
        newPassword,
        user?.email || PRIMARY_OWNER_EMAIL
      );

      showFeedback(`Successfully added ${newRole.toUpperCase()}: ${cleanEmail}`);
      setIsAddModalOpen(false);
      // Reset form
      setNewName('');
      setNewEmail('');
      setNewPhone('');
      setNewRole('admin');
      setNewPassword('');
      setSelectedPermissions(['all']);
      await loadStaff();
    } catch (err: any) {
      showFeedback(err?.message || 'Failed to add administrator.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenEdit = (staff: AdminStaffRecord) => {
    setEditingStaff(staff);
    setEditRole(staff.role);
    setEditStatus(staff.status);
    setEditPermissions(staff.permissions || ['all']);
    setEditPassword('');
    setIsEditModalOpen(true);
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingStaff) return;

    // Check protection on PRIMARY_OWNER_EMAIL
    if (editingStaff.email.toLowerCase().trim() === PRIMARY_OWNER_EMAIL.toLowerCase()) {
      if (editRole !== 'owner' || editStatus !== 'active') {
        showFeedback('The Primary Owner account cannot be demoted or suspended.', 'error');
        return;
      }
    }

    setIsSubmitting(true);
    try {
      await updateAdminStaff(
        editingStaff.id,
        {
          role: editRole,
          status: editStatus,
          permissions: editPermissions,
        },
        user?.email || PRIMARY_OWNER_EMAIL
      );

      // If password was entered, update credential
      if (editPassword && editPassword.length >= 6) {
        const rawCreds = localStorage.getItem('rmart_staff_credentials');
        const creds = rawCreds ? JSON.parse(rawCreds) : {};
        creds[editingStaff.email.toLowerCase().trim()] = editPassword;
        localStorage.setItem('rmart_staff_credentials', JSON.stringify(creds));
      }

      showFeedback(`Updated settings for ${editingStaff.name} (${editingStaff.email})`);
      setIsEditModalOpen(false);
      setEditingStaff(null);
      await loadStaff();
    } catch (err: any) {
      showFeedback(err?.message || 'Failed to update administrator.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteStaff = async () => {
    if (!staffToDelete) return;

    if (staffToDelete.email.toLowerCase().trim() === PRIMARY_OWNER_EMAIL.toLowerCase()) {
      showFeedback('The Primary Owner account cannot be deleted.', 'error');
      setStaffToDelete(null);
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await deleteAdminStaff(staffToDelete.id, user?.email || PRIMARY_OWNER_EMAIL);
      if (res.success) {
        showFeedback(`Removed staff member: ${staffToDelete.email}`);
        setStaffToDelete(null);
        await loadStaff();
      } else {
        showFeedback(res.error || 'Failed to delete staff member.', 'error');
      }
    } catch (err: any) {
      showFeedback(err?.message || 'Failed to delete staff member.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredStaff = staffList.filter((s) => {
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !q ||
      s.name.toLowerCase().includes(q) ||
      s.email.toLowerCase().includes(q) ||
      (s.phone && s.phone.includes(q)) ||
      s.role.toLowerCase().includes(q);

    const matchesRole = roleFilter === 'all' || s.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const ownersCount = staffList.filter((s) => s.role === 'owner').length;
  const adminsCount = staffList.filter((s) => s.role === 'admin').length;
  const subAdminsCount = staffList.filter((s) => s.role === 'sub-admin').length;

  return (
    <div className="space-y-6">
      {/* Feedback Alert */}
      {feedback && (
        <div
          className={`p-4 rounded-2xl flex items-center justify-between text-xs font-semibold shadow-md ${
            feedback.type === 'success'
              ? 'bg-emerald-500/15 border border-emerald-500/30 text-emerald-300'
              : 'bg-rose-500/15 border border-rose-500/30 text-rose-300'
          }`}
        >
          <div className="flex items-center gap-2.5">
            {feedback.type === 'success' ? (
              <Check className="w-4 h-4 text-emerald-400 shrink-0" />
            ) : (
              <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
            )}
            <span>{feedback.message}</span>
          </div>
          <button
            onClick={() => setFeedback(null)}
            className="text-white/60 hover:text-white px-2 py-0.5"
          >
            ✕
          </button>
        </div>
      )}

      {/* Header section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-white/[0.08] gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold text-white tracking-tight flex items-center gap-2.5">
            <ShieldCheck className="w-6 h-6 text-emerald-400" />
            <span>Staff & Admin Role Control</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Manage Owner, Administrator, and Sub-Admin accounts with role-based permissions
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={loadStaff}
            className="p-2.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-slate-300 border border-white/10 transition-colors"
            title="Refresh Staff List"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-emerald-400' : ''}`} />
          </button>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center gap-2 shadow-lg shadow-emerald-950/30 transition-all hover:scale-[1.02] active:scale-95"
          >
            <UserPlus className="w-4 h-4 fill-slate-950 text-slate-950" />
            <span>Add Administrator / Sub-Admin</span>
          </button>
        </div>
      </div>

      {/* Primary Owner Protection Banner */}
      <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-emerald-950/40 via-[#0E171E] to-slate-900 border border-emerald-500/30 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xl">
        <div className="flex items-start sm:items-center gap-3.5">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-amber-400/20 to-emerald-500/20 border border-amber-400/40 flex items-center justify-center shrink-0 text-amber-400 shadow-md">
            <Crown className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm font-bold text-white">Supreme Store Owner:</span>
              <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-lg border border-emerald-500/20">
                {PRIMARY_OWNER_EMAIL}
              </span>
              <span className="text-[10px] font-mono uppercase bg-amber-400/15 text-amber-300 border border-amber-400/30 px-2 py-0.5 rounded-full font-extrabold flex items-center gap-1">
                <Lock className="w-2.5 h-2.5" />
                Protected Account
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              The Primary Owner account has perpetual root administrative power and cannot be deleted, suspended, or demoted.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0 text-[11px] text-slate-400 bg-black/40 px-3 py-1.5 rounded-xl border border-white/5">
          <Info className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
          <span>Only Owner can create or delete administrators</span>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className="p-4 rounded-2xl bg-[#0F141A] border border-white/[0.06] space-y-1">
          <span className="text-[11px] text-slate-400 font-medium">Total Staff Members</span>
          <div className="text-2xl font-bold font-mono text-white">{staffList.length}</div>
        </div>
        <div className="p-4 rounded-2xl bg-[#0F141A] border border-amber-500/20 space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[11px] text-amber-300 font-medium">Owner (Root)</span>
            <Crown className="w-3.5 h-3.5 text-amber-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-amber-400">{ownersCount}</div>
        </div>
        <div className="p-4 rounded-2xl bg-[#0F141A] border border-emerald-500/20 space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[11px] text-emerald-300 font-medium">Executive Admins</span>
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-emerald-400">{adminsCount}</div>
        </div>
        <div className="p-4 rounded-2xl bg-[#0F141A] border border-cyan-500/20 space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[11px] text-cyan-300 font-medium">Sub-Admins</span>
            <ShieldAlert className="w-3.5 h-3.5 text-cyan-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-cyan-400">{subAdminsCount}</div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <input
            type="text"
            placeholder="Search staff name, email, phone or role..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-10 pl-9 pr-3 rounded-xl bg-white/[0.04] border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-colors"
          />
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400">Role:</span>
          {(['all', 'owner', 'admin', 'sub-admin'] as const).map((r) => (
            <button
              key={r}
              onClick={() => setRoleFilter(r)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold capitalize transition-all ${
                roleFilter === r
                  ? 'bg-emerald-500 text-slate-950 shadow-md font-bold'
                  : 'bg-white/[0.04] text-slate-400 hover:text-white hover:bg-white/[0.08] border border-white/5'
              }`}
            >
              {r === 'all' ? 'All Roles' : r}
            </button>
          ))}
        </div>
      </div>

      {/* Staff Table */}
      <div className="rounded-2xl bg-[#0F141A] border border-white/[0.06] overflow-hidden shadow-xl">
        {loading ? (
          <div className="py-16 text-center text-xs text-slate-400 flex flex-col items-center gap-2">
            <RefreshCw className="w-5 h-5 animate-spin text-emerald-400" />
            <span>Loading staff repository...</span>
          </div>
        ) : filteredStaff.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-b border-white/[0.06] text-slate-400 uppercase tracking-wider font-mono text-[10px] bg-white/[0.02]">
                  <th className="py-3.5 px-4">Staff Member</th>
                  <th className="py-3.5 px-4">Role & Access Tier</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4">Assigned Permissions</th>
                  <th className="py-3.5 px-4">Added On</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04]">
                {filteredStaff.map((staff) => {
                  const isOwner = staff.role === 'owner';
                  const isPrimaryOwner = staff.email.toLowerCase().trim() === PRIMARY_OWNER_EMAIL.toLowerCase();
                  const isSubAdmin = staff.role === 'sub-admin';

                  return (
                    <tr key={staff.id} className="hover:bg-white/[0.015] transition-colors">
                      {/* Name & Contact */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-sm shrink-0 ${
                              isOwner
                                ? 'bg-amber-400/20 text-amber-300 border border-amber-400/30'
                                : isSubAdmin
                                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                                : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                            }`}
                          >
                            {isOwner ? <Crown className="w-4 h-4 text-amber-400" /> : staff.name.charAt(0).toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="font-semibold text-white truncate">{staff.name}</span>
                              {isPrimaryOwner && (
                                <span className="text-[9px] font-mono uppercase bg-amber-400/20 text-amber-300 border border-amber-400/40 px-1.5 py-0.5 rounded font-bold">
                                  Primary Root
                                </span>
                              )}
                            </div>
                            <div className="text-[11px] text-slate-400 font-mono flex items-center gap-1.5 mt-0.5">
                              <Mail className="w-3 h-3 text-slate-500 shrink-0" />
                              <span className="truncate">{staff.email}</span>
                            </div>
                            {staff.phone && (
                              <div className="text-[10px] text-slate-500 font-mono flex items-center gap-1 mt-0.5">
                                <Phone className="w-2.5 h-2.5 text-slate-600" />
                                <span>{staff.phone}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Role Badge */}
                      <td className="py-3.5 px-4">
                        {isOwner ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold bg-amber-500/15 text-amber-300 border border-amber-500/30 shadow-xs">
                            <Crown className="w-3.5 h-3.5" />
                            <span>Owner (Full Control)</span>
                          </span>
                        ) : isSubAdmin ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold bg-cyan-500/15 text-cyan-300 border border-cyan-500/30">
                            <ShieldAlert className="w-3.5 h-3.5" />
                            <span>Sub-Admin (Operations)</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                            <ShieldCheck className="w-3.5 h-3.5" />
                            <span>Administrator</span>
                          </span>
                        )}
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4">
                        {staff.status === 'active' ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                            <span>ACTIVE</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold font-mono bg-rose-500/10 text-rose-400 border border-rose-500/20">
                            <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />
                            <span>SUSPENDED</span>
                          </span>
                        )}
                      </td>

                      {/* Permissions List */}
                      <td className="py-3.5 px-4 max-w-xs">
                        <div className="flex flex-wrap gap-1">
                          {staff.permissions && staff.permissions.includes('all') ? (
                            <span className="text-[10px] bg-white/[0.06] text-white px-2 py-0.5 rounded-md font-mono border border-white/10 font-bold">
                              All Modules (Full)
                            </span>
                          ) : (
                            staff.permissions?.slice(0, 3).map((p) => (
                              <span
                                key={p}
                                className="text-[10px] bg-white/[0.04] text-slate-300 px-1.5 py-0.5 rounded capitalize border border-white/5"
                              >
                                {p}
                              </span>
                            ))
                          )}
                          {staff.permissions && !staff.permissions.includes('all') && staff.permissions.length > 3 && (
                            <span className="text-[10px] text-slate-500 font-mono">
                              +{staff.permissions.length - 3} more
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Added On */}
                      <td className="py-3.5 px-4 text-slate-400 font-mono text-[11px]">
                        {new Date(staff.createdAt).toLocaleDateString()}
                      </td>

                      {/* Action Buttons */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleOpenEdit(staff)}
                            className="p-1.5 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] text-slate-300 hover:text-white border border-white/10 transition-colors"
                            title="Edit Role, Status or Permissions"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>

                          {isPrimaryOwner ? (
                            <button
                              disabled
                              className="p-1.5 rounded-lg bg-white/[0.02] text-slate-600 border border-white/5 cursor-not-allowed"
                              title="Primary Owner is protected and cannot be deleted"
                            >
                              <Lock className="w-3.5 h-3.5 text-amber-500/50" />
                            </button>
                          ) : (
                            <button
                              onClick={() => setStaffToDelete(staff)}
                              className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 transition-colors"
                              title="Delete Administrator"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-16 text-center text-xs text-slate-400 space-y-2">
            <ShieldAlert className="w-10 h-10 text-slate-600 mx-auto" />
            <h3 className="text-sm font-semibold text-white">No Staff Accounts Found</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              No administrators match the search criteria. Try modifying your filter.
            </p>
          </div>
        )}
      </div>

      {/* ADD ADMINISTRATOR / SUB-ADMIN MODAL */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="relative w-full max-w-lg rounded-3xl bg-[#0F141A] border border-white/10 p-6 sm:p-7 shadow-2xl space-y-5 max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 flex items-center justify-center">
                  <UserPlus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">Add New Staff Member</h3>
                  <p className="text-[11px] text-slate-400">Provision Administrator or Sub-Admin access</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="text-slate-400 hover:text-white p-1"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateStaff} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Kawsar Ahmed or Rayhan"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full h-10 px-3 rounded-xl bg-white/[0.04] border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Email Address (Login Username) *
                </label>
                <input
                  type="email"
                  required
                  placeholder="e.g. staff@rmartofficial.shop"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  className="w-full h-10 px-3 rounded-xl bg-white/[0.04] border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Mobile Phone (Optional)
                  </label>
                  <input
                    type="tel"
                    placeholder="01619415744"
                    value={newPhone}
                    onChange={(e) => setNewPhone(e.target.value)}
                    className="w-full h-10 px-3 rounded-xl bg-white/[0.04] border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Temporary Password *
                  </label>
                  <input
                    type="password"
                    required
                    placeholder="Min 6 characters"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full h-10 px-3 rounded-xl bg-white/[0.04] border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 font-mono"
                  />
                </div>
              </div>

              {/* Role Selection */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Assign Administrative Role *
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setNewRole('admin')}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      newRole === 'admin'
                        ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300 shadow-md ring-1 ring-emerald-500/30'
                        : 'bg-white/[0.02] border-white/10 text-slate-400 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 font-bold text-xs">
                      <ShieldCheck className="w-4 h-4 text-emerald-400" />
                      <span>Administrator</span>
                    </div>
                    <p className="text-[10px] text-slate-400 mt-1">Full operational admin access to manage store</p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setNewRole('sub-admin')}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      newRole === 'sub-admin'
                        ? 'bg-cyan-500/15 border-cyan-500/40 text-cyan-300 shadow-md ring-1 ring-cyan-500/30'
                        : 'bg-white/[0.02] border-white/10 text-slate-400 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 font-bold text-xs">
                      <ShieldAlert className="w-4 h-4 text-cyan-400" />
                      <span>Sub-Admin</span>
                    </div>
                    <p className="text-[10px] text-slate-400 mt-1">Operational support; cannot delete staff or owner</p>
                  </button>
                </div>
              </div>

              {/* Permission Checklist */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-2">
                  Module Permissions
                </label>
                <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                  {AVAILABLE_PERMISSIONS.map((perm) => {
                    const isChecked = selectedPermissions.includes('all') || selectedPermissions.includes(perm.id);
                    return (
                      <div
                        key={perm.id}
                        onClick={() => handleTogglePermission(perm.id, selectedPermissions, setSelectedPermissions)}
                        className={`p-2.5 rounded-xl border flex items-center justify-between cursor-pointer transition-colors ${
                          isChecked
                            ? 'bg-white/[0.06] border-emerald-500/30 text-white'
                            : 'bg-white/[0.02] border-white/5 text-slate-400 hover:bg-white/[0.04]'
                        }`}
                      >
                        <div>
                          <div className="text-xs font-semibold">{perm.label}</div>
                          <div className="text-[10px] text-slate-500">{perm.desc}</div>
                        </div>
                        <div
                          className={`w-4 h-4 rounded border flex items-center justify-center ${
                            isChecked ? 'bg-emerald-500 border-emerald-500 text-slate-950' : 'border-white/20'
                          }`}
                        >
                          {isChecked && <Check className="w-3 h-3 stroke-[3]" />}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/[0.08]">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-white/[0.05] hover:bg-white/10 text-slate-300 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-lg disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <span>Adding...</span>
                  ) : (
                    <>
                      <UserCheck className="w-4 h-4" />
                      <span>Confirm & Create Staff</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT STAFF MODAL */}
      {isEditModalOpen && editingStaff && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="relative w-full max-w-lg rounded-3xl bg-[#0F141A] border border-white/10 p-6 sm:p-7 shadow-2xl space-y-5 max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Edit2 className="w-4 h-4 text-emerald-400" />
                  <span>Edit Administrator: {editingStaff.name}</span>
                </h3>
                <p className="text-[11px] text-slate-400 font-mono mt-0.5">{editingStaff.email}</p>
              </div>
              <button
                type="button"
                onClick={() => setIsEditModalOpen(false)}
                className="text-slate-400 hover:text-white p-1"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-4">
              {/* Role */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Role
                </label>
                {editingStaff.email.toLowerCase().trim() === PRIMARY_OWNER_EMAIL.toLowerCase() ? (
                  <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-semibold flex items-center gap-2">
                    <Crown className="w-4 h-4 text-amber-400" />
                    <span>Protected Primary Owner (Cannot be demoted or changed)</span>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setEditRole('admin')}
                      className={`p-3 rounded-xl border text-left transition-all ${
                        editRole === 'admin'
                          ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300 shadow-md ring-1 ring-emerald-500/30'
                          : 'bg-white/[0.02] border-white/10 text-slate-400 hover:text-white'
                      }`}
                    >
                      <div className="flex items-center gap-1.5 font-bold text-xs">
                        <ShieldCheck className="w-4 h-4 text-emerald-400" />
                        <span>Administrator</span>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setEditRole('sub-admin')}
                      className={`p-3 rounded-xl border text-left transition-all ${
                        editRole === 'sub-admin'
                          ? 'bg-cyan-500/15 border-cyan-500/40 text-cyan-300 shadow-md ring-1 ring-cyan-500/30'
                          : 'bg-white/[0.02] border-white/10 text-slate-400 hover:text-white'
                      }`}
                    >
                      <div className="flex items-center gap-1.5 font-bold text-xs">
                        <ShieldAlert className="w-4 h-4 text-cyan-400" />
                        <span>Sub-Admin</span>
                      </div>
                    </button>
                  </div>
                )}
              </div>

              {/* Status */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Account Status
                </label>
                {editingStaff.email.toLowerCase().trim() === PRIMARY_OWNER_EMAIL.toLowerCase() ? (
                  <div className="text-xs text-emerald-400 font-mono font-bold bg-emerald-500/10 border border-emerald-500/20 p-2.5 rounded-xl">
                    Perpetually Active
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setEditStatus('active')}
                      className={`p-2.5 rounded-xl border text-xs font-bold transition-all ${
                        editStatus === 'active'
                          ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300'
                          : 'bg-white/[0.02] border-white/10 text-slate-400'
                      }`}
                    >
                      Active
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditStatus('suspended')}
                      className={`p-2.5 rounded-xl border text-xs font-bold transition-all ${
                        editStatus === 'suspended'
                          ? 'bg-rose-500/20 border-rose-500 text-rose-300'
                          : 'bg-white/[0.02] border-white/10 text-slate-400'
                      }`}
                    >
                      Suspended
                    </button>
                  </div>
                )}
              </div>

              {/* Reset Password */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Set New Password (Leave blank to keep existing)
                </label>
                <div className="relative">
                  <input
                    type="password"
                    placeholder="Enter new password if changing"
                    value={editPassword}
                    onChange={(e) => setEditPassword(e.target.value)}
                    className="w-full h-10 pl-9 pr-3 rounded-xl bg-white/[0.04] border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 font-mono"
                  />
                  <Key className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                </div>
              </div>

              {/* Permissions Checklist */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-2">
                  Module Permissions
                </label>
                <div className="space-y-1.5 max-h-44 overflow-y-auto pr-1">
                  {AVAILABLE_PERMISSIONS.map((perm) => {
                    const isChecked = editPermissions.includes('all') || editPermissions.includes(perm.id);
                    return (
                      <div
                        key={perm.id}
                        onClick={() => handleTogglePermission(perm.id, editPermissions, setEditPermissions)}
                        className={`p-2.5 rounded-xl border flex items-center justify-between cursor-pointer transition-colors ${
                          isChecked
                            ? 'bg-white/[0.06] border-emerald-500/30 text-white'
                            : 'bg-white/[0.02] border-white/5 text-slate-400 hover:bg-white/[0.04]'
                        }`}
                      >
                        <div className="text-xs font-semibold">{perm.label}</div>
                        <div
                          className={`w-4 h-4 rounded border flex items-center justify-center ${
                            isChecked ? 'bg-emerald-500 border-emerald-500 text-slate-950' : 'border-white/20'
                          }`}
                        >
                          {isChecked && <Check className="w-3 h-3 stroke-[3]" />}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/[0.08]">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-white/[0.05] hover:bg-white/10 text-slate-300 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-lg disabled:opacity-50"
                >
                  <Check className="w-4 h-4" />
                  <span>Save Changes</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {staffToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="relative w-full max-w-md rounded-3xl bg-[#0F141A] border border-rose-500/30 p-6 sm:p-7 shadow-2xl space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-rose-500/15 border border-rose-500/30 text-rose-400 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>

            <div className="text-center space-y-1">
              <h3 className="text-base font-bold text-white">Remove Administrator Staff?</h3>
              <p className="text-xs text-slate-400">
                Are you sure you want to remove <span className="text-white font-semibold">{staffToDelete.name}</span> ({staffToDelete.email})?
              </p>
            </div>

            <p className="text-[11px] text-rose-400/90 bg-rose-500/10 p-3 rounded-xl border border-rose-500/20 text-center">
              This staff member will immediately lose access to the R Mart Admin Console.
            </p>

            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setStaffToDelete(null)}
                className="px-4 py-2 rounded-xl bg-white/[0.06] hover:bg-white/10 text-white text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteStaff}
                disabled={isSubmitting}
                className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-lg disabled:opacity-50"
              >
                {isSubmitting ? 'Removing...' : 'Confirm Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
