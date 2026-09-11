'use client';

import React, { useState, useRef, useMemo } from 'react';
import {
  X,
  Upload,
  Download,
  FileSpreadsheet,
  CheckCircle2,
  AlertCircle,
  XCircle,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  Info
} from 'lucide-react';
import { EYTService, Child } from '@/lib/eyt-service';
import { AnimatedModal } from '@/components/motion';

export interface ParsedStudentRow {
  rowIndex: number;
  parent_name: string;
  parent_email: string;
  parent_phone: string;
  child_name: string;
  child_date_of_birth: string;
  learning_goals: string;
  notes: string;
  age_years: number | null;
  status: 'valid' | 'duplicate' | 'invalid';
  errors: string[];
  duplicateReason: string | null;
  selectedForImport: boolean;
}

interface BulkImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImportCompleted: (newChildren: Child[]) => void;
  existingChildren?: Child[];
}

export function parseCSV(text: string): string[][] {
  const lines: string[][] = [];
  let currentRow: string[] = [];
  let currentVal = '';
  let insideQuote = false;

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const nextChar = text[i + 1];

    if (char === '"') {
      if (insideQuote && nextChar === '"') {
        currentVal += '"';
        i++;
      } else {
        insideQuote = !insideQuote;
      }
    } else if (char === ',' && !insideQuote) {
      currentRow.push(currentVal.trim());
      currentVal = '';
    } else if ((char === '\r' || char === '\n') && !insideQuote) {
      if (char === '\r' && nextChar === '\n') {
        i++;
      }
      currentRow.push(currentVal.trim());
      if (currentRow.some((cell) => cell.length > 0)) {
        lines.push(currentRow);
      }
      currentRow = [];
      currentVal = '';
    } else {
      currentVal += char;
    }
  }

  if (currentVal || currentRow.length > 0) {
    currentRow.push(currentVal.trim());
    if (currentRow.some((cell) => cell.length > 0)) {
      lines.push(currentRow);
    }
  }

  return lines;
}

export function isValidDateOfBirth(dobStr: string): boolean {
  if (!dobStr) return false;
  const trimmed = dobStr.trim();
  if (!/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) return false;

  const parts = trimmed.split('-');
  const year = parseInt(parts[0], 10);
  const month = parseInt(parts[1], 10);
  const day = parseInt(parts[2], 10);

  if (month < 1 || month > 12) return false;
  if (day < 1 || day > 31) return false;

  const dateObj = new Date(trimmed);
  if (isNaN(dateObj.getTime())) return false;

  const now = new Date();
  if (dateObj > now) return false;

  // Reasonable bounds for early years / primary tutoring
  const minYear = now.getFullYear() - 18;
  if (year < minYear) return false;

  return true;
}

export function calculateAgeYears(dobStr: string): number {
  const dob = new Date(dobStr);
  const diffMs = Date.now() - dob.getTime();
  return Math.max(1, Math.floor(diffMs / (365.25 * 24 * 60 * 60 * 1000)));
}

export default function BulkImportModal({
  isOpen,
  onClose,
  onImportCompleted,
  existingChildren = [],
}: BulkImportModalProps) {
  const [step, setStep] = useState<'upload' | 'preview' | 'summary'>('upload');
  const [fileName, setFileName] = useState<string>('');
  const [fileSize, setFileSize] = useState<string>('');
  const [parsedRows, setParsedRows] = useState<ParsedStudentRow[]>([]);
  const [parseError, setParseError] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'all' | 'valid' | 'duplicate' | 'invalid'>('all');
  const [isImporting, setIsImporting] = useState<boolean>(false);

  // Summary state
  const [importedChildren, setImportedChildren] = useState<Child[]>([]);
  const [skippedCount, setSkippedCount] = useState<number>(0);
  const [skippedDuplicatesCount, setSkippedDuplicatesCount] = useState<number>(0);
  const [skippedInvalidCount, setSkippedInvalidCount] = useState<number>(0);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const resetState = () => {
    setStep('upload');
    setFileName('');
    setFileSize('');
    setParsedRows([]);
    setParseError('');
    setActiveTab('all');
    setIsImporting(false);
    setImportedChildren([]);
    setSkippedCount(0);
    setSkippedDuplicatesCount(0);
    setSkippedInvalidCount(0);
  };

  const handleModalClose = () => {
    resetState();
    onClose();
  };

  const downloadTemplate = () => {
    const csvContent =
      'parent_name,parent_email,parent_phone,child_name,child_date_of_birth,learning_goals,notes\n' +
      '"Omolara Bamidele","omolara@example.com","08034567890","Ayomide Bamidele","2021-04-12","Phonics letter recognition and counting","Gentle learner, loves hands-on Montessori activities"\n' +
      '"Chidinma Okafor","chidinma@example.com","08123456789","Kamsi Okafor","2020-08-19","Blended CVC words and number operations","Attentive and enthusiastic"\n';

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'eyt_students_template.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const processCSVFile = (file: File) => {
    setParseError('');
    if (!file.name.endsWith('.csv') && file.type !== 'text/csv' && file.type !== 'application/vnd.ms-excel') {
      setParseError('Please upload a valid .csv file.');
      return;
    }

    setFileName(file.name);
    setFileSize((file.size / 1024).toFixed(1) + ' KB');

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        if (!text || !text.trim()) {
          setParseError('The uploaded CSV file is empty.');
          return;
        }

        const rawRows = parseCSV(text);
        if (rawRows.length < 2) {
          setParseError('CSV must contain a header row and at least one family record.');
          return;
        }

        // Standardize headers
        const rawHeaders = rawRows[0];
        const normalizedHeaders = rawHeaders.map((h) =>
          h.toLowerCase().trim().replace(/[\s-]+/g, '_')
        );

        const requiredHeaders = ['parent_name', 'parent_email', 'child_name', 'child_date_of_birth'];
        const missingHeaders = requiredHeaders.filter((rh) => !normalizedHeaders.includes(rh));

        if (missingHeaders.length > 0) {
          setParseError(
            `Missing required column header(s): ${missingHeaders.join(', ')}. Please use the provided CSV template.`
          );
          return;
        }

        const colIndexMap: Record<string, number> = {};
        normalizedHeaders.forEach((h, idx) => {
          colIndexMap[h] = idx;
        });

        const getCol = (row: string[], colName: string): string => {
          const idx = colIndexMap[colName];
          return idx !== undefined && row[idx] !== undefined ? row[idx].trim() : '';
        };

        const currentSystemChildren = existingChildren.length > 0 ? existingChildren : EYTService.getChildren();
        const seenInBatch = new Set<string>();
        const processedRows: ParsedStudentRow[] = [];

        for (let i = 1; i < rawRows.length; i++) {
          const row = rawRows[i];
          // Skip completely blank rows
          if (row.every((cell) => !cell || cell.trim() === '')) {
            continue;
          }

          const parent_name = getCol(row, 'parent_name');
          const parent_email = getCol(row, 'parent_email').toLowerCase();
          const parent_phone = getCol(row, 'parent_phone');
          const child_name = getCol(row, 'child_name');
          const child_date_of_birth = getCol(row, 'child_date_of_birth');
          const learning_goals = getCol(row, 'learning_goals');
          const notes = getCol(row, 'notes');

          const errors: string[] = [];

          if (!parent_name) {
            errors.push('Missing parent_name (required)');
          }

          if (!parent_email) {
            errors.push('Missing parent_email (required)');
          } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(parent_email)) {
            errors.push('Invalid parent_email format');
          }

          if (!child_name) {
            errors.push('Missing child_name (required)');
          }

          if (!child_date_of_birth) {
            errors.push('Missing child_date_of_birth (required)');
          } else if (!isValidDateOfBirth(child_date_of_birth)) {
            errors.push('Invalid child_date_of_birth (format must be YYYY-MM-DD, e.g. 2021-04-12)');
          }

          const isRowValid = errors.length === 0;
          let calculatedAge: number | null = null;
          if (child_date_of_birth && isValidDateOfBirth(child_date_of_birth)) {
            calculatedAge = calculateAgeYears(child_date_of_birth);
          }

          const studentRow: ParsedStudentRow = {
            rowIndex: i,
            parent_name,
            parent_email,
            parent_phone,
            child_name,
            child_date_of_birth,
            learning_goals,
            notes,
            age_years: calculatedAge,
            errors,
            status: 'valid',
            duplicateReason: null,
            selectedForImport: false,
          };

          if (!isRowValid) {
            studentRow.status = 'invalid';
            studentRow.selectedForImport = false;
          } else {
            // Check duplicates against existing system students
            const normalizedChildName = child_name.toLowerCase().trim();
            const existingMatch = currentSystemChildren.find(
              (c) =>
                c.name?.toLowerCase().trim() === normalizedChildName &&
                c.parent_email?.toLowerCase().trim() === parent_email
            );

            const batchKey = `${parent_email}:::${normalizedChildName}`;

            if (existingMatch) {
              studentRow.status = 'duplicate';
              studentRow.duplicateReason = `Already enrolled in system: "${existingMatch.name}" under parent ${existingMatch.parent_email}`;
              studentRow.selectedForImport = false;
            } else if (seenInBatch.has(batchKey)) {
              studentRow.status = 'duplicate';
              studentRow.duplicateReason = `Repeated entry in this CSV: "${child_name}" under parent ${parent_email}`;
              studentRow.selectedForImport = false;
            } else {
              seenInBatch.add(batchKey);
              studentRow.status = 'valid';
              studentRow.selectedForImport = true;
            }
          }

          processedRows.push(studentRow);
        }

        if (processedRows.length === 0) {
          setParseError('No data records found in CSV after the header row.');
          return;
        }

        setParsedRows(processedRows);
        setStep('preview');
      } catch (err) {
        setParseError(err instanceof Error ? err.message : 'Error reading CSV file.');
      }
    };
    reader.readAsText(file);
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processCSVFile(file);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processCSVFile(file);
    }
  };

  const handleToggleRow = (index: number) => {
    setParsedRows((prev) =>
      prev.map((row) => {
        if (row.rowIndex === index) {
          if (row.status === 'invalid') return row;
          return { ...row, selectedForImport: !row.selectedForImport };
        }
        return row;
      })
    );
  };

  const handleSelectAllValid = () => {
    setParsedRows((prev) =>
      prev.map((row) => {
        if (row.status === 'valid') {
          return { ...row, selectedForImport: true };
        }
        return row;
      })
    );
  };

  const handleDeselectAll = () => {
    setParsedRows((prev) =>
      prev.map((row) => ({ ...row, selectedForImport: false }))
    );
  };

  // Filtered rows for preview tab
  const filteredRows = useMemo(() => {
    if (activeTab === 'valid') {
      return parsedRows.filter((r) => r.status === 'valid');
    }
    if (activeTab === 'duplicate') {
      return parsedRows.filter((r) => r.status === 'duplicate');
    }
    if (activeTab === 'invalid') {
      return parsedRows.filter((r) => r.status === 'invalid');
    }
    return parsedRows;
  }, [parsedRows, activeTab]);

  const counts = useMemo(() => {
    const total = parsedRows.length;
    const valid = parsedRows.filter((r) => r.status === 'valid').length;
    const duplicate = parsedRows.filter((r) => r.status === 'duplicate').length;
    const invalid = parsedRows.filter((r) => r.status === 'invalid').length;
    const selected = parsedRows.filter((r) => r.selectedForImport).length;
    return { total, valid, duplicate, invalid, selected };
  }, [parsedRows]);

  const handleConfirmImport = async () => {
    const toImport = parsedRows.filter((r) => r.selectedForImport);
    if (toImport.length === 0) return;

    setIsImporting(true);

    try {
      const created: Child[] = [];
      let skippedDupes = 0;
      let skippedInval = 0;

      for (const row of parsedRows) {
        if (!row.selectedForImport) {
          if (row.status === 'duplicate') skippedDupes++;
          if (row.status === 'invalid') skippedInval++;
          continue;
        }

        // Use the EXACT same underlying EYTService.addChild flow
        const child = EYTService.addChild({
          name: row.child_name.trim(),
          date_of_birth: row.child_date_of_birth,
          age_years: row.age_years || undefined,
          notes: row.notes?.trim() || undefined,
          learning_goals: row.learning_goals?.trim() || undefined,
          parent_name: row.parent_name.trim(),
          parent_email: row.parent_email.trim().toLowerCase(),
          parent_phone: row.parent_phone?.trim() || undefined,
        });

        created.push(child);
      }

      setImportedChildren(created);
      setSkippedDuplicatesCount(skippedDupes);
      setSkippedInvalidCount(skippedInval);
      setSkippedCount(skippedDupes + skippedInval);
      setStep('summary');
      onImportCompleted(created);
    } catch (err) {
      setParseError(err instanceof Error ? err.message : 'An error occurred during import.');
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <AnimatedModal isOpen={isOpen} onClose={handleModalClose} maxWidth="max-w-4xl">
      <div className="bg-white rounded-3xl w-full shadow-2xl border border-gray-100 overflow-hidden my-6 flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="p-6 sm:p-7 border-b border-gray-100 flex items-start justify-between bg-white shrink-0">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-[#E8F0FA] flex items-center justify-center text-[#1E4E8C] shrink-0 border border-[#C7DAF3]">
              <Upload className="w-6 h-6 text-[#D4A017]" />
            </div>
            <div>
              <div className="inline-flex items-center gap-1.5 text-[11px] font-bold text-[#D4A017] uppercase tracking-wider mb-0.5">
                <FileSpreadsheet className="w-3.5 h-3.5" />
                Existing Family Onboarding
              </div>
              <h2 className="font-heading text-xl sm:text-2xl font-bold text-[#1E4E8C]">
                Bulk Import Students (CSV)
              </h2>
              <p className="text-xs text-[#6B7280]">
                {step === 'upload' && 'Upload a spreadsheet of existing students and parent contacts in one pass.'}
                {step === 'preview' && 'Review each parsed student profile before committing to the directory.'}
                {step === 'summary' && 'Import summary & confirmation of enrolled students.'}
              </p>
            </div>
          </div>

          <button
            onClick={handleModalClose}
            className="p-2 rounded-xl text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 sm:p-7 overflow-y-auto flex-1 space-y-6">
          {/* STEP 1: UPLOAD */}
          {step === 'upload' && (
            <div className="space-y-6">
              {/* Instructions & Template Card */}
              <div className="bg-[#FCFBF7] p-5 rounded-2xl border border-[#F3E7C4] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <h4 className="font-bold text-xs uppercase tracking-wider text-[#1E4E8C] flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-[#D4A017]" />
                    CSV Format Guidelines
                  </h4>
                  <p className="text-xs text-[#6B7280] leading-relaxed max-w-xl">
                    Columns: <strong>parent_name</strong>, <strong>parent_email</strong>, <strong>child_name</strong>, <strong>child_date_of_birth</strong> (YYYY-MM-DD), and optional <em>parent_phone</em>, <em>learning_goals</em>, <em>notes</em>.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={downloadTemplate}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white border border-[#D4A017] text-[#1E4E8C] font-bold text-xs hover:bg-[#E8F0FA] transition-all shrink-0 shadow-2xs"
                >
                  <Download className="w-4 h-4 text-[#D4A017]" />
                  Download CSV Template
                </button>
              </div>

              {parseError && (
                <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-xs text-rose-700 flex items-start gap-2.5">
                  <XCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <p className="font-bold">File Parsing Error</p>
                    <p className="text-rose-600">{parseError}</p>
                  </div>
                </div>
              )}

              {/* Upload Drop Zone */}
              <div
                onDragOver={(e) => e.preventDefault()}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-[#C7DAF3] hover:border-[#1E4E8C] bg-[#F8FAFD] hover:bg-[#F0F5FC] rounded-3xl p-8 sm:p-12 text-center cursor-pointer transition-all space-y-4 group"
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv,text/csv,application/vnd.ms-excel"
                  className="hidden"
                  onChange={handleFileInputChange}
                />
                <div className="w-16 h-16 rounded-2xl bg-white border border-[#C7DAF3] group-hover:border-[#1E4E8C] flex items-center justify-center mx-auto text-[#1E4E8C] shadow-sm group-hover:scale-105 transition-all">
                  <FileSpreadsheet className="w-8 h-8 text-[#D4A017]" />
                </div>
                <div>
                  <p className="font-bold text-sm text-[#14263F] group-hover:text-[#1E4E8C] transition-colors">
                    Click to select CSV file, or drag and drop here
                  </p>
                  <p className="text-xs text-[#6B7280] mt-1">
                    Standard comma-separated format (.csv) up to 5MB
                  </p>
                </div>
                <span className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#1E4E8C] text-white text-xs font-bold shadow-xs">
                  <Upload className="w-3.5 h-3.5 text-[#D4A017]" />
                  Select File From Computer
                </span>
              </div>
            </div>
          )}

          {/* STEP 2: PREVIEW & VALIDATION TABLE */}
          {step === 'preview' && (
            <div className="space-y-6">
              {/* Loaded File Info */}
              {fileName && (
                <div className="flex items-center justify-between px-4 py-2.5 bg-[#E8F0FA]/70 rounded-xl text-xs text-[#1E4E8C] border border-[#C7DAF3]">
                  <span className="flex items-center gap-2 font-medium">
                    <FileSpreadsheet className="w-4 h-4 text-[#D4A017]" />
                    <span>Loaded spreadsheet: <strong className="font-bold">{fileName}</strong> {fileSize ? `(${fileSize})` : ''}</span>
                  </span>
                  <button
                    type="button"
                    onClick={resetState}
                    className="text-xs font-bold text-[#1E4E8C] hover:underline"
                  >
                    Upload Different File
                  </button>
                </div>
              )}

              {/* Top Summary Banner */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3.5 rounded-2xl bg-[#FCFBF7] border border-[#F3E7C4] text-left">
                  <span className="text-[10px] font-bold text-gray-500 uppercase block">Total Rows</span>
                  <span className="font-heading text-xl font-bold text-[#14263F]">{counts.total}</span>
                </div>
                <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-left">
                  <span className="text-[10px] font-bold text-emerald-700 uppercase block">Ready to Import</span>
                  <span className="font-heading text-xl font-bold text-emerald-800">{counts.valid}</span>
                </div>
                <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-left">
                  <span className="text-[10px] font-bold text-amber-700 uppercase block">Likely Duplicates</span>
                  <span className="font-heading text-xl font-bold text-amber-800">{counts.duplicate}</span>
                </div>
                <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-left">
                  <span className="text-[10px] font-bold text-rose-700 uppercase block">Invalid / Needs Fix</span>
                  <span className="font-heading text-xl font-bold text-rose-800">{counts.invalid}</span>
                </div>
              </div>

              {/* Navigation Filters and Selection Controls */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-gray-100">
                <div className="flex rounded-xl bg-gray-100 p-1 text-xs font-bold self-start">
                  <button
                    type="button"
                    onClick={() => setActiveTab('all')}
                    className={`px-3 py-1.5 rounded-lg transition-all ${
                      activeTab === 'all' ? 'bg-white text-[#1E4E8C] shadow-xs' : 'text-[#6B7280] hover:text-[#14263F]'
                    }`}
                  >
                    All ({counts.total})
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab('valid')}
                    className={`px-3 py-1.5 rounded-lg transition-all ${
                      activeTab === 'valid' ? 'bg-white text-emerald-700 shadow-xs' : 'text-[#6B7280] hover:text-[#14263F]'
                    }`}
                  >
                    Ready ({counts.valid})
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab('duplicate')}
                    className={`px-3 py-1.5 rounded-lg transition-all ${
                      activeTab === 'duplicate' ? 'bg-white text-amber-700 shadow-xs' : 'text-[#6B7280] hover:text-[#14263F]'
                    }`}
                  >
                    Duplicates ({counts.duplicate})
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab('invalid')}
                    className={`px-3 py-1.5 rounded-lg transition-all ${
                      activeTab === 'invalid' ? 'bg-white text-rose-700 shadow-xs' : 'text-[#6B7280] hover:text-[#14263F]'
                    }`}
                  >
                    Invalid ({counts.invalid})
                  </button>
                </div>

                <div className="flex items-center gap-2 text-xs">
                  <button
                    type="button"
                    onClick={handleSelectAllValid}
                    className="font-bold text-[#1E4E8C] hover:underline"
                  >
                    Select All Ready
                  </button>
                  <span className="text-gray-300">|</span>
                  <button
                    type="button"
                    onClick={handleDeselectAll}
                    className="text-[#6B7280] hover:text-[#14263F]"
                  >
                    Deselect All
                  </button>
                </div>
              </div>

              {/* Table Container */}
              <div className="border border-gray-200 rounded-2xl overflow-hidden bg-white shadow-2xs">
                <div className="overflow-x-auto max-h-96">
                  <table className="min-w-full divide-y divide-gray-200 text-left text-xs">
                    <thead className="bg-[#F8FAFD] sticky top-0 z-10">
                      <tr>
                        <th className="py-3 px-3.5 w-10 text-center font-bold text-[#14263F]">Import?</th>
                        <th className="py-3 px-3 font-bold text-[#14263F]">#</th>
                        <th className="py-3 px-4 font-bold text-[#14263F]">Child Profile</th>
                        <th className="py-3 px-4 font-bold text-[#14263F]">Parent Contact</th>
                        <th className="py-3 px-4 font-bold text-[#14263F]">Focus & Notes</th>
                        <th className="py-3 px-4 font-bold text-[#14263F]">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {filteredRows.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="py-8 text-center text-[#6B7280]">
                            No records match the selected filter.
                          </td>
                        </tr>
                      ) : (
                        filteredRows.map((row) => (
                          <tr
                            key={row.rowIndex}
                            className={`hover:bg-gray-50/80 transition-colors ${
                              row.status === 'invalid'
                                ? 'bg-rose-50/20'
                                : row.status === 'duplicate'
                                ? 'bg-amber-50/20'
                                : ''
                            }`}
                          >
                            {/* Checkbox */}
                            <td className="py-3 px-3.5 text-center">
                              <input
                                type="checkbox"
                                checked={row.selectedForImport}
                                disabled={row.status === 'invalid'}
                                onChange={() => handleToggleRow(row.rowIndex)}
                                className="w-4 h-4 text-[#1E4E8C] rounded border-gray-300 focus:ring-[#1E4E8C] cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                                title={
                                  row.status === 'invalid'
                                    ? 'Cannot import row with validation errors'
                                    : row.status === 'duplicate'
                                    ? 'Excluded by default to prevent duplicate. Check to import anyway.'
                                    : 'Include in import'
                                }
                              />
                            </td>

                            {/* Row Index */}
                            <td className="py-3 px-3 text-[#6B7280] font-mono">
                              {row.rowIndex}
                            </td>

                            {/* Child Details */}
                            <td className="py-3 px-4">
                              <div className="font-bold text-[#14263F]">
                                {row.child_name || <span className="text-rose-600 italic">Missing Name</span>}
                              </div>
                              <div className="text-[11px] text-[#6B7280] flex items-center gap-2 mt-0.5">
                                <span>DOB: {row.child_date_of_birth || 'None'}</span>
                                {row.age_years && (
                                  <span className="px-1.5 py-0.2 rounded bg-blue-100 text-[#1E4E8C] font-semibold text-[10px]">
                                    Age {row.age_years}
                                  </span>
                                )}
                              </div>
                            </td>

                            {/* Parent Details */}
                            <td className="py-3 px-4">
                              <div className="font-medium text-[#14263F]">
                                {row.parent_name || <span className="text-rose-600 italic">Missing Parent</span>}
                              </div>
                              <div className="text-[11px] text-[#6B7280] mt-0.5 flex flex-col">
                                <span>{row.parent_email}</span>
                                {row.parent_phone && <span className="text-gray-400">{row.parent_phone}</span>}
                              </div>
                            </td>

                            {/* Focus & Notes */}
                            <td className="py-3 px-4 max-w-xs truncate">
                              <div className="truncate text-gray-700" title={row.learning_goals}>
                                {row.learning_goals || <span className="text-gray-400 italic">No specific goals</span>}
                              </div>
                              {row.notes && (
                                <div className="text-[10px] text-gray-400 truncate mt-0.5" title={row.notes}>
                                  Note: {row.notes}
                                </div>
                              )}
                            </td>

                            {/* Status */}
                            <td className="py-3 px-4">
                              {row.status === 'valid' && (
                                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800">
                                  <CheckCircle2 className="w-3.5 h-3.5" />
                                  Ready to Import
                                </span>
                              )}
                              {row.status === 'duplicate' && (
                                <div className="space-y-1">
                                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800">
                                    <AlertCircle className="w-3.5 h-3.5" />
                                    Likely Duplicate
                                  </span>
                                  <p className="text-[10px] text-amber-800 leading-tight max-w-[200px]" title={row.duplicateReason || ''}>
                                    {row.duplicateReason}
                                  </p>
                                </div>
                              )}
                              {row.status === 'invalid' && (
                                <div className="space-y-1">
                                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-100 text-rose-800">
                                    <XCircle className="w-3.5 h-3.5" />
                                    Invalid Row
                                  </span>
                                  <ul className="text-[10px] text-rose-700 list-disc list-inside space-y-0.5 max-w-[200px]">
                                    {row.errors.map((err, eIdx) => (
                                      <li key={eIdx}>{err}</li>
                                    ))}
                                  </ul>
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

              {/* Duplicate Advice Note */}
              {counts.duplicate > 0 && (
                <div className="p-3.5 bg-amber-50/70 border border-amber-200 rounded-2xl text-xs text-amber-900 flex items-start gap-2.5">
                  <Info className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                  <p>
                    <strong>Duplicate Policy:</strong> Likely duplicate rows are excluded by default to avoid creating duplicate profiles for the same child. If a row is a genuinely different family case, check its box in the table to import anyway.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* STEP 3: SUMMARY */}
          {step === 'summary' && (
            <div className="space-y-6 py-4 text-center">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto shadow-sm">
                <CheckCircle2 className="w-9 h-9" />
              </div>

              <div className="space-y-1">
                <h3 className="font-heading text-2xl font-bold text-[#1E4E8C]">
                  Bulk Import Successful
                </h3>
                <p className="text-xs text-[#6B7280]">
                  Existing client profiles have been added to your Student Directory.
                </p>
              </div>

              {/* Stats Breakdown */}
              <div className="grid grid-cols-2 gap-3 max-w-md mx-auto">
                <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-center">
                  <span className="text-xs font-bold text-emerald-800 uppercase block">Enrolled</span>
                  <span className="font-heading text-2xl font-bold text-emerald-900">
                    {importedChildren.length}
                  </span>
                  <span className="text-[11px] text-emerald-700 block mt-0.5">student profiles created</span>
                </div>
                <div className="p-4 rounded-2xl bg-gray-50 border border-gray-200 text-center">
                  <span className="text-xs font-bold text-gray-700 uppercase block">Skipped</span>
                  <span className="font-heading text-2xl font-bold text-gray-900">
                    {skippedCount}
                  </span>
                  <span className="text-[11px] text-gray-500 block mt-0.5">
                    ({skippedDuplicatesCount} dupes, {skippedInvalidCount} invalid)
                  </span>
                </div>
              </div>

              {/* List of enrolled students */}
              <div className="bg-[#FCFBF7] border border-[#F3E7C4] rounded-2xl p-4 text-left max-w-xl mx-auto space-y-2 max-h-56 overflow-y-auto">
                <span className="text-[11px] font-bold text-[#1E4E8C] uppercase tracking-wider block">
                  Enrolled Students ({importedChildren.length})
                </span>
                <div className="divide-y divide-gray-200/60">
                  {importedChildren.map((c) => (
                    <div key={c.id} className="py-2 flex items-center justify-between text-xs">
                      <div>
                        <span className="font-bold text-[#14263F]">{c.name}</span>
                        <span className="text-gray-400 ml-2">({c.age_years ? `Age ${c.age_years}` : 'Age N/A'})</span>
                        <div className="text-[11px] text-[#6B7280]">Parent: {c.parent_name} ({c.parent_email})</div>
                      </div>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                        Enrolled
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer / Actions */}
        <div className="p-5 sm:p-6 border-t border-gray-100 bg-gray-50/50 flex flex-col-reverse sm:flex-row items-center justify-between gap-3 shrink-0">
          {step === 'upload' && (
            <>
              <button
                type="button"
                onClick={handleModalClose}
                className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-gray-200 text-xs font-bold text-[#6B7280] hover:text-[#14263F] hover:bg-white transition-all"
              >
                Cancel
              </button>
              <div className="text-xs text-[#6B7280] text-center sm:text-right">
                Select or drop a CSV file to preview student records.
              </div>
            </>
          )}

          {step === 'preview' && (
            <>
              <button
                type="button"
                onClick={() => setStep('upload')}
                disabled={isImporting}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl border border-gray-200 text-xs font-bold text-[#6B7280] hover:text-[#14263F] hover:bg-white transition-all disabled:opacity-50"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                Upload Different File
              </button>

              <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
                <button
                  type="button"
                  onClick={handleModalClose}
                  disabled={isImporting}
                  className="px-4 py-2.5 rounded-xl border border-gray-200 text-xs font-bold text-[#6B7280] hover:text-[#14263F] hover:bg-white transition-all disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirmImport}
                  disabled={counts.selected === 0 || isImporting}
                  className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-[#D4A017] text-white text-xs font-bold hover:bg-[#A9790A] transition-all shadow-sm disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed"
                >
                  {isImporting ? (
                    'Enrolling Students...'
                  ) : (
                    <>
                      <span>Import & Enroll {counts.selected} Student{counts.selected === 1 ? '' : 's'}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </>
                  )}
                </button>
              </div>
            </>
          )}

          {step === 'summary' && (
            <div className="w-full flex justify-end">
              <button
                type="button"
                onClick={handleModalClose}
                className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-[#1E4E8C] text-white text-xs font-bold hover:bg-[#153763] transition-all shadow-md shadow-blue-200"
              >
                Done & View Student Directory
              </button>
            </div>
          )}
        </div>
      </div>
    </AnimatedModal>
  );
}
