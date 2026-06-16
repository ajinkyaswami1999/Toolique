import { useState } from 'react';
import SEO from '../components/SEO';
import { Mail, MessageSquare, Send, CheckCircle2 } from 'lucide-react';

export default function Contact() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !message) return;
    
    // Simulate sending message
    setSubmitted(true);
    setName('');
    setEmail('');
    setSubject('');
    setMessage('');
    setTimeout(() => setSubmitted(false), 5000);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 text-left py-6">
      <SEO
        title="Contact Us | Toolique"
        description="Have any feedback, tool suggestions, or questions? Get in touch with the Toolique support team."
      />

      <div className="text-center max-w-2xl mx-auto space-y-4">
        <h1 className="text-3xl md:text-5xl font-black text-slate-900 dark:text-white">Contact Us</h1>
        <p className="text-sm md:text-base text-slate-500 dark:text-slate-400 leading-relaxed">
          We'd love to hear from you. Have suggestions for new tools or found a bug? Let us know!
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
        {/* Contact info column */}
        <div className="md:col-span-4 space-y-6">
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-sm space-y-4">
            <h3 className="font-bold text-slate-800 dark:text-white text-base">Direct Contact</h3>
            <div className="flex items-center gap-3 text-xs text-slate-600 dark:text-slate-400">
              <Mail className="w-5 h-5 text-teal-600 dark:text-teal-400 shrink-0" />
              <div>
                <span className="block font-semibold">General Support:</span>
                <span className="font-mono">support@Toolique</span>
              </div>
            </div>
            <div className="flex items-center gap-3 text-xs text-slate-600 dark:text-slate-400 pt-2">
              <MessageSquare className="w-5 h-5 text-indigo-600 dark:text-indigo-400 shrink-0" />
              <div>
                <span className="block font-semibold">Tool Proposals:</span>
                <span className="font-mono">tools@Toolique</span>
              </div>
            </div>
          </div>
        </div>

        {/* Form column */}
        <div className="md:col-span-8 p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-sm">
          {submitted ? (
            <div className="py-12 text-center space-y-4">
              <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto" />
              <h3 className="text-xl font-bold text-slate-800 dark:text-white">Message Sent Successfully!</h3>
              <p className="text-xs text-slate-500 dark:text-slate-450 max-w-sm mx-auto">
                Thank you for your feedback. Our team will review your message and get back to you shortly if required.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-2">Your Name</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent text-sm text-slate-850 dark:text-white"
                    placeholder="Enter name"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-2">Email Address</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent text-sm text-slate-850 dark:text-white"
                    placeholder="name@example.com"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-2">Subject (Optional)</label>
                <input
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent text-sm text-slate-850 dark:text-white"
                  placeholder="e.g. GST Calculator suggestion"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-2">Your Message</label>
                <textarea
                  required
                  rows={5}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent text-sm text-slate-850 dark:text-white resize-none"
                  placeholder="Write your suggestions or details here..."
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-sm shadow-sm transition flex items-center justify-center gap-1.5"
              >
                <Send className="w-4 h-4" />
                <span>Send Message</span>
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

