import { useNavigate } from 'react-router-dom';
import { ArrowLeft, BookOpen, UserPlus, PenSquare, Share2, Settings, Bell } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { translations } from '../lib/translations';

export function HelpPage() {
  const navigate = useNavigate();
  const { language } = useApp();
  const t = translations[language];

  const steps = [
    { icon: UserPlus,  title: t.help_s1_title, desc: t.help_s1_desc, color: 'emerald' },
    { icon: BookOpen,  title: t.help_s2_title, desc: t.help_s2_desc, color: 'blue'    },
    { icon: PenSquare, title: t.help_s3_title, desc: t.help_s3_desc, color: 'red'     },
    { icon: Share2,    title: t.help_s4_title, desc: t.help_s4_desc, color: 'purple'  },
    { icon: Bell,      title: t.help_s5_title, desc: t.help_s5_desc, color: 'orange'  },
    { icon: Settings,  title: t.help_s6_title, desc: t.help_s6_desc, color: 'gray'    },
  ];

  const faqs = [
    { q: t.faq_q1, a: t.faq_a1 },
    { q: t.faq_q2, a: t.faq_a2 },
    { q: t.faq_q3, a: t.faq_a3 },
    { q: t.faq_q4, a: t.faq_a4 },
  ];

  const colorMap: Record<string, string> = {
    emerald: 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400',
    blue:    'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400',
    red:     'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400',
    purple:  'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400',
    orange:  'bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400',
    gray:    'bg-gray-100 dark:bg-zinc-800 text-gray-600 dark:text-zinc-400',
  };

  return (
    <div className="flex flex-col flex-1 min-h-0 bg-gray-50 dark:bg-zinc-950 transition-colors">
      {/* Header */}
      <div className="bg-emerald-600 text-white p-4 shadow-md shrink-0 flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="p-1 hover:bg-emerald-700 rounded-full transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-lg font-bold">{t.helpSupport}</h1>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Hero */}
        <div className="bg-emerald-600 text-white rounded-2xl p-5 shadow-lg">
          <div className="flex items-center gap-3 mb-1">
            <BookOpen className="w-8 h-8 opacity-80" />
            <div>
              <h2 className="text-lg font-bold">{t.helpHeroTitle}</h2>
              <p className="text-xs opacity-80">{t.helpHeroSub}</p>
            </div>
          </div>
        </div>

        {/* Steps */}
        <div className="space-y-3">
          {steps.map((step, i) => {
            const Icon = step.icon;
            return (
              <div key={i} className="bg-white dark:bg-zinc-900 rounded-2xl p-4 shadow-sm border border-gray-100 dark:border-zinc-800 flex items-start gap-4">
                <div className={`p-2.5 rounded-xl shrink-0 ${colorMap[step.color]}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] font-bold bg-gray-100 dark:bg-zinc-800 text-gray-500 dark:text-zinc-400 px-2 py-0.5 rounded-full">
                      {t.helpStep} {i + 1}
                    </span>
                    <h3 className="font-bold text-sm text-gray-900 dark:text-zinc-100">{step.title}</h3>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-zinc-400 leading-relaxed">{step.desc}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* FAQ */}
        <div className="bg-white dark:bg-zinc-900 rounded-2xl p-4 shadow-sm border border-gray-100 dark:border-zinc-800">
          <h3 className="font-bold text-gray-800 dark:text-zinc-100 mb-3 text-sm">{t.helpFaqTitle}</h3>
          <div className="space-y-3">
            {faqs.map((faq, i) => (
              <div key={i} className="border-b border-gray-50 dark:border-zinc-800 last:border-0 pb-3 last:pb-0">
                <p className="font-semibold text-sm text-gray-800 dark:text-zinc-200 mb-1">{faq.q}</p>
                <p className="text-xs text-gray-500 dark:text-zinc-400 leading-relaxed">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="text-center py-2">
          <p className="text-[10px] text-gray-400 dark:text-zinc-600">Mandal Khata v2.2.0 · Developed by Akshay Mondal</p>
        </div>
      </div>
    </div>
  );
}
