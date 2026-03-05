import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Shield, Lock, Server, Eye, AlertCircle } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { translations } from '../lib/translations';

export function PrivacyPage() {
  const navigate = useNavigate();
  const { language } = useApp();
  const t = translations[language];

  const sections = [
    { icon: Server,      title: t.priv_s1_title, content: t.priv_s1_desc, color: 'blue'    },
    { icon: Lock,        title: t.priv_s2_title, content: t.priv_s2_desc, color: 'emerald' },
    { icon: Eye,         title: t.priv_s3_title, content: t.priv_s3_desc, color: 'purple'  },
    { icon: Shield,      title: t.priv_s4_title, content: t.priv_s4_desc, color: 'orange'  },
    { icon: AlertCircle, title: t.priv_s5_title, content: t.priv_s5_desc, color: 'red'     },
  ];

  const colorMap: Record<string, string> = {
    blue:    'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400',
    emerald: 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400',
    purple:  'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400',
    orange:  'bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400',
    red:     'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400',
  };

  return (
    <div className="flex flex-col flex-1 min-h-0 bg-gray-50 dark:bg-zinc-950 transition-colors">
      {/* Header */}
      <div className="bg-emerald-600 text-white p-4 shadow-md shrink-0 flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="p-1 hover:bg-emerald-700 rounded-full transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-lg font-bold">{t.privacyPolicy}</h1>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Hero */}
        <div className="bg-gradient-to-br from-emerald-600 to-emerald-800 text-white rounded-2xl p-5 shadow-lg">
          <div className="flex items-center gap-3 mb-2">
            <Shield className="w-9 h-9 opacity-90" />
            <div>
              <h2 className="text-lg font-bold">{t.privHeroTitle}</h2>
              <p className="text-xs opacity-80">{t.privHeroSub}</p>
            </div>
          </div>
          <p className="text-xs opacity-80 leading-relaxed mt-1">{t.privHeroDesc}</p>
        </div>

        {/* Policy sections */}
        <div className="space-y-3">
          {sections.map((s, i) => {
            const Icon = s.icon;
            return (
              <div key={i} className="bg-white dark:bg-zinc-900 rounded-2xl p-4 shadow-sm border border-gray-100 dark:border-zinc-800 flex items-start gap-4">
                <div className={`p-2.5 rounded-xl shrink-0 ${colorMap[s.color]}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-gray-900 dark:text-zinc-100 mb-1">{s.title}</h3>
                  <p className="text-xs text-gray-500 dark:text-zinc-400 leading-relaxed">{s.content}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Summary badge */}
        <div className="bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-100 dark:border-emerald-900/30 rounded-2xl p-4 text-center">
          <p className="text-xs font-bold text-emerald-800 dark:text-emerald-400">{t.privBadge}</p>
        </div>

        <div className="text-center py-2">
          <p className="text-[10px] text-gray-400 dark:text-zinc-600">March 2026 · Mandal Khata v2.2.0</p>
        </div>
      </div>
    </div>
  );
}
