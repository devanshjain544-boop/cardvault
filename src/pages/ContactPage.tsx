import React, { useState } from 'react';
import { Mail, Phone, MapPin, Clock, Send, CheckCircle2 } from 'lucide-react';

interface ContactPageProps {
  navigate: (path: string) => void;
}

export const ContactPage: React.FC<ContactPageProps> = ({ navigate }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
      <div className="text-center space-y-3">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-stone-950 font-serif">Contact CardVault</h1>
        <p className="text-xs sm:text-sm text-stone-600 max-w-lg mx-auto">
          Need assistance verifying an order, tracking your shipment, or sourcing a specific collectible? Our collector support team is here to assist.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Contact Info Col */}
        <div className="lg:col-span-5 space-y-6">
          <div className="p-6 rounded-2xl bg-white border border-stone-200 space-y-4 shadow-xs">
            <h2 className="text-sm font-bold text-stone-900 uppercase tracking-wider">Vault Headquarters</h2>
            <div className="space-y-4 text-xs text-stone-600">
              <div className="flex items-start gap-3">
                <MapPin className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-stone-900">CardVault Fulfillment Center</p>
                  <p className="text-stone-500">Bandra West, Mumbai, Maharashtra 400050, India</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-amber-600 shrink-0" />
                <div>
                  <p className="font-bold text-stone-900">Email Inquiries</p>
                  <a href="mailto:support@cardvault.in" className="text-amber-700 hover:underline">
                    support@cardvault.in
                  </a>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Phone className="w-4 h-4 text-amber-600 shrink-0" />
                <div>
                  <p className="font-bold text-stone-900">Direct Phone Support</p>
                  <span className="text-stone-700">+91 98765 43210</span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Clock className="w-4 h-4 text-amber-600 shrink-0" />
                <div>
                  <p className="font-bold text-stone-900">Operating Hours</p>
                  <span className="text-stone-500">Monday to Saturday: 10:00 AM – 7:00 PM IST</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Contact Form Col */}
        <div className="lg:col-span-7">
          <div className="p-8 rounded-2xl bg-white border border-stone-200 space-y-6 shadow-xs">
            <h2 className="text-sm font-bold text-stone-900 uppercase tracking-wider">Send a Collector Message</h2>

            {submitted ? (
              <div className="p-6 text-center space-y-2 bg-emerald-50 border border-emerald-200 rounded-xl">
                <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
                <h3 className="text-base font-bold text-stone-950">Message Received</h3>
                <p className="text-xs text-stone-600">
                  Thank you, {name}. Our customer concierge will respond to {email} within 1 business day.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-stone-700 font-semibold mb-1">Your Name *</label>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Vikram Rao"
                      className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-300 rounded-xl text-stone-900 focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div>
                    <label className="block text-stone-700 font-semibold mb-1">Your Email *</label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="vikram@example.com"
                      className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-300 rounded-xl text-stone-900 focus:outline-none focus:border-amber-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-stone-700 font-semibold mb-1">Subject</label>
                  <input
                    type="text"
                    required
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    placeholder="Order inquiry, card verification, sourcing request..."
                    className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-300 rounded-xl text-stone-900 focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-stone-700 font-semibold mb-1">Message *</label>
                  <textarea
                    rows={4}
                    required
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Describe your inquiry..."
                    className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-300 rounded-xl text-stone-900 focus:outline-none focus:border-amber-500"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full sm:w-auto px-6 py-3 bg-amber-400 hover:bg-amber-300 text-stone-950 font-bold rounded-xl flex items-center justify-center gap-2 shadow-xs cursor-pointer"
                >
                  <Send className="w-4 h-4" /> Send Message
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
