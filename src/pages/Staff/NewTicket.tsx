import { useNavigate } from 'react-router-dom';
import { useState, type ChangeEvent, type FormEvent } from 'react';
import {
  Bug,
  CreditCard,
  HelpCircle,
  Sparkles,
  Wrench,
  UploadCloud,
  X,
  CheckCircle2,
  AlertCircle,
  FileText,
  ArrowRight,
  ArrowLeft,
  Send,
  Ticket as TicketIcon,
  FolderUp,
  type LucideIcon
} from 'lucide-react';
import { addTicket, getCurrentUser, getCategories } from '@/lib/storage';
import type { Ticket, TicketPriority } from '@/types/ticket';
import type { Category } from '@/types/category';

export type CategoryId = string;
export type PriorityId = 'low' | 'medium' | 'high' | 'urgent';

interface PriorityOption {
  id: PriorityId;
  label: string;
  badge: string;
}

interface TicketFormData {
  title: string;
  description: string;
  category: CategoryId;
  priority: PriorityId;
  file: File | null;
}

interface FormErrors {
  title?: string;
  description?: string;
  category?: string;
}

// Icon mapping based on category name or key
const CATEGORY_ICON_MAP: Record<string, LucideIcon> = {
  bug: Bug,
  billing: CreditCard,
  feature: Sparkles,
  technical: Wrench,
  other: HelpCircle,
};

const PRIORITIES: PriorityOption[] = [
  { id: 'low', label: 'Low', badge: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  { id: 'medium', label: 'Medium', badge: 'bg-slate-100 text-[#003b7a] border-slate-200' },
  { id: 'high', label: 'High', badge: 'bg-amber-50 text-amber-700 border-amber-200' },
  { id: 'urgent', label: 'Urgent', badge: 'bg-rose-50 text-rose-700 border-rose-200' },
];

const STEPS_STAFF = [
  { id: 1, title: 'Category & Priority', subtitle: 'Select inquiry scope' },
  { id: 2, title: 'Details & Context', subtitle: 'Fill in ticket information' },
  { id: 3, title: 'Review & Submit', subtitle: 'Confirm before creating ticket' },
];

const STEPS_CUSTOMER = [
  { id: 1, title: 'Category & Priority', subtitle: 'Tell us what this is about' },
  { id: 2, title: 'Details & Attachments', subtitle: 'Describe the issue' },
  { id: 3, title: 'Review & Submit', subtitle: 'Confirm before submitting your complaint' },
];

const PRIORITY_MAP: Record<PriorityId, TicketPriority> = {
  low: 'LOW',
  medium: 'MEDIUM',
  high: 'HIGH',
  urgent: 'CRITICAL',
};

// Maps each role to its dashboard route, since this ticket form is shared
// across staff and customers rather than duplicated per-role.
const DASHBOARD_ROUTE_BY_ROLE: Record<string, string> = {
  admin: '/admin',
  staff: '/staff',
  dispatcher: '/dispatcher',
  agent: '/agent',
  customer: '/customer',
};

// This page is shared by Staff and Customers rather than duplicated — only
// the copy (wording) changes based on who's using it. The form, fields,
// and submit logic are identical for everyone.
const COPY = {
  staff: {
    steps: STEPS_STAFF,
    headerTitle: 'Support Center',
    headerSubtitle: 'Submit an internal ticket to our engineering team',
    step2Heading: 'Ticket Information',
    step2Subheading: 'Provide detailed notes so our engineers can assist',
    titlePlaceholder: 'e.g. Cannot export billing report to PDF',
    descriptionPlaceholder: 'Describe steps to reproduce, error message, or expected behavior...',
    attachmentLabel: 'Attach screenshot or error log',
    step3Heading: 'Review Ticket Details',
    step3Subheading: 'Review the information below before creating the ticket',
    submitLabel: 'Confirm & Create Ticket',
    successTitle: 'Ticket Created Successfully!',
    successBody: 'Your ticket has been dispatched. Our team will review the details and respond shortly.',
    resetLabel: 'Submit Another Ticket',
  },
  customer: {
    steps: STEPS_CUSTOMER,
    headerTitle: 'New Complaint',
    headerSubtitle: 'Create a ticket so our team can look into it',
    step2Heading: 'Complaint Details',
    step2Subheading: 'Provide details so our staff can assist',
    titlePlaceholder: 'e.g. No signal on IPTV since this morning',
    descriptionPlaceholder:
      "Describe the problem in detail — when it started, what you've already tried, error messages, etc.",
    attachmentLabel: 'Attach a photo or document (optional)',
    step3Heading: 'Review Complaint Details',
    step3Subheading: 'Review the information below before submitting',
    submitLabel: 'Confirm & Submit Complaint',
    successTitle: 'Complaint Submitted!',
    successBody: 'Your ticket has been created. Our staff will review it and decide next steps.',
    resetLabel: 'Submit Another Complaint',
  },
};

export default function CreateTicketPage() {
  const navigate = useNavigate();

  // Resolve once per render who's using this page, and pick the matching
  // wording. Everything else (fields, validation, submit) stays identical.
  const currentUser = getCurrentUser();
  const isCustomer = currentUser?.role === 'customer';
  const t = isCustomer ? COPY.customer : COPY.staff;
  const STEPS = t.steps;
  const dashboardRoute = DASHBOARD_ROUTE_BY_ROLE[currentUser?.role ?? ''] ?? '/login';

  // Synchronously load categories from localStorage on initial render
  const [categories] = useState<Category[]>(() => getCategories());

  const [currentStep, setCurrentStep] = useState<number>(1);
  const [formData, setFormData] = useState<TicketFormData>(() => ({
    title: '',
    description: '',
    category: categories[0]?.id || '',
    priority: 'medium',
    file: null,
  }));

  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);

  const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const handleCategorySelect = (categoryId: CategoryId) => {
    setFormData((prev) => ({ ...prev, category: categoryId }));
    if (errors.category) {
      setErrors((prev) => ({ ...prev, category: undefined }));
    }
  };

  const handlePrioritySelect = (priorityId: PriorityId) => {
    setFormData((prev) => ({ ...prev, priority: priorityId }));
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    if (file) {
      setFormData((prev) => ({ ...prev, file }));
    }
  };

  const removeFile = () => {
    setFormData((prev) => ({ ...prev, file: null }));
  };

  const validateStep = (step: number): boolean => {
    const newErrors: FormErrors = {};
    if (step === 1 && !formData.category) {
      newErrors.category = 'Please select a category';
    } else if (step === 2) {
      if (!formData.title.trim()) newErrors.title = 'Title is required';
      if (!formData.description.trim()) newErrors.description = 'Description is required';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep((prev) => Math.min(prev + 1, STEPS.length));
    }
  };

  const handleBack = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  const handleFinalSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!validateStep(1) || !validateStep(2)) return;

    const now = new Date();

    const newTicket: Ticket = {
      id: crypto.randomUUID(),
      title: formData.title,
      description: formData.description,
      priority: PRIORITY_MAP[formData.priority] || 'MEDIUM',
      status: 'NEW',
      category: formData.category,
      createdBy: currentUser ? currentUser.id : '',
      activities: [],
      dispatches: [],
      createdAt: now,
      updatedAt: now,
    };

    addTicket(newTicket);
    setIsSubmitted(true);
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      category: categories[0]?.id || '',
      priority: 'medium',
      file: null,
    });
    setErrors({});
    setCurrentStep(1);
    setIsSubmitted(false);
  };

  const selectedCategoryObj = categories.find((c) => c.id === formData.category);
  const selectedPriorityObj = PRIORITIES.find((p) => p.id === formData.priority);

  // Resolve icon using normalized category name or fallback
  const categoryKey = selectedCategoryObj?.name.toLowerCase() || '';
  const CategoryIcon = CATEGORY_ICON_MAP[categoryKey] || FolderUp;

  return (
    <div className="min-h-screen bg-slate-100/80 flex items-center justify-center p-4 lg:p-8 font-sans text-slate-900">
      <div className="w-full max-w-5xl bg-white rounded-3xl border border-slate-200/80 shadow-xl overflow-hidden min-h-145 flex flex-col">

        {/* Top Header Bar */}
        <header className="px-8 py-5 border-b border-slate-200/80 flex items-center justify-between bg-white shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-[#003b7a] text-white shadow-sm">
              <TicketIcon className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-slate-900">{t.headerTitle}</h1>
              <p className="text-xs text-slate-500">{t.headerSubtitle}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-400">Step {currentStep} of {STEPS.length}</span>
            <div className="w-24 bg-slate-100 h-2 rounded-full overflow-hidden">
              <div
                className="bg-[#003b7a] h-full transition-all duration-300"
                style={{ width: `${(currentStep / STEPS.length) * 100}%` }}
              />
            </div>
          </div>
        </header>

        {isSubmitted ? (
          /* Success Screen */
          <div className="flex-1 flex flex-col items-center justify-center p-12 text-center my-auto">
            <div className="w-16 h-16 bg-emerald-50 text-emerald-600 border border-emerald-200 rounded-full flex items-center justify-center mb-4 shadow-sm">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900">{t.successTitle}</h2>
            <p className="text-slate-500 text-sm max-w-md mt-2 leading-relaxed">
              {t.successBody}
            </p>
            <div className="flex items-center gap-3 mt-6">
              <button
                onClick={resetForm}
                className="px-6 py-2.5 rounded-xl bg-[#003b7a] hover:bg-[#002f61] text-white font-medium text-sm transition-all shadow-md shadow-[#003b7a]/20"
              >
                {t.resetLabel}
              </button>
              <button
                onClick={() => navigate(dashboardRoute)}
                className="px-6 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium text-sm transition-all"
              >
                Go to Dashboard
              </button>
            </div>
          </div>
        ) : (
          /* 2-Column Desktop Grid Layout */
          <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 overflow-hidden">

            {/* LEFT COLUMN: Sidebar Steps & Scope Summary */}
            <div className="lg:col-span-5 bg-slate-50/70 p-6 lg:p-8 border-b lg:border-b-0 lg:border-r border-slate-200/80 flex flex-col justify-between">
              <div>
                <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4">Steps</h2>

                {/* Step Indicator */}
                <div className="space-y-3 mb-8">
                  {STEPS.map((s) => {
                    const isActive = s.id === currentStep;
                    const isDone = s.id < currentStep;
                    return (
                      <div
                        key={s.id}
                        onClick={() => isDone && setCurrentStep(s.id)}
                        className={`relative flex items-start gap-3.5 p-3 rounded-2xl transition-all ${isDone ? 'cursor-pointer hover:bg-slate-200/60' : ''
                          } ${isActive ? 'bg-slate-100/80 font-semibold text-[#003b7a]' : ''}`}
                      >
                        {isActive && (
                          <span className="absolute top-2 bottom-2 left-0 w-1 rounded-r-full bg-[#003b7a]" />
                        )}

                        <div
                          className={`w-7 h-7 rounded-xl flex items-center justify-center text-xs font-semibold shrink-0 mt-0.5 ${isDone
                            ? 'bg-emerald-600 text-white'
                            : isActive
                              ? 'bg-[#003b7a] text-white shadow-sm'
                              : 'bg-slate-200 text-slate-500'
                            }`}
                        >
                          {isDone ? '✓' : s.id}
                        </div>
                        <div>
                          <p className={`text-sm font-semibold ${isActive ? 'text-[#003b7a]' : 'text-slate-600'}`}>
                            {s.title}
                          </p>
                          <p className="text-xs text-slate-400 mt-0.5">{s.subtitle}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Selected Scope Summary */}
                {currentStep > 1 && (
                  <div className="p-4 bg-white rounded-2xl border border-slate-200/90 shadow-sm space-y-3">
                    <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Ticket Scope</p>
                    <div className="flex items-center gap-3">
                      {selectedCategoryObj && (
                        <div className="p-2.5 rounded-xl bg-slate-100 text-[#003b7a]">
                          <CategoryIcon className="w-4 h-4" />
                        </div>
                      )}
                      <div>
                        <p className="text-xs font-semibold text-slate-900">{selectedCategoryObj?.name}</p>
                        <span className={`inline-block text-[10px] px-2 py-0.5 rounded-md border font-semibold mt-1 ${selectedPriorityObj?.badge}`}>
                          {selectedPriorityObj?.label} Priority
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Priority Selection inside Sidebar */}
              {currentStep === 1 && (
                <div className="mt-4 pt-4 border-t border-slate-200/80">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Priority Level</label>
                  <div className="grid grid-cols-2 gap-2">
                    {PRIORITIES.map((p) => {
                      const isSelected = formData.priority === p.id;
                      return (
                        <button
                          key={p.id}
                          type="button"
                          onClick={() => handlePrioritySelect(p.id)}
                          className={`py-2 px-3 rounded-xl text-xs font-semibold border transition-all text-center ${isSelected
                            ? 'bg-[#003b7a] text-white border-[#003b7a] shadow-sm'
                            : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100 hover:text-slate-900'
                            }`}
                        >
                          {p.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* RIGHT COLUMN: Step Content */}
            <div className="lg:col-span-7 p-6 lg:p-8 flex flex-col justify-between">

              {/* STEP 1: Category Selection Grid */}
              {currentStep === 1 && (
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-bold text-slate-900">Select Category</h3>
                    <p className="text-xs text-slate-500 mt-0.5">Choose the topic that best matches your issue</p>
                  </div>

                  <div className="grid grid-cols-1 gap-2.5 max-h-85 overflow-y-auto pr-1">
                    {categories.length === 0 ? (
                      <p className="text-xs text-slate-400 py-4 italic">No categories available.</p>
                    ) : (
                      categories.map((cat) => {
                        const Icon = CATEGORY_ICON_MAP[cat.name.toLowerCase()] || FolderUp;
                        const isSelected = formData.category === cat.id;
                        return (
                          <button
                            key={cat.id}
                            type="button"
                            onClick={() => handleCategorySelect(cat.id)}
                            className={`flex items-center p-3.5 rounded-2xl border text-left transition-all ${isSelected
                              ? 'border-[#003b7a] bg-slate-100/80 ring-2 ring-[#003b7a]/10 shadow-sm'
                              : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'
                              }`}
                          >                            <div className={`p-2.5 rounded-xl mr-3 shrink-0 ${isSelected ? 'bg-[#003b7a] text-white' : 'bg-slate-100 text-slate-500'}`}>
                              <Icon className="w-4 h-4" />
                            </div>
                            <div>
                              <div className={`font-semibold text-sm ${isSelected ? 'text-[#003b7a]' : 'text-slate-900'}`}>
                                {cat.name}
                              </div>
                            </div>
                          </button>
                        );
                      })
                    )}
                  </div>
                  {errors.category && (
                    <p className="text-xs text-rose-500 flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5" /> {errors.category}
                    </p>
                  )}
                </div>
              )}

              {/* STEP 2: Issue Details & Attachments */}
              {currentStep === 2 && (
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-bold text-slate-900">{t.step2Heading}</h3>
                    <p className="text-xs text-slate-500 mt-0.5">{t.step2Subheading}</p>
                  </div>

                  {/* Title Field */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-400">Subject</label>
                    <input
                      type="text"
                      name="title"
                      value={formData.title}
                      onChange={handleInputChange}
                      placeholder={t.titlePlaceholder}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-900 text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#003b7a]/20 focus:border-[#003b7a]"
                    />
                    {errors.title && <p className="text-xs text-rose-500">{errors.title}</p>}
                  </div>

                  {/* Description Field */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-400">Description</label>
                    <textarea
                      name="description"
                      rows={3}
                      value={formData.description}
                      onChange={handleInputChange}
                      placeholder={t.descriptionPlaceholder}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-900 text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#003b7a]/20 focus:border-[#003b7a] resize-none"
                    />
                    {errors.description && <p className="text-xs text-rose-500">{errors.description}</p>}
                  </div>

                  {/* Attachment Zone */}
                  <div className="pt-1">
                    {!formData.file ? (
                      <label className="flex items-center gap-3 p-3 border-2 border-dashed border-slate-200 rounded-2xl cursor-pointer hover:border-[#003b7a] hover:bg-slate-50 transition-all">
                        <UploadCloud className="w-5 h-5 text-[#003b7a] shrink-0" />
                        <div>
                          <p className="text-xs font-semibold text-slate-700">{t.attachmentLabel}</p>
                          <p className="text-[10px] text-slate-400">PNG, JPG, PDF up to 10MB</p>
                        </div>
                        <input type="file" className="hidden" onChange={handleFileChange} />
                      </label>
                    ) : (
                      <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200">
                        <div className="flex items-center gap-2 overflow-hidden">
                          <FileText className="w-4 h-4 text-[#003b7a] shrink-0" />
                          <span className="text-xs font-medium text-slate-700 truncate">{formData.file.name}</span>
                        </div>
                        <button type="button" onClick={removeFile} className="text-slate-400 hover:text-slate-600">
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* STEP 3: Review Ticket Details Before Submit */}
              {currentStep === 3 && (
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-bold text-slate-900">{t.step3Heading}</h3>
                    <p className="text-xs text-slate-500 mt-0.5">{t.step3Subheading}</p>
                  </div>

                  <div className="bg-slate-50/80 p-4 rounded-2xl border border-slate-200 space-y-3">
                    <div className="flex justify-between items-center pb-2 border-b border-slate-200/80">
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Category</p>
                        <p className="text-xs font-semibold text-[#003b7a]">{selectedCategoryObj?.name}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Priority</p>
                        <p className="text-xs font-semibold text-slate-900 capitalize">{formData.priority}</p>
                      </div>
                    </div>

                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Subject</p>
                      <p className="text-xs font-semibold text-slate-900 mt-0.5">{formData.title}</p>
                    </div>

                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Description</p>
                      <p className="text-xs text-slate-700 mt-1 leading-relaxed bg-white p-3 rounded-xl border border-slate-200 max-h-24 overflow-y-auto whitespace-pre-wrap">
                        {formData.description}
                      </p>
                    </div>

                    {formData.file && (
                      <div className="pt-1 flex items-center gap-2 text-xs text-slate-500">
                        <FileText className="w-3.5 h-3.5 text-[#003b7a]" />
                        <span>Attached file: <strong className="text-slate-800">{formData.file.name}</strong></span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Bottom Action Footer */}
              <div className="pt-4 border-t border-slate-100 flex items-center justify-between mt-auto">
                {currentStep > 1 ? (
                  <button
                    type="button"
                    onClick={handleBack}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-slate-500 text-xs font-semibold hover:bg-slate-100 hover:text-slate-900 transition-all"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" /> Back
                  </button>
                ) : (
                  <span />
                )}

                {currentStep < STEPS.length ? (
                  <button
                    type="button"
                    onClick={handleNext}
                    className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-[#003b7a] hover:bg-[#002f61] text-white text-xs font-semibold transition-all shadow-md shadow-[#003b7a]/20 ml-auto"
                  >
                    Continue <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleFinalSubmit}
                    className="inline-flex items-center gap-1.5 px-6 py-2.5 rounded-xl bg-[#003b7a] hover:bg-[#002f61] text-white text-xs font-semibold transition-all shadow-md shadow-[#003b7a]/20 ml-auto"
                  >
                    {t.submitLabel} <Send className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

            </div>
          </div>
        )}
      </div>
    </div>
  );
}
