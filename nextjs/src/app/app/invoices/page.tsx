'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
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
  ExternalLink,
  Sparkles,
  Globe,
  Lock,
  BookOpen,
  ArrowRight
} from 'lucide-react';
import { useGlobal } from '@/lib/context/GlobalContext';
import {
  EYTService,
  Invoice,
  Child,
  BankDetails,
  SessionType,
  InvoiceCurrency,
  SUPPORTED_CURRENCIES,
  formatCurrency,
  getCurrencySymbol
} from '@/lib/eyt-service';
import { AnimatedModal, Skeleton, useToast } from '@/components/motion';

export default function InvoicesPage() {
  const { profile } = useGlobal();
  const { showToast } = useToast();
  const isOwner = profile?.role === 'owner';

  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [enrolledChildren, setEnrolledChildren] = useState<Child[]>([]);
  const [selectedChildFilter, setSelectedChildFilter] = useState<string>('all');
  const [bankDetails, setBankDetails] = useState<BankDetails>(() => EYTService.getBankDetails());
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // Payment instruction view tab for parents (auto-switches based on invoice currency)
  const [paymentInstructionTab, setPaymentInstructionTab] = useState<'ngn' | 'intl'>('ngn');

  // New Invoice Form
  const [selectedChildId, setSelectedChildId] = useState('');
  const [parentName, setParentName] = useState('');
  const [invoiceSessionType, setInvoiceSessionType] = useState<SessionType>('standard');
  const [invoiceCurrency, setInvoiceCurrency] = useState<InvoiceCurrency>('NGN');
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
    const list = EYTService.getInvoices();
    setInvoices(list);
    // If parent has any unpaid international invoice, highlight international tab
    const hasUnpaidIntl = list.some(
      (inv) => inv.status === 'unpaid' && inv.currency && inv.currency !== 'NGN'
    );
    if (hasUnpaidIntl) {
      setPaymentInstructionTab('intl');
    }
  }, []);

  const loadChildren = useCallback(() => {
    const list = EYTService.getChildren();
    setEnrolledChildren(list);
  }, []);

  // Handle URL query parameters on mount (e.g. ?childId=xxx&action=create)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const urlChildId = params.get('childId');
      const action = params.get('action');
      if (urlChildId) {
        setSelectedChildFilter(urlChildId);
        setSelectedChildId(urlChildId);
        const childrenList = EYTService.getChildren();
        const found = childrenList.find((c) => c.id === urlChildId);
        if (found) {
          setParentName(found.parent_name || found.parent_email || 'Parent');
        }
        if (action === 'create' && isOwner) {
          setIsCreateModalOpen(true);
          window.history.replaceState({}, '', `/app/invoices?childId=${urlChildId}`);
        }
      }
    }
  }, [isOwner]);

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

  // Open invoice modal for a specific anchored child
  const handleOpenCreateForChild = (childId?: string) => {
    const targetId = childId || (selectedChildFilter !== 'all' ? selectedChildFilter : '');
    if (!targetId) {
      window.location.href = '/app/children';
      return;
    }
    const child = enrolledChildren.find((c) => c.id === targetId);
    if (!child) return;
    setSelectedChildId(targetId);
    setParentName(child.parent_name || child.parent_email || 'Parent');
    setIsCreateModalOpen(true);
  };

  const handleCreateInvoice = (e: React.FormEvent) => {
    e.preventDefault();
    const child = enrolledChildren.find((c) => c.id === selectedChildId);
    if (!child) {
      showToast('Please select a student from the Student Directory first.');
      return;
    }
    const parsedAmount = parseFloat(amount) || 0;
    const isFreeTrial = invoiceSessionType === 'trial' && parsedAmount === 0;

    EYTService.createInvoice({
      parent_profile_id: child.parent_profile_id || 'parent-demo-id',
      parent_name: child.parent_name || parentName || 'Parent',
      child_id: child.id,
      child_name: child.name,
      amount: parsedAmount,
      currency: invoiceCurrency,
      description,
      status: isFreeTrial ? 'paid' : 'unpaid',
      payment_method: isFreeTrial ? 'complimentary' : 'manual',
      due_date: dueDate,
      session_type: invoiceSessionType,
    });

    setIsCreateModalOpen(false);
    setInvoiceSessionType('standard');
    setInvoiceCurrency('NGN');
    loadInvoices();
    showToast(`Invoice issued and sent to ${child.name}’s family successfully!`);
  };

  const handleMarkPaid = (id: string) => {
    EYTService.markInvoicePaid(id);
    loadInvoices();
    showToast('Invoice marked as paid.');
  };

  const handleConfirmPayment = (id: string) => {
    EYTService.confirmInvoicePayment(id);
    if (viewModalInvoice?.id === id) {
      setViewModalInvoice(null);
    }
    loadInvoices();
    showToast('Payment confirmed and receipt issued.');
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
      showToast('Payment proof uploaded successfully for review!');
    } finally {
      setIsUploadingProof(false);
    }
  };

  const selectedChild = enrolledChildren.find((c) => c.id === selectedChildId);
  const filteredInvoices = invoices.filter((inv) =>
    selectedChildFilter === 'all' || inv.child_id === selectedChildFilter
  );

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

        <div className="flex flex-wrap items-center gap-3">
          {/* Child Filter */}
          {enrolledChildren.length > 1 && (
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-[#14263F]">Filter Student:</span>
              <select
                value={selectedChildFilter}
                onChange={(e) => {
                  const val = e.target.value;
                  setSelectedChildFilter(val);
                  if (val !== 'all') {
                    setSelectedChildId(val);
                    const c = enrolledChildren.find((item) => item.id === val);
                    if (c) setParentName(c.parent_name || c.parent_email || 'Parent');
                  }
                }}
                className="px-3 py-2 rounded-xl border border-gray-300 text-xs font-bold bg-white text-[#1E4E8C] focus:ring-2 focus:ring-[#1E4E8C] outline-none shadow-2xs"
              >
                <option value="all">All Enrolled Students</option>
                {enrolledChildren.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {isOwner && (
            selectedChildFilter !== 'all' ? (
              <button
                onClick={() => handleOpenCreateForChild(selectedChildFilter)}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#D4A017] text-white font-bold text-sm hover:bg-[#A9790A] transition-all shadow-sm shadow-amber-200 cursor-pointer"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Issue Invoice for {enrolledChildren.find((c) => c.id === selectedChildFilter)?.name || 'Student'}</span>
              </button>
            ) : (
              <Link
                href="/app/children"
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#D4A017] text-white font-bold text-sm hover:bg-[#A9790A] transition-all shadow-sm shadow-amber-200"
                title="Select a student in the directory to issue an invoice"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Issue Invoice (Select Student in Directory)</span>
              </Link>
            )
          )}
        </div>
      </div>

      {/* Payment Instruction Banner for Parents */}
      {!isOwner && (
        <div className="bg-[#FCFBF7] rounded-2xl p-6 border border-[#F3E7C4] space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#F3E7C4] pb-3">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-[#14263F] uppercase tracking-wider">
                Payment Information:
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setPaymentInstructionTab('ngn')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                  paymentInstructionTab === 'ngn'
                    ? 'bg-[#1E4E8C] text-white shadow-xs'
                    : 'bg-white text-[#14263F] border border-gray-200 hover:bg-gray-50'
                }`}
              >
                <Building2 className="w-3.5 h-3.5" />
                Nigerian Bank Transfer (NGN ₦)
              </button>
              <button
                type="button"
                onClick={() => setPaymentInstructionTab('intl')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                  paymentInstructionTab === 'intl'
                    ? 'bg-[#1E4E8C] text-white shadow-xs'
                    : 'bg-white text-[#14263F] border border-gray-200 hover:bg-gray-50'
                }`}
              >
                <Globe className="w-3.5 h-3.5" />
                International Methods (EUR / GBP / USD)
              </button>
            </div>
          </div>

          {paymentInstructionTab === 'ngn' ? (
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#E8F0FA] text-[#1E4E8C] flex items-center justify-center shrink-0">
                  <Building2 className="w-5 h-5 text-[#D4A017]" />
                </div>
                <div className="space-y-1">
                  <h3 className="font-heading font-bold text-sm text-[#1E4E8C]">
                    Manual Nigerian Bank Transfer Instructions (NGN)
                  </h3>
                  <p className="text-xs text-[#6B7280] leading-relaxed">
                    {bankDetails.instructions || 'Please transfer tutorial fees directly to Mrs Sarah’s designated account.'} After payment, click <strong>Upload Proof</strong> on your invoice below.
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
          ) : (
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#E8F0FA] text-[#1E4E8C] flex items-center justify-center shrink-0">
                  <Globe className="w-5 h-5 text-[#D4A017]" />
                </div>
                <div className="space-y-1.5">
                  <h3 className="font-heading font-bold text-sm text-[#1E4E8C]">
                    International Payment Methods (EUR, GBP, USD)
                  </h3>
                  <p className="text-xs text-[#6B7280] leading-relaxed">
                    {bankDetails.international_payment_instructions || 'International families can settle fees via PayPal, Wise, or card link. Attach your receipt or screenshot below once submitted.'}
                  </p>
                  <div className="flex flex-wrap items-center gap-3 pt-1 text-xs">
                    {bankDetails.wise_details && (
                      <div className="px-2.5 py-1 rounded-lg bg-white border border-[#C7DAF3] font-medium text-[#1E4E8C]">
                        <span className="font-bold">Wise:</span> {bankDetails.wise_details}
                      </div>
                    )}
                    {bankDetails.paypal_link && (
                      <a
                        href={bankDetails.paypal_link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 px-3 py-1 rounded-lg bg-[#0070BA] text-white font-bold text-xs hover:bg-[#005ea6] transition-colors shadow-xs"
                      >
                        Pay via PayPal.me
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                    {bankDetails.stripe_link && (
                      <a
                        href={bankDetails.stripe_link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 px-3 py-1 rounded-lg bg-[#635BFF] text-white font-bold text-xs hover:bg-[#5349e0] transition-colors shadow-xs"
                      >
                        Pay via Stripe Card Link
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>
                </div>
              </div>

              <a
                href={`https://wa.me/234${bankDetails.whatsapp_number.replace(/^0/, '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 rounded-xl bg-[#1E4E8C] text-white text-xs font-bold hover:bg-[#153763] transition-colors shrink-0 text-center"
              >
                Inquire via WhatsApp
              </a>
            </div>
          )}
        </div>
      )}

      {/* Invoices Table */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
          <h2 className="font-heading font-bold text-lg text-[#1E4E8C]">
            {selectedChildFilter === 'all'
              ? `All Invoices (${invoices.length})`
              : `Invoices for ${enrolledChildren.find((c) => c.id === selectedChildFilter)?.name || 'Student'} (${filteredInvoices.length})`}
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
                  <tr key={n}>
                    <td className="p-4"><Skeleton className="h-4 w-24 rounded" /></td>
                    <td className="p-4"><Skeleton className="h-4 w-32 rounded mb-1" /><Skeleton className="h-3 w-20 rounded" /></td>
                    <td className="p-4"><Skeleton className="h-4 w-48 rounded" /></td>
                    <td className="p-4"><Skeleton className="h-4 w-24 rounded" /></td>
                    <td className="p-4"><Skeleton className="h-5 w-20 rounded" /></td>
                    <td className="p-4"><Skeleton className="h-6 w-16 rounded-full" /></td>
                    <td className="p-4 text-right"><Skeleton className="h-7 w-24 rounded ml-auto" /></td>
                  </tr>
                ))
              ) : filteredInvoices.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-12 text-center">
                    <div className="flex flex-col items-center justify-center space-y-3">
                      <div className="w-12 h-12 rounded-2xl bg-[#E8F0FA] flex items-center justify-center text-[#1E4E8C]">
                        <CreditCard className="w-6 h-6 text-[#D4A017]" />
                      </div>
                      <div className="font-heading font-bold text-base text-[#14263F]">
                        {selectedChildFilter === 'all'
                          ? 'No Invoices Issued Yet'
                          : `No Invoices for ${enrolledChildren.find((c) => c.id === selectedChildFilter)?.name || 'this student'}`}
                      </div>
                      <p className="text-xs text-[#6B7280] max-w-sm">
                        {isOwner
                          ? selectedChildFilter === 'all'
                            ? 'You have not created any tuition invoices yet. Select a student in the directory to issue an invoice.'
                            : `You have not created any invoices for ${enrolledChildren.find((c) => c.id === selectedChildFilter)?.name || 'this student'} yet.`
                          : 'You currently have no pending or past tuition invoices. When Mrs Sarah bills your tutorial package, it will appear here.'}
                      </p>
                      {isOwner && (
                        selectedChildFilter !== 'all' ? (
                          <button
                            onClick={() => handleOpenCreateForChild(selectedChildFilter)}
                            className="mt-2 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#1E4E8C] text-white font-bold text-xs hover:bg-[#153763] transition-all cursor-pointer"
                          >
                            <PlusCircle className="w-4 h-4 text-[#D4A017]" />
                            Issue Invoice for {enrolledChildren.find((c) => c.id === selectedChildFilter)?.name || 'Student'}
                          </button>
                        ) : (
                          <Link
                            href="/app/children"
                            className="mt-2 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#1E4E8C] text-white font-bold text-xs hover:bg-[#153763] transition-all"
                          >
                            <PlusCircle className="w-4 h-4 text-[#D4A017]" />
                            Issue Invoice (Select Student in Directory)
                          </Link>
                        )
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                filteredInvoices.map((inv) => (
                  <tr key={inv.id} className="hover:bg-gray-50/80 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="font-bold text-[#1E4E8C]">{inv.invoice_number}</span>
                        {inv.session_type === 'trial' && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold uppercase bg-emerald-50 text-emerald-700 border border-emerald-200">
                            <Sparkles className="w-2.5 h-2.5 text-emerald-600" />
                            Trial Session
                          </span>
                        )}
                      </div>
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
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {inv.amount === 0 ? (
                          <span className="text-emerald-700 font-bold">
                            {formatCurrency(0, inv.currency)} (Complimentary)
                          </span>
                        ) : (
                          <span>{formatCurrency(inv.amount, inv.currency)}</span>
                        )}
                        {inv.currency && inv.currency !== 'NGN' && (
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-[#E8F0FA] text-[#1E4E8C] border border-[#C7DAF3]">
                            {inv.currency}
                          </span>
                        )}
                      </div>
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
      <AnimatedModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        maxWidth="max-w-md"
      >
        <div className="bg-white rounded-2xl w-full p-6 shadow-2xl border border-gray-100 relative space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-gray-100">
            <div className="flex items-center gap-2">
              <h3 className="font-heading font-bold text-lg text-[#1E4E8C]">
                Issue Tuition Invoice
              </h3>
              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-[#1E4E8C] bg-[#E8F0FA] px-2 py-0.5 rounded-full uppercase tracking-wider">
                <Lock className="w-3 h-3 text-[#D4A017]" />
                Anchored Student
              </span>
            </div>
            <button
              onClick={() => setIsCreateModalOpen(false)}
              className="p-1 text-gray-400 hover:text-gray-700"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleCreateInvoice} className="space-y-4">
            {/* Locked Student & Parent Field */}
            <div>
              <label className="block text-xs font-bold text-[#14263F] uppercase tracking-wider mb-1">
                Enrolled Student & Parent (Locked) *
              </label>
              {selectedChild ? (
                <div className="p-3.5 bg-[#F8FAFC] rounded-2xl border border-gray-200 flex items-center gap-3.5">
                  {selectedChild.avatar_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={selectedChild.avatar_url}
                      alt={selectedChild.name}
                      className="w-11 h-11 rounded-xl object-cover border-2 border-[#D4A017] shrink-0"
                    />
                  ) : (
                    <div className="w-11 h-11 rounded-xl bg-[#1E4E8C] text-[#D4A017] font-heading font-bold text-base flex items-center justify-center shrink-0 shadow-2xs">
                      {selectedChild.name.charAt(0)}
                    </div>
                  )}
                  <div className="text-xs min-w-0 flex-1">
                    <p className="text-[#14263F] leading-snug">
                      Issuing invoice to: <strong className="font-bold text-[#1E4E8C]">{selectedChild.name}</strong>
                      {selectedChild.age_years ? ` (Age ${selectedChild.age_years})` : ''}
                      {selectedChild.parent_name ? ` · Parent: ${selectedChild.parent_name}` : ' · Parent: Unassigned'}
                    </p>
                    <p className="text-[11px] text-[#6B7280] mt-1">
                      {selectedChild.parent_email ? `Contact: ${selectedChild.parent_email} • ` : ''}
                      To bill a different student, select them from the Student Directory.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="p-4 bg-amber-50 rounded-2xl border border-amber-200 text-amber-900 text-xs space-y-2">
                  <div className="flex items-center gap-2 font-bold">
                    <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                    <span>No Student Selected</span>
                  </div>
                  <p>
                    In Mrs Sarah&apos;s tutoring model, invoices must be issued directly for an enrolled child from their directory card.
                  </p>
                  <Link
                    href="/app/children"
                    onClick={() => setIsCreateModalOpen(false)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#1E4E8C] text-white font-bold rounded-xl text-xs hover:bg-[#153763] transition-colors"
                  >
                    <BookOpen className="w-3.5 h-3.5 text-[#D4A017]" />
                    <span>Select Student in Student Directory</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              )}
            </div>

              {/* Billing Currency Selector */}
              <div>
                <label className="block text-xs font-bold text-[#14263F] uppercase tracking-wider mb-1">
                  Billing Currency *
                </label>
                <select
                  value={invoiceCurrency}
                  onChange={(e) => setInvoiceCurrency(e.target.value as InvoiceCurrency)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-sm focus:ring-2 focus:ring-[#1E4E8C] outline-none bg-white font-medium"
                >
                  {SUPPORTED_CURRENCIES.map((c) => (
                    <option key={c.code} value={c.code}>
                      {c.label}
                    </option>
                  ))}
                </select>
                <p className="text-[10px] text-gray-500 mt-1">
                  Manual invoice entry: Sarah sets the rate directly in {invoiceCurrency}. No auto-conversion risk.
                </p>
              </div>

              {/* Invoice Session Type */}
              <div>
                <label className="block text-xs font-bold text-[#14263F] uppercase tracking-wider mb-1">
                  Invoice Type *
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setInvoiceSessionType('standard');
                      setAmount(invoiceCurrency === 'NGN' ? '50000' : '100');
                      setDescription('Monthly Early Years Tutorial Package (4 Sessions)');
                    }}
                    className={`py-2 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 border transition-all ${
                      invoiceSessionType === 'standard'
                        ? 'bg-[#1E4E8C] text-white border-[#1E4E8C]'
                        : 'bg-white text-[#14263F] border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    <CreditCard className="w-3.5 h-3.5" />
                    Standard Invoice
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setInvoiceSessionType('trial');
                      const p = EYTService.getPricingSettings();
                      setAmount(String(p.trial_session_price || 0));
                      const child = enrolledChildren.find((c) => c.id === selectedChildId);
                      const symbol = getCurrencySymbol(invoiceCurrency);
                      setDescription(
                        p.trial_session_price === 0
                          ? `Trial Session (Complimentary / ${symbol}0) - ${child?.name || 'Student'}`
                          : `Diagnostic Trial Session - ${child?.name || 'Student'}`
                      );
                    }}
                    className={`py-2 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 border transition-all ${
                      invoiceSessionType === 'trial'
                        ? 'bg-emerald-700 text-white border-emerald-700'
                        : 'bg-white text-[#14263F] border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                    Trial Session
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#14263F] uppercase tracking-wider mb-1">
                  Amount ({invoiceCurrency} {getCurrencySymbol(invoiceCurrency)}) *
                </label>
                <input
                  type="number"
                  step="any"
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
                  disabled={!selectedChild}
                  className="px-4 py-2 rounded-xl bg-[#D4A017] text-white font-bold text-xs hover:bg-[#A9790A] disabled:opacity-50"
                >
                  Save & Issue
                </button>
              </div>
            </form>
          </div>
        </AnimatedModal>

      {/* UPLOAD PAYMENT PROOF MODAL (PARENT) */}
      <AnimatedModal
        isOpen={Boolean(uploadModalInvoice)}
        onClose={() => setUploadModalInvoice(null)}
        maxWidth="max-w-lg"
      >
        {uploadModalInvoice && (
          <div className="bg-white rounded-2xl w-full p-6 shadow-2xl border border-gray-100 relative space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div>
                <h3 className="font-heading font-bold text-lg text-[#1E4E8C]">
                  Upload Payment Proof
                </h3>
                <p className="text-xs text-[#6B7280]">
                  Invoice: <span className="font-bold text-[#14263F]">{uploadModalInvoice.invoice_number}</span> • Amount: <span className="font-bold text-[#14263F]">{formatCurrency(uploadModalInvoice.amount, uploadModalInvoice.currency)}</span>
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
              {uploadModalInvoice.currency === 'NGN' ? (
                <div className="bg-[#FCFBF7] border border-[#F3E7C4] rounded-xl p-3 text-xs text-[#14263F] space-y-1">
                  <p className="font-bold text-[#1E4E8C]">Mrs Sarah’s Designated Bank Account (NGN):</p>
                  <p>Bank: <strong>{bankDetails.bank_name}</strong></p>
                  <p>Account Name: <strong>{bankDetails.account_name}</strong></p>
                  <p>Account Number: <strong>{bankDetails.account_number}</strong></p>
                </div>
              ) : (
                <div className="bg-[#E8F0FA] border border-[#C7DAF3] rounded-xl p-3.5 text-xs text-[#14263F] space-y-2">
                  <div className="flex items-center gap-2 text-[#1E4E8C] font-bold">
                    <Globe className="w-4 h-4 text-[#D4A017]" />
                    <span>International Payment Instructions ({uploadModalInvoice.currency}):</span>
                  </div>
                  <p className="text-[#14263F]/90 leading-relaxed">
                    {bankDetails.international_payment_instructions || 'Please transfer tutorial fees via Wise or PayPal. Attach your receipt screenshot below once completed.'}
                  </p>
                  <div className="space-y-1.5 pt-1">
                    {bankDetails.wise_details && (
                      <div className="p-2 rounded-lg bg-white border border-[#C7DAF3]">
                        <span className="font-bold text-[#1E4E8C]">Wise Account / Tag:</span>{' '}
                        <span className="font-mono text-xs">{bankDetails.wise_details}</span>
                      </div>
                    )}
                    {bankDetails.paypal_link && (
                      <div className="p-2 rounded-lg bg-white border border-[#C7DAF3] flex items-center justify-between gap-2">
                        <span className="font-bold text-[#1E4E8C]">PayPal.me:</span>
                        <a
                          href={bankDetails.paypal_link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs font-bold text-[#0070BA] hover:underline inline-flex items-center gap-1"
                        >
                          Open PayPal Link
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    )}
                    {bankDetails.stripe_link && (
                      <div className="p-2 rounded-lg bg-white border border-[#C7DAF3] flex items-center justify-between gap-2">
                        <span className="font-bold text-[#1E4E8C]">Card Link:</span>
                        <a
                          href={bankDetails.stripe_link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs font-bold text-[#635BFF] hover:underline inline-flex items-center gap-1"
                        >
                          Pay Online via Stripe
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              )}

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
                {uploadModalInvoice.currency === 'NGN'
                  ? `Prefer WhatsApp? You can also message Mrs Sarah directly at ${bankDetails.whatsapp_number}.`
                  : `Questions about international wire or payments? Message Mrs Sarah via WhatsApp at ${bankDetails.whatsapp_number}.`}
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
        )}
      </AnimatedModal>

      {/* VIEW / REVIEW PAYMENT PROOF MODAL */}
      <AnimatedModal
        isOpen={Boolean(viewModalInvoice)}
        onClose={() => setViewModalInvoice(null)}
        maxWidth="max-w-lg"
      >
        {viewModalInvoice && (
          <div className="bg-white rounded-2xl w-full p-6 shadow-2xl border border-gray-100 relative space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div>
                <h3 className="font-heading font-bold text-lg text-[#1E4E8C]">
                  Payment Proof Details
                </h3>
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="text-xs text-[#6B7280]">
                    {viewModalInvoice.invoice_number} • {viewModalInvoice.amount === 0 ? formatCurrency(0, viewModalInvoice.currency) + ' (Complimentary)' : formatCurrency(viewModalInvoice.amount, viewModalInvoice.currency)} ({viewModalInvoice.parent_name})
                  </p>
                  {viewModalInvoice.session_type === 'trial' && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold uppercase bg-emerald-50 text-emerald-700 border border-emerald-200">
                      <Sparkles className="w-2.5 h-2.5 text-emerald-600" />
                      Trial Session
                    </span>
                  )}
                </div>
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
        )}
      </AnimatedModal>
    </div>
  );
}
