'use client';

import React, { useState, useEffect } from 'react';
import { CreditCard, CheckCircle2, PlusCircle, Building2, X } from 'lucide-react';
import { useGlobal } from '@/lib/context/GlobalContext';
import { EYTService, Invoice } from '@/lib/eyt-service';

export default function InvoicesPage() {
  const { profile } = useGlobal();
  const isOwner = profile?.role === 'owner';

  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // New Invoice Form
  const [parentName, setParentName] = useState('Mrs Elizabeth Adeleke');
  const [amount, setAmount] = useState('50000');
  const [description, setDescription] = useState('Monthly Early Years Tutorial Package');
  const [dueDate, setDueDate] = useState('2026-09-30');

  const loadInvoices = () => {
    setInvoices(EYTService.getInvoices());
  };

  useEffect(() => {
    loadInvoices();
  }, [profile]);

  const handleMarkPaid = (id: string) => {
    EYTService.markInvoicePaid(id);
    loadInvoices();
  };

  const handleCreateInvoice = (e: React.FormEvent) => {
    e.preventDefault();
    EYTService.createInvoice({
      parent_profile_id: 'parent-demo-id',
      parent_name: parentName,
      amount: parseFloat(amount) || 0,
      currency: 'NGN',
      description,
      status: 'unpaid',
      payment_method: 'manual',
      due_date: dueDate,
    });

    setIsCreateModalOpen(false);
    loadInvoices();
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-gray-200">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#E8F0FA] text-xs font-bold text-[#1E4E8C] uppercase tracking-wider mb-2">
            <CreditCard className="w-3.5 h-3.5 text-[#D4A017]" />
            Fee Management
          </div>
          <h1 className="font-heading text-2xl sm:text-3xl font-bold text-[#1E4E8C]">
            Invoices & Payment Receipts
          </h1>
          <p className="text-xs sm:text-sm text-[#6B7280] mt-1">
            {isOwner
              ? 'Track fee payments, issue manual tutoring invoices, and mark paid bank transfers.'
              : 'Review tutorial fee statements, payment receipts, and bank transfer information.'}
          </p>
        </div>

        {isOwner && (
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#D4A017] text-white font-bold text-sm hover:bg-[#A9790A] transition-all shadow-sm shadow-amber-200"
          >
            <PlusCircle className="w-4 h-4" />
            Issue New Invoice
          </button>
        )}
      </div>

      {/* Payment Instruction Banner for Parents */}
      {!isOwner && (
        <div className="bg-[#FCFBF7] rounded-2xl p-6 border border-[#F3E7C4] flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#E8F0FA] text-[#1E4E8C] flex items-center justify-center shrink-0">
              <Building2 className="w-5 h-5 text-[#D4A017]" />
            </div>
            <div className="space-y-1">
              <h3 className="font-heading font-bold text-sm text-[#1E4E8C]">
                Manual Bank Transfer Instructions
              </h3>
              <p className="text-xs text-[#6B7280] leading-relaxed">
                Please transfer tutorial fees directly to Mrs Sarah’s designated account. Once transferred, send the transaction reference or screenshot via WhatsApp to <strong>09133651659</strong>.
              </p>
            </div>
          </div>

          <a
            href="https://wa.me/2349133651659"
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2 rounded-xl bg-[#1E4E8C] text-white text-xs font-bold hover:bg-[#153763] transition-colors shrink-0 text-center"
          >
            Send Payment Proof on WhatsApp
          </a>
        </div>
      )}

      {/* Invoices Table */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
          <h2 className="font-heading font-bold text-lg text-[#1E4E8C]">
            All Invoices ({invoices.length})
          </h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-[#14263F]">
            <thead className="bg-[#E8F0FA] text-[#1E4E8C] uppercase font-bold text-[10px]">
              <tr>
                <th className="p-4">Invoice #</th>
                <th className="p-4">Recipient</th>
                <th className="p-4">Description</th>
                <th className="p-4">Due Date</th>
                <th className="p-4">Amount</th>
                <th className="p-4">Status</th>
                {isOwner && <th className="p-4">Admin Action</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {invoices.map((inv) => (
                <tr key={inv.id} className="hover:bg-gray-50/80 transition-colors">
                  <td className="p-4 font-bold text-[#1E4E8C]">
                    {inv.invoice_number}
                  </td>
                  <td className="p-4 font-medium">
                    {inv.parent_name || 'Client Parent'}
                  </td>
                  <td className="p-4 max-w-xs text-gray-700">
                    {inv.description}
                  </td>
                  <td className="p-4 text-[#6B7280]">
                    {inv.due_date || 'On receipt'}
                  </td>
                  <td className="p-4 font-bold text-[#14263F] text-sm">
                    ₦{inv.amount.toLocaleString()}
                  </td>
                  <td className="p-4">
                    <span
                      className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${
                        inv.status === 'paid'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {inv.status}
                    </span>
                  </td>
                  {isOwner && (
                    <td className="p-4">
                      {inv.status === 'unpaid' ? (
                        <button
                          onClick={() => handleMarkPaid(inv.id)}
                          className="px-3 py-1.5 rounded-lg bg-[#D4A017] text-white font-bold text-xs hover:bg-[#A9790A] transition-colors shadow-xs"
                        >
                          Mark as Paid
                        </button>
                      ) : (
                        <span className="text-emerald-600 font-semibold text-xs flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Settled
                        </span>
                      )}
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Invoice Modal for Owner */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-gray-100 relative animate-in fade-in zoom-in-95 duration-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <h3 className="font-heading font-bold text-lg text-[#1E4E8C]">
                Issue Tuition Invoice
              </h3>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="p-1 text-gray-400 hover:text-gray-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateInvoice} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#14263F] uppercase tracking-wider mb-1">
                  Parent Name *
                </label>
                <input
                  type="text"
                  required
                  value={parentName}
                  onChange={(e) => setParentName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-sm focus:ring-2 focus:ring-[#1E4E8C] outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#14263F] uppercase tracking-wider mb-1">
                  Amount (NGN ₦) *
                </label>
                <input
                  type="number"
                  required
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-sm focus:ring-2 focus:ring-[#1E4E8C] outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#14263F] uppercase tracking-wider mb-1">
                  Description *
                </label>
                <input
                  type="text"
                  required
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-sm focus:ring-2 focus:ring-[#1E4E8C] outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#14263F] uppercase tracking-wider mb-1">
                  Due Date
                </label>
                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-sm focus:ring-2 focus:ring-[#1E4E8C] outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-gray-500 hover:text-gray-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-[#D4A017] text-white font-bold text-xs hover:bg-[#A9790A]"
                >
                  Save & Issue
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
