import React, { useState, useEffect, useRef } from 'react';
import {
  Sparkles,
  MessageSquare,
  X,
  Send,
  ShoppingBag,
  Truck,
  RotateCcw,
  CheckCircle,
  HelpCircle,
  ArrowRight,
  Bot,
  User as UserIcon,
} from 'lucide-react';
import { getProducts, getSiteSettings, getDeliveryZones, trackOrder } from '../../lib/store';
import type { Product, SiteSettings, DeliveryZone } from '../../types';

interface Message {
  id: string;
  sender: 'ai' | 'user';
  text: string;
  products?: Product[];
  timestamp: string;
}

interface AiShoppingAssistantProps {
  navigate: (path: string) => void;
}

export const AiShoppingAssistant: React.FC<AiShoppingAssistantProps> = ({ navigate }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      sender: 'ai',
      text: 'আসসালামু আলাইকুম! আমি R Mart AI শপিং অ্যাসিস্ট্যান্ট। পণ্য খোঁজা, সাইজ বাছাই, ডেলিভারি চার্জ অথবা অর্ডার ট্র্যাকিং সংক্রান্ত যেকোনো প্রশ্ন করতে পারেন। কীভাবে সাহায্য করতে পারি?',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [catalog, setCatalog] = useState<Product[]>([]);
  const [zones, setZones] = useState<DeliveryZone[]>([]);
  const [settings, setSettings] = useState<SiteSettings | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    getProducts({ activeOnly: true }).then(setCatalog);
    getDeliveryZones().then(setZones);
    getSiteSettings().then(setSettings);
  }, []);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  const quickPrompts = [
    '৳২,০০০ এর মধ্যে বেস্ট প্রোডাক্ট দেখাও',
    'ডেলিভারি চার্জ কত ও কতদিন লাগে?',
    'Cash on Delivery কি সারাদেশে পাওয়া যাবে?',
    'আমার অর্ডার ট্র্যাক করো',
  ];

  const handleSend = async (userText: string) => {
    const trimmed = userText.trim();
    if (!trimmed) return;

    const userMsg: Message = {
      id: 'msg_' + Date.now(),
      sender: 'user',
      text: trimmed,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    // Call intelligent engine
    try {
      const response = await generateAiResponse(trimmed, catalog, zones, settings);
      setMessages((prev) => [...prev, response]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: 'err_' + Date.now(),
          sender: 'ai',
          text: 'দুঃখিত, এই মুহূর্তে উত্তর দিতে সমস্যা হচ্ছে। অনুগ্রহ করে আমাদের কাস্টমার কেয়ার হেল্পলাইন 01619415744 এ কল বা হোয়াটসঅ্যাপ করুন।',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* Floating Trigger Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="group relative flex items-center gap-2.5 px-4 py-3.5 rounded-full bg-slate-900 hover:bg-emerald-600 text-white font-bold text-xs sm:text-sm shadow-2xl transition-all duration-300 hover:scale-105 active:scale-95 border-2 border-white/20"
          aria-label="Open AI Shopping Assistant"
        >
          <div className="relative">
            <Sparkles className="w-5 h-5 text-emerald-400 group-hover:text-white transition-colors animate-pulse" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-emerald-400" />
          </div>
          <span className="tracking-tight">R Mart AI Support</span>
          <span className="hidden md:inline text-[11px] font-normal text-emerald-300 bg-white/10 px-2 py-0.5 rounded-full">
            24/7 Live
          </span>
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className="w-[90vw] sm:w-[390px] h-[540px] max-h-[85vh] rounded-3xl bg-white border border-slate-200 shadow-2xl flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-4">
          {/* Header */}
          <div className="p-4 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white flex items-center justify-between shadow-xs">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-emerald-500 text-slate-950 flex items-center justify-center font-bold shadow-md shadow-emerald-500/20">
                <Bot className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h3 className="font-bold text-sm tracking-tight">R Mart AI Assistant</h3>
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                </div>
                <p className="text-[11px] text-slate-300">Daraz/Amazon-grade smart shopping</p>
              </div>
            </div>

            <button
              onClick={() => setIsOpen(false)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
              aria-label="Close Assistant"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Quick Prompts Bar */}
          <div className="px-3 py-2 bg-slate-50 border-b border-slate-200/80 overflow-x-auto flex gap-1.5 scrollbar-none text-[11px]">
            {quickPrompts.map((p, idx) => (
              <button
                key={idx}
                onClick={() => handleSend(p)}
                className="whitespace-nowrap px-2.5 py-1 rounded-full bg-white hover:bg-emerald-50 text-slate-700 hover:text-emerald-700 border border-slate-200 transition-colors font-medium shrink-0"
              >
                {p}
              </button>
            ))}
          </div>

          {/* Messages Stream */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3.5 bg-slate-50/40">
            {messages.map((m) => (
              <div
                key={m.id}
                className={`flex gap-2.5 ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {m.sender === 'ai' && (
                  <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0 mt-0.5">
                    <Bot className="w-4 h-4" />
                  </div>
                )}

                <div
                  className={`max-w-[82%] rounded-2xl p-3 text-xs sm:text-[13px] leading-relaxed ${
                    m.sender === 'user'
                      ? 'bg-emerald-600 text-white rounded-tr-xs'
                      : 'bg-white text-slate-800 border border-slate-200/80 shadow-xs rounded-tl-xs'
                  }`}
                >
                  <p className="whitespace-pre-line">{m.text}</p>

                  {/* Render Product Cards if AI suggested products */}
                  {m.products && m.products.length > 0 && (
                    <div className="mt-3 space-y-2 pt-2 border-t border-slate-100">
                      <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                        Matched Products:
                      </p>
                      {m.products.map((p) => (
                        <div
                          key={p.id}
                          onClick={() => {
                            navigate(`/product/${p.slug || p.id}`);
                            setIsOpen(false);
                          }}
                          className="flex items-center gap-2.5 p-2 rounded-xl bg-slate-50 hover:bg-emerald-50 border border-slate-200 hover:border-emerald-200 transition-all cursor-pointer group"
                        >
                          <img
                            src={p.thumbnail || p.images?.[0] || '/logo.png'}
                            alt={p.name}
                            className="w-11 h-11 rounded-lg object-cover bg-white shrink-0 border border-slate-100"
                          />
                          <div className="flex-1 min-w-0">
                            <h4 className="font-semibold text-slate-900 truncate group-hover:text-emerald-700">
                              {p.name}
                            </h4>
                            <div className="flex items-baseline gap-1.5 mt-0.5">
                              <span className="font-mono font-bold text-slate-900">
                                ৳{(p.salePrice ?? p.price).toLocaleString()}
                              </span>
                              {p.salePrice && p.salePrice < p.price && (
                                <span className="text-[10px] text-slate-400 line-through">
                                  ৳{p.price.toLocaleString()}
                                </span>
                              )}
                            </div>
                          </div>
                          <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-emerald-600 shrink-0" />
                        </div>
                      ))}
                    </div>
                  )}

                  <span
                    className={`block text-[10px] mt-1.5 ${
                      m.sender === 'user' ? 'text-emerald-200 text-right' : 'text-slate-400'
                    }`}
                  >
                    {m.timestamp}
                  </span>
                </div>

                {m.sender === 'user' && (
                  <div className="w-7 h-7 rounded-lg bg-slate-200 text-slate-700 flex items-center justify-center shrink-0 mt-0.5">
                    <UserIcon className="w-4 h-4" />
                  </div>
                )}
              </div>
            ))}

            {isTyping && (
              <div className="flex items-center gap-2 text-xs text-slate-500 bg-white p-3 rounded-2xl w-fit border border-slate-200 shadow-xs">
                <Bot className="w-4 h-4 text-emerald-600 animate-spin" />
                <span>R Mart AI খুঁজছে...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Footer */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend(input);
            }}
            className="p-3 bg-white border-t border-slate-200 flex items-center gap-2"
          >
            <input
              type="text"
              placeholder="পণ্য বা সাহায্য নিয়ে লিখুন..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="flex-1 h-10 px-3.5 rounded-xl bg-slate-100 border border-slate-200 text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-emerald-500 focus:bg-white"
            />
            <button
              type="submit"
              disabled={!input.trim() || isTyping}
              className="h-10 px-3.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 disabled:opacity-40 text-slate-950 font-bold transition-all shadow-xs flex items-center justify-center"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

// Intelligent Smart Response Engine
async function generateAiResponse(
  query: string,
  catalog: Product[],
  zones: DeliveryZone[],
  settings: SiteSettings | null
): Promise<Message> {
  const q = query.toLowerCase();
  const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  // 1. Delivery & Shipping questions
  if (
    q.includes('delivery') ||
    q.includes('ডেলিভারি') ||
    q.includes('চার্জ') ||
    q.includes('shipping') ||
    q.includes('কবে পাব') ||
    q.includes('কত দিন')
  ) {
    const inside = zones.find((z) => z.id.includes('inside') || z.name.toLowerCase().includes('dhaka'));
    const outside = zones.find((z) => z.id.includes('outside'));

    const text = `🚚 R Mart বাংলাদেশব্যাপী দ্রুত হোম ডেলিভারি প্রদান করে:
• ঢাকা সিটির ভেতর: ৳${inside?.charge || 70} (১ থেকে ২ কার্যদিবস)
• ঢাকার বাইরে (সকল ৬৪ জেলা): ৳${outside?.charge || 130} (৩ থেকে ৫ কার্যদিবস)
• ৳${settings?.freeDeliveryThreshold || 2500} টাকার বেশি অর্ডারে ফ্রি ডেলিভারি সুবিধা রয়েছে!`;

    return { id: 'ai_' + Date.now(), sender: 'ai', text, timestamp: time };
  }

  // 2. Cash on Delivery (COD) questions
  if (q.includes('cod') || q.includes('cash on delivery') || q.includes('ক্যাশ অন') || q.includes('হাতে পেয়ে')) {
    const text = `✅ হ্যাঁ! R Mart এ বাংলাদেশের সকল ৬৪ জেলায় ক্যাশ অন ডেলিভারি (Cash on Delivery) সুবিধা আছে।
পার্সেল হাতে পেয়ে খুলে দেখে তারপর ডেলিভারি ম্যানের কাছে টাকা পরিশোধ করতে পারবেন। কোনো অগ্রিম পেমেন্ট বাধ্যতামূলক নয়।`;
    return { id: 'ai_' + Date.now(), sender: 'ai', text, timestamp: time };
  }

  // 3. Return & Exchange questions
  if (q.includes('return') || q.includes('exchange') || q.includes('রিটার্ন') || q.includes('ফেরত')) {
    const text = `🔄 আমাদের রয়েছে ৭ দিনের সহজ এক্সচেঞ্জ গ্যারান্টি:
পণ্য হাতে পাওয়ার পর যদি কোনো ত্রুটি বা সাইজ সমস্যা থাকে, তবে ৭ দিনের মধ্যে সহজেই এক্সচেঞ্জ করতে পারবেন। আমাদের হটলাইনে (01619415744) যোগাযোগ করলে দ্রুত সহায়তা পাবেন।`;
    return { id: 'ai_' + Date.now(), sender: 'ai', text, timestamp: time };
  }

  // 4. Contact / Hotline questions
  if (q.includes('contact') || q.includes('phone') || q.includes('number') || q.includes('নাম্বার') || q.includes('কথা')) {
    const text = `📞 R Mart কাস্টমার কেয়ার যোগাযোগ:
• সরাসরি হটলাইন: ${settings?.phone || '01619415744'}
• WhatsApp চ্যাট: ${settings?.whatsapp || '01619415744'}
• ইমেইল: ${settings?.email || 'ahmedskkawsar43@gmail.com'}
সময়: সকাল ১০:০০ টা থেকে রাত ১০:০০ টা (শনি - বৃহস্পতি)।`;
    return { id: 'ai_' + Date.now(), sender: 'ai', text, timestamp: time };
  }

  // 5. Track Order assistance
  if (q.includes('track') || q.includes('ট্র্যাক') || q.includes('কোথায় আছে')) {
    const text = `📦 আপনার অর্ডার ট্র্যাক করতে "Track Order" পেজে গিয়ে আপনার Order Number (যেমন: RM-1234) এবং ফোন নম্বর দিয়ে চেক করুন। অথবা আপনার অর্ডার আইডিটি এখনই এখানে লিখুন, আমি চেক করে দিচ্ছি।`;
    return { id: 'ai_' + Date.now(), sender: 'ai', text, timestamp: time };
  }

  // 6. Product Recommendation by budget or keyword
  const budgetMatch = q.match(/(\d{3,5})/);
  const targetBudget = budgetMatch ? parseInt(budgetMatch[1], 10) : null;

  let matched = catalog;
  if (targetBudget) {
    matched = matched.filter((p) => (p.salePrice ?? p.price) <= targetBudget);
  }

  // Keyword match
  const keywords = q.split(/\s+/).filter((w) => w.length > 2);
  const filtered = matched.filter((p) => {
    const haystack = `${p.name} ${p.category} ${p.description || ''}`.toLowerCase();
    return keywords.some((k) => haystack.includes(k));
  });

  const finalProds = (filtered.length > 0 ? filtered : matched).slice(0, 3);

  if (finalProds.length > 0) {
    const text = targetBudget
      ? `আপনার বাজেট (৳${targetBudget.toLocaleString()}) অনুযায়ী আমাদের সেরা কিছু কালেকশন:`
      : `আপনার প্রশ্নের সাথে সম্পর্কিত জনপ্রিয় কিছু পণ্য:`;

    return {
      id: 'ai_' + Date.now(),
      sender: 'ai',
      text,
      products: finalProds,
      timestamp: time,
    };
  }

  // Generic helpful answer
  return {
    id: 'ai_' + Date.now(),
    sender: 'ai',
    text: `ধন্যবাদ আপনার বার্তার জন্য! আমাদের স্টোরে ফ্যাশন, গ্যাজেটস, ইলেকট্রনিক্স ও নিত্যপ্রয়োজনীয় প্রিমিয়াম পণ্য রয়েছে। সারাদেশে ক্যাশ অন ডেলিভারিতে অর্ডার করতে "Shop All" মেন্যু ব্রাউজ করুন অথবা সরাসরি হেল্পলাইনে 01619415744 কল করুন।`,
    timestamp: time,
  };
}
