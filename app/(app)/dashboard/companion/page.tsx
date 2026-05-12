'use client';

import { Navigation } from '@/components/navigation';
import { motion } from 'framer-motion';
import { MessageCircle, Brain, BookOpen, Heart } from 'lucide-react';
import { ChatInterface } from './components/ChatInterface';

export default function CompanionPage() {
  return (
    <main className="min-h-screen pb-20 md:pb-8">
      <Navigation />

      <div className="pt-16 md:pt-20 px-4 md:px-6">
        <div className="max-w-4xl mx-auto py-6 space-y-6">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center space-y-2"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-primary/10 to-teal/10 border border-primary/20">
              <MessageCircle className="w-4 h-4 text-primary" />
              <span className="text-sm font-semibold text-primary">AI Quran Companion</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-serif font-bold text-foreground">
              Your Personal Quran Mentor
            </h1>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Get personalized guidance on memorization, understanding, and deepening your
              connection with the Quran
            </p>
          </motion.div>

          {/* Features */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="grid md:grid-cols-3 gap-3"
          >
            {[
              {
                icon: Brain,
                title: 'Memorization Help',
                desc: 'Proven techniques and strategies',
                color: 'violet'
              },
              {
                icon: BookOpen,
                title: 'Tafseer & Meanings',
                desc: 'Understand verses deeply',
                color: 'teal'
              },
              {
                icon: Heart,
                title: 'Spiritual Coaching',
                desc: 'Build lasting Quran habits',
                color: 'rose'
              }
            ].map((item, i) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + i * 0.1 }}
                className={`p-4 rounded-2xl bg-gradient-to-br from-${item.color}-muted to-${item.color}/10 border border-${item.color}/30`}
              >
                <item.icon className="w-6 h-6 text-foreground mb-2" />
                <h3 className="font-bold text-foreground text-sm">{item.title}</h3>
                <p className="text-xs text-muted-foreground mt-1">{item.desc}</p>
              </motion.div>
            ))}
          </motion.div>

          {/* Chat Interface */}
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
          >
            <ChatInterface />
          </motion.div>

          {/* Disclaimer */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-xs text-center text-muted-foreground max-w-2xl mx-auto"
          >
            This AI companion provides educational guidance based on authentic Islamic knowledge.
            For religious rulings, please consult qualified scholars.
          </motion.p>
        </div>
      </div>
    </main>
  );
}
