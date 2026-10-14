import React, { useState } from 'react';
import { MessageSquare, Send, Copy, Check, X, Phone, User, GraduationCap } from 'lucide-react';
import { Student, Course } from '../types/academy';
import { formatCurrency, formatDate } from '../utils/calculations';

interface WhatsAppModalProps {
  student: Student;
  course?: Course;
  onClose: () => void;
}

export const WhatsAppModal: React.FC<WhatsAppModalProps> = ({ student, course, onClose }) => {
  const [copied, setCopied] = useState(false);
  const dueAmount = Math.max(0, student.totalFee - student.paidAmount);
  const courseTitle = course ? course.title : 'Course';

  // Templates
  const templates = {
    due: `🙏 *Namaste ${student.parentName || student.fullName} ji*,\n\nYeh *PR ACADEMY* ki taraf se ek zaroori reminder hai.\n\n👤 *Student:* ${student.fullName} (Roll: ${student.rollNo})\n🎯 *Course:* ${student.courseTitle || courseTitle}${student.teacherName ? `\n👨‍🏫 *Teacher:* ${student.teacherName}` : ''}\n💰 *Pending Fees:* *${formatCurrency(dueAmount)}*\n📅 *Due Date:* ${formatDate(student.dueDate)}\n\nKripya samay par payment karein taaki classes bina rukaavat chalti rahein. Payment Google Pay / PhonePe / Cash se kar sakte hain.\n\nDhanyawad,\n*PR ACADEMY Management*`,
    welcome: `🎉 *Welcome to PR ACADEMY!* 🎉\n\n🙏 *Namaste ${student.parentName || student.fullName} ji*,\n\n${student.fullName} ka admission PR ACADEMY mein safalta-purvak ho gaya hai!\n\n🎯 *Course:* ${student.courseTitle || courseTitle}${student.teacherName ? `\n👨‍🏫 *Teacher:* ${student.teacherName} (Mob: ${student.teacherPhone || 'Academy'})` : ''}\n⏰ *Batch Timing:* ${student.batchTiming || 'Jald suchit kiya jayega'}\n💳 *Paid Amount:* ${formatCurrency(student.paidAmount)}\n\nHum aapke bright artistic future ki kamna karte hain!\n\nDhanyawad,\n*PR ACADEMY*`,
    general: `🙏 *Namaste ${student.fullName} ji*,\n\n*PR ACADEMY* se message:\nKal ki *${student.courseTitle || courseTitle}* class samay par hogi (${student.batchTiming || 'regular time'}).\nKripya 10 minute pehle pahuchein.\n\nRegards,\n*PR ACADEMY*`,
  };

  const [messageType, setMessageType] = useState<'due' | 'welcome' | 'general'>(
    dueAmount > 0 ? 'due' : 'welcome'
  );
  const [customText, setCustomText] = useState(
    dueAmount > 0 ? templates.due : templates.welcome
  );

  const handleTemplateChange = (type: 'due' | 'welcome' | 'general') => {
    setMessageType(type);
    setCustomText(templates[type]);
  };

  // Clean phone number (strip spaces, symbols, ensure country code)
  const cleanPhone = (phoneStr: string) => {
    const digits = phoneStr.replace(/\D/g, '');
    if (digits.length === 10) return `91${digits}`;
    return digits;
  };

  const handleSendWhatsApp = () => {
    const phone = cleanPhone(student.whatsapp || student.phone);
    const encoded = encodeURIComponent(customText);
    const url = `https://wa.me/${phone}?text=${encoded}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(customText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="w-full max-w-lg rounded-2xl bg-white shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between bg-gradient-to-r from-emerald-600 to-teal-700 px-5 py-4 text-white">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/20">
              <MessageSquare className="h-5 w-5 text-white" />
            </div>
            <div>
              <h2 className="text-base font-bold">WhatsApp Reminder / Message</h2>
              <p className="text-xs text-emerald-100">
                To: {student.fullName} ({student.whatsapp || student.phone})
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-white/80 hover:bg-white/10 hover:text-white transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 overflow-y-auto space-y-4">
          {/* Student mini info */}
          <div className="flex items-center justify-between rounded-xl bg-slate-50 p-3 border border-slate-200 text-xs">
            <div className="space-y-0.5">
              <div className="flex items-center gap-1.5 font-semibold text-slate-800">
                <User className="h-3.5 w-3.5 text-slate-400" />
                <span>{student.fullName}</span>
                {student.parentName && (
                  <span className="text-slate-400 font-normal">
                    (Guardian: {student.parentName})
                  </span>
                )}
              </div>
              <div className="flex items-center gap-1.5 text-slate-500">
                <GraduationCap className="h-3.5 w-3.5 text-slate-400" />
                <span>{courseTitle}</span>
              </div>
            </div>
            <div className="text-right">
              <span className="text-[11px] text-slate-400 block">Pending Fees</span>
              <span
                className={`font-bold text-sm ${
                  dueAmount > 0 ? 'text-rose-600' : 'text-emerald-600'
                }`}
              >
                {dueAmount > 0 ? formatCurrency(dueAmount) : 'Paid In Full'}
              </span>
            </div>
          </div>

          {/* Template Selector */}
          <div>
            <label className="text-xs font-semibold text-slate-600 mb-1.5 block">
              Message Template Chunein:
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handleTemplateChange('due')}
                className={`px-3 py-2 rounded-xl text-xs font-medium border text-center transition-all ${
                  messageType === 'due'
                    ? 'border-rose-500 bg-rose-50 text-rose-700 font-bold shadow-2xs'
                    : 'border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100'
                }`}
              >
                Fee Reminder
              </button>
              <button
                type="button"
                onClick={() => handleTemplateChange('welcome')}
                className={`px-3 py-2 rounded-xl text-xs font-medium border text-center transition-all ${
                  messageType === 'welcome'
                    ? 'border-emerald-500 bg-emerald-50 text-emerald-700 font-bold shadow-2xs'
                    : 'border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100'
                }`}
              >
                Admission Welcome
              </button>
              <button
                type="button"
                onClick={() => handleTemplateChange('general')}
                className={`px-3 py-2 rounded-xl text-xs font-medium border text-center transition-all ${
                  messageType === 'general'
                    ? 'border-blue-500 bg-blue-50 text-blue-700 font-bold shadow-2xs'
                    : 'border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100'
                }`}
              >
                Class / Batch Notice
              </button>
            </div>
          </div>

          {/* Message Textarea */}
          <div>
            <label className="text-xs font-semibold text-slate-600 mb-1.5 flex justify-between items-center">
              <span>Message Preview (Aap edit bhi kar sakte hain):</span>
              <span className="text-[11px] text-slate-400">WhatsApp formatted</span>
            </label>
            <div className="relative">
              <textarea
                value={customText}
                onChange={(e) => setCustomText(e.target.value)}
                rows={7}
                className="w-full rounded-xl border border-slate-200 bg-emerald-50/20 p-3 text-xs text-slate-800 font-sans focus:border-emerald-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 resize-none shadow-inner"
              />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-slate-200 bg-slate-50 px-5 py-3">
          <button
            type="button"
            onClick={handleCopy}
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition-all shadow-2xs"
          >
            {copied ? (
              <>
                <Check className="h-4 w-4 text-emerald-600" />
                <span className="text-emerald-600 font-bold">Copied!</span>
              </>
            ) : (
              <>
                <Copy className="h-4 w-4 text-slate-500" />
                <span>Copy Message</span>
              </>
            )}
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl px-3 py-2 text-xs font-medium text-slate-500 hover:bg-slate-200/60"
            >
              Cancel
            </button>
            <a
              href={`https://wa.me/${cleanPhone(student.whatsapp || student.phone)}?text=${encodeURIComponent(customText)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 px-4 py-2 text-xs font-bold text-white shadow-md hover:from-emerald-700 hover:to-teal-700 transition-all active:scale-95"
            >
              <Send className="h-4 w-4" />
              <span>WhatsApp Par Bhejein</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
