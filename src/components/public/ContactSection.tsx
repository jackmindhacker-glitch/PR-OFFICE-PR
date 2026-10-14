import React, { useState } from 'react';
import {
  Phone,
  MessageSquare,
  Mail,
  MapPin,
  Clock,
  Send,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';
import { AcademySettings } from '../../types/academy';

interface ContactSectionProps {
  settings: AcademySettings;
}

export const ContactSection: React.FC<ContactSectionProps> = ({ settings }) => {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [courseInterest, setCourseInterest] = useState('Dance');
  const [message, setMessage] = useState('');
  const [isSent, setIsSent] = useState(false);

  const cleanPhone = settings.phone.replace(/[^0-9]/g, '') || '919876543210';
  const displayEmail = settings.email || 'magicianpradeeprajput@gmail.com';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim()) return;

    // Compose direct WhatsApp link
    const text = encodeURIComponent(
      `Namaste PR ACADEMY!\nWebsite Inquiry:\n• Name: ${name.trim()}\n• Mobile: ${phone.trim()}\n• Interested Course: ${courseInterest}\n• Note: ${message.trim() || 'Please share details.'}`
    );
    window.open(`https://wa.me/${cleanPhone}?text=${text}`, '_blank');
    setIsSent(true);
  };

  return (
    <section id="contact" className="py-20 relative bg-slate-950 overflow-hidden">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Contact Details (5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            <div className="inline-flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/10 px-3.5 py-1 text-xs font-bold text-amber-300">
              <Phone className="h-3.5 w-3.5 text-amber-400" />
              <span>Get In Touch</span>
            </div>

            <h2 className="text-2xl sm:text-4xl font-black tracking-tight text-white leading-tight">
              Humare Studio Aayein Ya Sampark Karein
            </h2>

            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
              Koi bhi sawal ho ya admission lene se pehle trial session lena ho, humse direct WhatsApp par baat karein ya call karein.
            </p>

            <div className="space-y-4 pt-2">
              <div className="flex items-start gap-3.5 rounded-2xl bg-slate-900/80 p-4 border border-slate-800">
                <MapPin className="h-5 w-5 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <div className="text-xs font-bold text-white">Academy Address</div>
                  <div className="text-xs text-slate-400 mt-0.5">
                    {settings.address || 'PR ACADEMY Studio Complex, Near City Center'}
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-3.5 rounded-2xl bg-slate-900/80 p-4 border border-slate-800">
                <Phone className="h-5 w-5 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <div className="text-xs font-bold text-white">Phone & Admissions Desk</div>
                  <div className="text-xs text-slate-400 mt-0.5 font-mono">
                    {settings.phone || '+91 98765 43210'}
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-3.5 rounded-2xl bg-slate-900/80 p-4 border border-slate-800">
                <Mail className="h-5 w-5 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <div className="text-xs font-bold text-white">Official Email</div>
                  <div className="text-xs text-slate-400 mt-0.5">
                    {displayEmail}
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-3.5 rounded-2xl bg-slate-900/80 p-4 border border-slate-800">
                <Clock className="h-5 w-5 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <div className="text-xs font-bold text-white">Studio Timings</div>
                  <div className="text-xs text-slate-400 mt-0.5">
                    Monday to Saturday: 6:30 AM – 8:30 PM (Sunday by Appointment)
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Message / WhatsApp Form (7 cols) */}
          <div className="lg:col-span-7">
            <div className="rounded-3xl border border-amber-500/20 bg-slate-900/90 p-6 sm:p-8 shadow-2xl backdrop-blur-xl">
              <h3 className="text-lg font-black text-white">
                Quick WhatsApp Inquiry Form
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Form bharein aur direct humare admissions team se WhatsApp par connect karein.
              </p>

              {isSent ? (
                <div className="mt-6 rounded-2xl bg-emerald-950/40 border border-emerald-500/30 p-6 text-center space-y-3">
                  <CheckCircle2 className="mx-auto h-10 w-10 text-emerald-400" />
                  <div className="text-sm font-bold text-white">Inquiry Sent via WhatsApp!</div>
                  <p className="text-xs text-slate-300">
                    Aapka message WhatsApp par open ho chuka hai. Hum jald hi aapse batch timing share karenge.
                  </p>
                  <button
                    onClick={() => setIsSent(false)}
                    className="rounded-xl bg-slate-800 px-4 py-2 text-xs font-bold text-amber-300 hover:bg-slate-700"
                  >
                    Naya Message Bhejein
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="mt-6 space-y-4 text-xs">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="font-semibold text-slate-200 block mb-1">
                        Aapka Naam *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Amit Kumar"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full rounded-xl border border-slate-700 bg-slate-950 p-2.5 text-xs text-white placeholder-slate-500 focus:border-amber-400 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="font-semibold text-slate-200 block mb-1">
                        Mobile Number *
                      </label>
                      <input
                        type="tel"
                        required
                        placeholder="10-digit mobile"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="w-full rounded-xl border border-slate-700 bg-slate-950 p-2.5 text-xs text-white placeholder-slate-500 focus:border-amber-400 focus:outline-none font-mono"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="font-semibold text-slate-200 block mb-1">
                      Kiski Jankari Chahiye? (Course Interest)
                    </label>
                    <select
                      value={courseInterest}
                      onChange={(e) => setCourseInterest(e.target.value)}
                      className="w-full rounded-xl border border-slate-700 bg-slate-950 p-2.5 text-xs text-white focus:border-amber-400 focus:outline-none font-semibold"
                    >
                      <option value="Dance (Bollywood & Hip-Hop)">Dance (Bollywood & Freestyle Hip-Hop)</option>
                      <option value="Meditation & Breathwork">Meditation, Breathwork & Sound Healing</option>
                      <option value="Acting & Camera Drama">Acting, Drama & Camera Modulation</option>
                      <option value="Acoustic Guitar Foundation">Acoustic Guitar & Music Basics</option>
                      <option value="Combo Package">Combo Package (Multiple Courses)</option>
                      <option value="Other / General Query">Other / General Query</option>
                    </select>
                  </div>

                  <div>
                    <label className="font-semibold text-slate-200 block mb-1">
                      Koi Sawal Ya Message
                    </label>
                    <textarea
                      rows={3}
                      placeholder="e.g. Fees aur evening timing ke bare mein batayein..."
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      className="w-full rounded-xl border border-slate-700 bg-slate-950 p-2.5 text-xs text-white placeholder-slate-500 focus:border-amber-400 focus:outline-none resize-none"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-600 px-6 py-3.5 text-xs font-bold text-white shadow-lg shadow-emerald-600/25 hover:from-emerald-500 hover:to-teal-500 active:scale-95 transition-all"
                  >
                    <MessageSquare className="h-4 w-4" />
                    <span>WhatsApp Par Inquiry Bhejein</span>
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
