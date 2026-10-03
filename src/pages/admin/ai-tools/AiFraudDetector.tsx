import React, { useState } from 'react';
import { ShieldAlert, ShieldCheck, AlertTriangle, Phone, MapPin, DollarSign, Check, Copy, RefreshCw, Loader2 } from 'lucide-react';
import { callAiSuiteAction } from '../../../lib/store';

export const AiFraudDetector: React.FC = () => {
  const [customerName, setCustomerName] = useState('Kamal Hossain');
  const [phone, setPhone] = useState('01712345678');
  const [district, setDistrict] = useState('Chattogram');
  const [address, setAddress] = useState('House #12, Road #4, Agrabad, Chattogram');
  const [totalAmount, setTotalAmount] = useState('3850');
  const [paymentMethod, setPaymentMethod] = useState('COD');
  const [orderCount, setOrderCount] = useState('1');

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const handleRunCheck = async () => {
    setLoading(true);
    try {
      const res = await callAiSuiteAction('fraud_check', {
        customerName,
        phone,
        district,
        address,
        totalAmount: Number(totalAmount) || 1500,
        paymentMethod,
        orderCount: Number(orderCount) || 1,
      });
      setResult(res);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-200 shadow-xs p-6 sm:p-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-600 flex items-center justify-center font-bold">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900">AI COD Fraud & High-Risk Order Shield</h2>
            <p className="text-xs text-slate-500">Detect fake numbers, vague addresses, and high-risk Cash on Delivery parcels before shipping with Steadfast.</p>
          </div>
        </div>
        <button
          onClick={handleRunCheck}
          disabled={loading}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs sm:text-sm cursor-pointer shadow-sm transition-all"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
          <span>Run Fraud Analysis</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1 space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Customer Name</label>
            <input
              type="text"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-emerald-500"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Mobile Number (BD)</label>
            <input
              type="text"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="017xxxxxxxx"
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-emerald-500"
            />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">District</label>
              <input
                type="text"
                value={district}
                onChange={(e) => setDistrict(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-emerald-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Order Value (৳)</label>
              <input
                type="number"
                value={totalAmount}
                onChange={(e) => setTotalAmount(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-emerald-500"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Delivery Address</label>
            <textarea
              rows={2}
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-emerald-500"
            />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Payment Type</label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white"
              >
                <option value="COD">Cash on Delivery (COD)</option>
                <option value="bKash">bKash (Prepaid)</option>
                <option value="Nagad">Nagad (Prepaid)</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Previous Orders</label>
              <input
                type="number"
                value={orderCount}
                onChange={(e) => setOrderCount(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200"
              />
            </div>
          </div>
        </div>

        <div className="md:col-span-2 bg-slate-50 rounded-2xl border border-slate-200/80 p-5 flex flex-col justify-between">
          {result ? (
            <div className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-200">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-600">Calculated Risk Score:</span>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-bold ${
                      result.riskLevel === 'HIGH'
                        ? 'bg-rose-100 text-rose-700 border border-rose-200'
                        : result.riskLevel === 'MEDIUM'
                        ? 'bg-amber-100 text-amber-700 border border-amber-200'
                        : 'bg-emerald-100 text-emerald-700 border border-emerald-200'
                    }`}
                  >
                    {result.riskScore}% – {result.riskLevel} RISK
                  </span>
                </div>
                <div className="text-[11px] font-mono text-slate-500">
                  Carrier: <strong className="text-slate-700">{result.phoneCarrier}</strong> ({result.phoneValid ? 'Valid Prefix' : 'Invalid BD Format'})
                </div>
              </div>

              <div>
                <h4 className="text-xs font-bold text-slate-800 mb-1">AI Risk Assessment:</h4>
                <p className="text-xs text-slate-600 leading-relaxed bg-white p-3 rounded-xl border border-slate-200">
                  {result.reason}
                </p>
              </div>

              {result.flags && result.flags.length > 0 && (
                <div>
                  <h4 className="text-xs font-bold text-slate-800 mb-1.5 flex items-center gap-1.5 text-amber-700">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    <span>Risk Flags Identified:</span>
                  </h4>
                  <ul className="space-y-1">
                    {result.flags.map((f: string, i: number) => (
                      <li key={i} className="text-[11px] text-rose-600 bg-rose-50/80 px-2.5 py-1 rounded-lg border border-rose-100 flex items-center gap-2">
                        <span>•</span> {f}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div>
                <h4 className="text-xs font-bold text-slate-800 mb-1.5 flex items-center gap-1.5 text-emerald-700">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Recommended Dispatch Actions:</span>
                </h4>
                <div className="space-y-1.5">
                  {result.recommendations?.map((rec: string, i: number) => (
                    <div key={i} className="text-xs text-slate-700 bg-white p-2.5 rounded-xl border border-slate-200 flex items-center justify-between gap-2">
                      <span className="flex items-center gap-2">
                        <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                        {rec}
                      </span>
                      <button
                        onClick={() => handleCopy(rec, `rec_${i}`)}
                        className="p-1 rounded text-slate-400 hover:text-slate-700"
                        title="Copy note"
                      >
                        {copiedKey === `rec_${i}` ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center p-8 text-slate-400">
              <ShieldAlert className="w-12 h-12 text-slate-300 mb-3" />
              <p className="text-xs font-medium">Click "Run Fraud Analysis" to evaluate order details against Bangladeshi fake order patterns and phone structures.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
