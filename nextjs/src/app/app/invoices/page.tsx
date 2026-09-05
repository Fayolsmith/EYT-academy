'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  CreditCard,
  CheckCircle2,
  PlusCircle,
  Building2,
  X,
  Upload,
  FileText,
  Clock,
  Eye,
  AlertCircle,
  ExternalLink
} from 'lucide-react';
import { useGlobal } from '@/lib/context/GlobalContext';
import { EYTService, Invoice, Child, BankDetails } from '@/lib/eyt-service';

export default function InvoicesPage() {
  const { profile } = useGlobal();
  const isOwner = profile?.role === 'owner';

  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [enrolledChildren, setEnrolledChildren] = useState<Child[]>([]);
  const [bankDetails, setBankDetails] = useState<BankDetails>(() => EYTService.getBankDetails());
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // New Invoice Form
  const [selectedChildId, setSelectedChildId] = useState('');
  const [parentName, setParentName] = useState('');
  const [amount, setAmount] = useState('50000');
  const [description, setDescription] = useState('Monthly Early Years Tutorial Package (4 Sessions)');
  const [dueDate, setDueDate] = useState('2026-09-30');

  // Proof Upload Modal (for Parents)
  const [uploadModalInvoice, setUploadModalInvoice] = useState<Invoice | null>(null);
  const [proofFile, setProofFile] = useState<File | null>(null);
  const [proofPreview, setProofPreview] = useState<string | null>(null);
  const [isUploadingProof, setIsUploadingProof] = useState(false);

  // Proof Review / View Modal (for Owner & Parent)
  const [viewModalInvoice, setViewModalInvoice] = useState<Invoice | null>(null);

  const loadInvoices = useCallback(() => {
    setInvoices(EYTService.getInvoices());
  }, []);

  const loadChildren = useCallback(() => {
    const list = EYTService.getChildren();
    setEnrolledChildren(list);
    if (list.length > 0 && !selectedChildId) {
      setSelectedChildId(list[0].id);
      setParentName(list[0].parent_name || list[0].parent_email || 'Parent');
    }
  }, [selectedChildId]);

  useEffect(() => {
    setIsLoading(true);
    const timer = setTimeout(() => {
      loadInvoices();
      setBankDetails(EYTService.getBankDetails());
      if (isOwner) {
        loadChildren();
      }
      setIsLoading(false);
    }, 150);
    return () => clearTimeout(timer);
  }, [profile, isOwner, loadInvoices, loadChildren]);

  // Handle Child selection in Create Invoice modal
  const handleChildChange = (childId: string) => {
    setSelectedChildId(childId);
    const child = enrolledChildren.find((c) => c.id === childId);
    if (child) {
      setParentName(child.parent_name || child.parent_email || 'Parent');
    }
  };

  const handleCreateInvoice = (e: React.FormEvent) => {
    e.preventDefault();
    const child = enrolledChildren.find((c) => c.id === selectedChildId);

    EYTService.createInvoice({
      parent_profile_id: child?.parent_profile_id || 'parent-demo-id',
      parent_name: parentName || child?.parent_name || 'Parent',
      child_id: child?.id,
      child_name: child?.name,
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

  const handleMarkPaid = (id: string) => {
    EYTService.markInvoicePaid(id);
    loadInvoices();
  };

  const handleConfirmPayment = (id: string) => {
    EYTService.confirmInvoicePayment(id);
    if (viewModalInvoice?.id === id) {
      setViewModalInvoice(null);
    }
    loadInvoices();
  };

  // Proof file selection
  const handleFileSelect = (file: File) => {
    setProofFile(file);
    const reader = new FileReader();
    reader.onload = () => {
      setProofPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleSubmitProof = (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadModalInvoice || !proofPreview) return;

    setIsUploadingProof(true);
    try {
      EYTService.uploadPaymentProof(
        uploadModalInvoice.id,
        proofPreview,
        proofFile?.name || 'bank_transfer_receipt.png'
      );
      setUploadModalInvoice(null);
      setProofFile(null);
      setProofPreview(null);
      loadInvoices();
    } finally {
      setIsUploadingProof(false);
    }
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
              ? 'Track fee payments, verify submitted bank transfers, and issue tuition invoices.'
              : 'Review tutorial fee statements, upload transfer receipts, and track verified payments.'}
          </p>
        </div>

        {isOwner && (
          <button
            onClick={() => {
              loadChildren();
              setIsCreateModalOpen(true);
            }}
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
                {bankDetails.instructions || 'Please transfer tutorial fees directly to Mrs Sarah’s designated account.'} After payment, click <strong>Upload Proof</strong> on your invoice below. You can also send proof via WhatsApp to <strong>{bankDetails.whatsapp_number}</strong>.
              </p>
              <div className="text-xs text-[#1E4E8C] font-semibold pt-1 flex flex-wrap gap-x-3 gap-y-1">
                <span>{bankDetails.bank_name}</span>
                <span>•</span>
                <span>Acct: <strong>{bankDetails.account_number}</strong></span>
                <span>•</span>
                <span>Name: <strong>{bankDetails.account_name}</strong></span>
              </div>
            </div>
          </div>

          <a
            href={`https://wa.me/234${bankDetails.whatsapp_number.replace(/^0/, '')}`}
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2 rounded-xl bg-[#1E4E8C] text-white text-xs font-bold hover:bg-[#153763] transition-colors shrink-0 text-center"
          >
            Send via WhatsApp (Fallback)
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
                <th className="p-4">Recipient / Student</th>
                <th className="p-4">Description</th>
                <th className="p-4">Due Date</th>
                <th className="p-4">Amount</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {isLoading ? (
                [1, 2, 3].map((n) => (
                  <tr key={n} className="animate-pulse">
                    <td className="p-4"><div className="h-4 w-24 bg-gray-200 rounded" /></td>
                    <td className="p-4"><div className="h-4 w-32 bg-gray-200 rounded mb-1" /><div className="h-3 w-20 bg-gray-100 rounded" /></td>
                    <td className="p-4"><div className="h-4 w-48 bg-gray-200 rounded" /></td>
                    <td className="p-4"><div className="h-4 w-24 bg-gray-200 rounded" /></td>
                    <td className="p-4"><div className="h-5 w-20 bg-gray-200 rounded" /></td>
                    <td className="p-4"><div className="h-6 w-16 bg-gray-200 rounded-full" /></td>
                    <td className="p-4 text-right"><div className="h-7 w-24 bg-gray-200 rounded ml-auto" /></td>
                  </tr>
                ))
              ) : invoices.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-12 text-center">
                    <div className="flex flex-col items-center justify-center space-y-3">
                      <div className="w-12 h-12 rounded-2xl bg-[#E8F0FA] flex items-center justify-center text-[#1E4E8C]">
                        <CreditCard className="w-6 h-6 text-[#D4A017]" />
                      </div>
                      <div className="font-heading font-bold text-base text-[#14263F]">
                        No Invoices Issued Yet
                      </div>
                      <p className="text-xs text-[#6B7280] max-w-sm">
                        {isOwner
                          ? 'You have not created any tuition invoices yet. Click "Issue New Invoice" to bill an enrolled family.'
                          : 'You currently have no pending or past tuition invoices. When Mrs Sarah bills your tutorial package, it will appear here.'}
                      </p>
                      {isOwner && (
                        <button
                          onClick={() => setIsCreateModalOpen(true)}
                          className="mt-2 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#1E4E8C] text-white font-bold text-xs hover:bg-[#153763] transition-all"
                        >
                          <PlusCircle className="w-4 h-4 text-[#D4A017]" />
                          Issue First Invoice
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                invoices.map((inv) => (
                  <tr key={inv.id} className="hover:bg-gray-50/80 transition-colors">
                    <td className="p-4 font-bold text-[#1E4E8C]">
                      {inv.invoice_number}
                    </td>
                    <td className="p-4">
                      <div className="font-bold text-[#14263F]">{inv.parent_name || 'Client Parent'}</div>
                      {inv.child_name && (
                        <div className="text-[11px] text-[#6B7280]">Student: {inv.child_name}</div>
                      )}
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
                      {inv.status === 'paid' && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase bg-emerald-100 text-emerald-800">
                          <CheckCircle2 className="w-3 h-3" />
                          Paid
                        </span>
                      )}
                      {inv.status === 'payment_submitted' && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase bg-blue-100 text-[#1E4E8C] border border-[#C7DAF3]">
                          <Clock className="w-3 h-3 text-[#D4A017]" />
                          Payment Submitted – Pending Verification
                        </span>
                      )}
                      {inv.status === 'unpaid' && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase bg-amber-100 text-amber-800">
                          <AlertCircle className="w-3 h-3" />
                          Unpaid
                        </span>
                      )}
                      {inv.status === 'cancelled' && (
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase bg-gray-100 text-gray-700">
                          Cancelled
                        </span>
                      )}
                    </td>

                    {/* Table Actions Column */}
                    <td className="p-4 text-right space-x-2">
                      {/* OWNER ACTIONS */}
                      {isOwner && (
                        <div className="inline-flex items-center justify-end gap-2">
                          {inv.status === 'payment_submitted' && (
                            <>
                              <button
                                onClick={() => setViewModalInvoice(inv)}
                                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border border-[#C7DAF3] bg-[#E8F0FA] text-[#1E4E8C] font-bold text-[11px] hover:bg-[#d8e6f7] transition-all"
                              >
                                <Eye className="w-3 h-3 text-[#D4A017]" />
                                Review Proof
                              </button>
                              <button
                                onClick={() => handleConfirmPayment(inv.id)}
                                className="inline-flex items-center gap-1 px-3 py-1 rounded-lg bg-emerald-600 text-white font-bold text-[11px] hover:bg-emerald-700 transition-colors shadow-xs"
                              >
                                <CheckCircle2 className="w-3 h-3" />
                                Confirm Payment
                              </button>
                            </>
                          )}

                          {inv.status === 'unpaid' && (
                            <button
                              onClick={() => handleMarkPaid(inv.id)}
                              className="px-3 py-1.5 rounded-lg bg-[#D4A017] text-white font-bold text-xs hover:bg-[#A9790A] transition-colors shadow-xs"
                            >
                              Mark as Paid
                            </button>
                          )}

                          {inv.status === 'paid' && (
                            <div className="inline-flex items-center gap-2">
                              {inv.payment_proof_url && (
                                <button
                                  onClick={() => setViewModalInvoice(inv)}
                                  className="text-[11px] font-semibold text-[#1E4E8C] hover:underline inline-flex items-center gap-1"
                                >
                                  <FileText className="w-3 h-3" />
                                  Proof
                                </button>
                              )}
                              <span className="text-emerald-600 font-semibold text-xs inline-flex items-center gap-1">
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                Settled
                              </span>
                            </div>
                          )}
                        </div>
                      )}

                      {/* PARENT ACTIONS */}
                      {!isOwner && (
                        <div className="inline-flex items-center justify-end gap-2">
                          {inv.status === 'unpaid' && (
                            <button
                              onClick={() => {
                                setUploadModalInvoice(inv);
                                setProofFile(null);
                                setProofPreview(null);
                              }}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#1E4E8C] text-white font-bold text-xs hover:bg-[#153763] transition-colors shadow-xs"
                            >
                              <Upload className="w-3.5 h-3.5 text-[#D4A017]" />
                              Upload Payment Proof
                            </button>
                          )}

                          {inv.status === 'payment_submitted' && (
                            <button
                              onClick={() => setViewModalInvoice(inv)}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#C7DAF3] bg-[#E8F0FA] text-[#1E4E8C] font-bold text-xs hover:bg-[#d8e6f7] transition-all"
                            >
                              <Eye className="w-3.5 h-3.5 text-[#D4A017]" />
                              View Submitted Proof
                            </button>
                          )}

                          {inv.status === 'paid' && (
                            <div className="inline-flex items-center gap-2">
                              {inv.payment_proof_url && (
                                <button
                                  onClick={() => setViewModalInvoice(inv)}
                                  className="text-[11px] font-semibold text-[#1E4E8C] hover:underline inline-flex items-center gap-1"
                                >
                                  <FileText className="w-3 h-3" />
                                  Receipt
                                </button>
                              )}
                              <span className="text-emerald-600 font-semibold text-xs inline-flex items-center gap-1">
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                Settled
                              </span>
                            </div>
                          )}
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* CREATE INVOICE MODAL (OWNER ONLY) */}
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
                  Enrolled Student & Parent *
                </label>
                {enrolledChildren.length === 0 ? (
                  <p className="text-xs text-amber-700 p-2 bg-amber-50 rounded-lg">
                    No enrolled students found. Please enroll a student before creating an invoice.
                  </p>
                ) : (
                  <select
                    required
                    value={selectedChildId}
                    onChange={(e) => handleChildChange(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-sm focus:ring-2 focus:ring-[#1E4E8C] outline-none bg-white font-medium"
                  >
                    {enrolledChildren.map((child) => (
                      <option key={child.id} value={child.id}>
                        {child.name} — Parent: {child.parent_name || child.parent_email || 'Unassigned'}
                      </option>
                    ))}
                  </select>
                )}
                {selectedChildId && (
                  <div className="mt-2 p-2.5 bg-[#E8F0FA] rounded-xl text-xs text-[#1E4E8C] space-y-0.5">
                    <p><strong>Parent Contact:</strong> {parentName}</p>
                    <p><strong>Student:</strong> {enrolledChildren.find((c) => c.id === selectedChildId)?.name}</p>
                  </div>
                )}
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
                  disabled={enrolledChildren.length === 0}
                  className="px-4 py-2 rounded-xl bg-[#D4A017] text-white font-bold text-xs hover:bg-[#A9790A] disabled:opacity-50"
                >
                  Save & Issue
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* UPLOAD PAYMENT PROOF MODAL (PARENT) */}
      {uploadModalInvoice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-gray-100 relative animate-in fade-in zoom-in-95 duration-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div>
                <h3 className="font-heading font-bold text-lg text-[#1E4E8C]">
                  Upload Payment Proof
                </h3>
                <p className="text-xs text-[#6B7280]">
                  Invoice: <span className="font-bold text-[#14263F]">{uploadModalInvoice.invoice_number}</span> • Amount: <span className="font-bold text-[#14263F]">₦{uploadModalInvoice.amount.toLocaleString()}</span>
                </p>
              </div>
              <button
                onClick={() => setUploadModalInvoice(null)}
                className="p-1 text-gray-400 hover:text-gray-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitProof} className="space-y-4">
              <div className="bg-[#FCFBF7] border border-[#F3E7C4] rounded-xl p-3 text-xs text-[#14263F] space-y-1">
                <p className="font-bold text-[#1E4E8C]">Mrs Sarah’s Designated Bank Account:</p>
                <p>Bank: <strong>{bankDetails.bank_name}</strong></p>
                <p>Account Name: <strong>{bankDetails.account_name}</strong></p>
                <p>Account Number: <strong>{bankDetails.account_number}</strong></p>
              </div>

              {/* File Dropzone */}
              <div>
                <label className="block text-xs font-bold text-[#14263F] uppercase tracking-wider mb-1">
                  Attach Transfer Receipt / Screenshot (Image or PDF) *
                </label>
                <div
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={handleDrop}
                  className="border-2 border-dashed border-gray-300 rounded-2xl p-6 text-center hover:border-[#1E4E8C] transition-colors cursor-pointer bg-gray-50/50"
                  onClick={() => document.getElementById('proof-file-input')?.click()}
                >
                  <input
                    id="proof-file-input"
                    type="file"
                    accept="image/*,application/pdf"
                    className="hidden"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        handleFileSelect(e.target.files[0]);
                      }
                    }}
                  />
                  <Upload className="w-8 h-8 text-[#D4A017] mx-auto mb-2" />
                  <p className="text-xs font-bold text-[#1E4E8C]">
                    Click to select receipt or drag and drop file here
                  </p>
                  <p className="text-[11px] text-[#6B7280] mt-0.5">
                    PNG, JPG, or PDF up to 10MB
                  </p>
                </div>
              </div>

              {/* File Preview */}
              {proofPreview && (
                <div className="p-3 bg-white border border-gray-200 rounded-xl flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 overflow-hidden">
                    {proofPreview.startsWith('data:image') ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={proofPreview}
                        alt="Receipt preview"
                        className="w-12 h-12 object-cover rounded-lg border border-gray-200 shrink-0"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-lg bg-[#E8F0FA] text-[#1E4E8C] flex items-center justify-center shrink-0">
                        <FileText className="w-6 h-6 text-[#D4A017]" />
                      </div>
                    )}
                    <div className="overflow-hidden">
                      <p className="text-xs font-bold text-[#14263F] truncate">
                        {proofFile?.name || 'Attached Receipt'}
                      </p>
                      <p className="text-[11px] text-emerald-600 font-semibold">
                        Ready to upload
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setProofFile(null);
                      setProofPreview(null);
                    }}
                    className="p-1.5 text-gray-400 hover:text-red-600 rounded-lg hover:bg-gray-100"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}

              <p className="text-[11px] text-[#6B7280]">
                Prefer WhatsApp? You can also message Mrs Sarah directly at <strong>{bankDetails.whatsapp_number}</strong>.
              </p>

              <div className="flex justify-end gap-2 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setUploadModalInvoice(null)}
                  className="px-4 py-2 text-xs font-semibold text-gray-500 hover:text-gray-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!proofPreview || isUploadingProof}
                  className="px-5 py-2.5 rounded-xl bg-[#1E4E8C] text-white font-bold text-xs hover:bg-[#153763] disabled:opacity-50 inline-flex items-center gap-2"
                >
                  {isUploadingProof ? 'Submitting...' : 'Submit Payment Proof'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* VIEW / REVIEW PAYMENT PROOF MODAL */}
      {viewModalInvoice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-gray-100 relative animate-in fade-in zoom-in-95 duration-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div>
                <h3 className="font-heading font-bold text-lg text-[#1E4E8C]">
                  Payment Proof Details
                </h3>
                <p className="text-xs text-[#6B7280]">
                  {viewModalInvoice.invoice_number} • ₦{viewModalInvoice.amount.toLocaleString()} ({viewModalInvoice.parent_name})
                </p>
              </div>
              <button
                onClick={() => setViewModalInvoice(null)}
                className="p-1 text-gray-400 hover:text-gray-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="p-3 bg-[#E8F0FA] rounded-xl text-xs space-y-1 text-[#1E4E8C]">
                <p><strong>Status:</strong> {viewModalInvoice.status.toUpperCase()}</p>
                {viewModalInvoice.payment_proof_uploaded_at && (
                  <p>
                    <strong>Submitted On:</strong>{' '}
                    {new Date(viewModalInvoice.payment_proof_uploaded_at).toLocaleString()}
                  </p>
                )}
                <p><strong>Receipt Reference:</strong> {viewModalInvoice.payment_proof_name || 'receipt_screenshot'}</p>
              </div>

              {/* Receipt Preview */}
              <div className="border border-gray-200 rounded-xl p-2 bg-gray-50 flex items-center justify-center min-h-[220px]">
                {viewModalInvoice.payment_proof_url ? (
                  viewModalInvoice.payment_proof_url.startsWith('data:image') ||
                  viewModalInvoice.payment_proof_url.includes('images.unsplash.com') ||
                  viewModalInvoice.payment_proof_url.endsWith('.png') ||
                  viewModalInvoice.payment_proof_url.endsWith('.jpg') ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={viewModalInvoice.payment_proof_url}
                      alt="Payment proof screenshot"
                      className="max-h-72 w-auto object-contain rounded-lg shadow-sm"
                    />
                  ) : (
                    <div className="text-center p-6 space-y-2">
                      <FileText className="w-10 h-10 text-[#D4A017] mx-auto" />
                      <p className="text-xs font-bold text-[#1E4E8C]">Attached PDF Receipt Document</p>
                      <a
                        href={viewModalInvoice.payment_proof_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#1E4E8C] text-white text-xs font-bold"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        Open Document in New Tab
                      </a>
                    </div>
                  )
                ) : (
                  <p className="text-xs text-gray-500">No proof file attached.</p>
                )}
              </div>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-gray-100">
              <button
                type="button"
                onClick={() => setViewModalInvoice(null)}
                className="px-4 py-2 text-xs font-semibold text-gray-500 hover:text-gray-700"
              >
                Close
              </button>

              {isOwner && viewModalInvoice.status === 'payment_submitted' && (
                <button
                  type="button"
                  onClick={() => handleConfirmPayment(viewModalInvoice.id)}
                  className="px-4 py-2 rounded-xl bg-emerald-600 text-white font-bold text-xs hover:bg-emerald-700 transition-colors shadow-xs inline-flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  Confirm & Mark Paid
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
