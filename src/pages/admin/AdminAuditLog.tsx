import React, { useState, useEffect } from 'react';
import { History, Shield, Clock } from 'lucide-react';
import { getAuditLogs } from '../../lib/store';
import type { AuditLog } from '../../types';

export const AdminAuditLog: React.FC = () => {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAuditLogs().then((list) => {
      setLogs(list);
      setLoading(false);
    });
  }, []);

  return (
    <div className="space-y-6">
      <div className="pb-4 border-b border-white/[0.08]">
        <h1 className="text-2xl font-display font-bold text-white tracking-tight flex items-center gap-2.5">
          <History className="w-6 h-6 text-emerald-400" />
          <span>Administrator Audit Trail</span>
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Historical log of administrative actions, catalog modifications and order updates
        </p>
      </div>

      <div className="rounded-2xl bg-[#0F141A] border border-white/[0.06] overflow-hidden">
        {loading ? (
          <div className="py-16 text-center text-xs text-slate-400">Loading audit trail...</div>
        ) : logs.length > 0 ? (
          <div className="divide-y divide-white/[0.04]">
            {logs.map((log) => (
              <div key={log.id} className="p-4 flex items-start justify-between gap-4 text-xs">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-white">{log.action}</span>
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-white/[0.05] text-slate-400 uppercase">
                      {log.targetType}
                    </span>
                  </div>
                  <p className="text-slate-400 text-[11px]">{log.details}</p>
                  <p className="text-slate-500 text-[10px]">
                    Executed by: <span className="text-slate-300 font-mono">{log.adminEmail}</span>
                  </p>
                </div>

                <div className="text-[11px] font-mono text-slate-500 whitespace-nowrap">
                  {new Date(log.timestamp).toLocaleString()}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-16 text-center text-xs text-slate-400 space-y-2">
            <Shield className="w-10 h-10 text-slate-600 mx-auto" />
            <h3 className="text-sm font-semibold text-white">No Audit Logs Yet</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              As administrators make changes to products, orders or settings, they will be logged here.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
