"use client";
import { motion } from 'framer-motion';
import Link from 'next/link';
import { Target, BarChart3, BookMarked, Zap } from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen bg-brand-light text-brand-dark selection:bg-brand-accent selection:text-white">
      {/* Navigation */}
      <nav className="p-6 flex justify-between items-center max-w-7xl mx-auto">
        <div className="text-2xl font-black tracking-tighter">PrepOS</div>
        <div className="space-x-4">
          <Link href="/login" className="font-bold text-sm hover:text-brand-accent transition-colors">Login</Link>
          <Link href="/signup" className="bg-brand-dark text-white px-5 py-2.5 rounded-xl font-bold text-sm hover:scale-105 active:scale-95 transition-all">Get Started</Link>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-6 pt-20 pb-32">
        <div className="max-w-3xl">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-6xl md:text-7xl font-black leading-[1.1] tracking-tight mb-8">
              Systematic <span className="text-brand-accent">UPSC</span> practice, simplified.
            </h1>
            <p className="text-xl text-brand-muted font-medium mb-10 leading-relaxed">
              Ditch traditional coaching. Use data, habit-loops, and intelligent analytics to master PYQs and track your physical study progress.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/signup" className="bg-brand-dark text-white px-8 py-4 rounded-2xl font-bold text-lg text-center hover:shadow-xl transition-all">
                Start Your Preparation
              </Link>
              <button className="border border-brand-border px-8 py-4 rounded-2xl font-bold text-lg hover:bg-white transition-all">
                View Features
              </button>
            </div>
          </motion.div>
        </div>

        {/* Feature Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-32">
          <FeatureCard 
            icon={<Target className="w-6 h-6 text-brand-accent" />} 
            title="Daily PYQ Engine" 
            desc="Systematic daily targets based on your exam date." 
          />
          <FeatureCard 
            icon={<BarChart3 className="w-6 h-6 text-status-success" />} 
            title="Mistake Analytics" 
            desc="Track why you get answers wrong—not just that you did." 
          />
          <FeatureCard 
            icon={<BookMarked className="w-6 h-6 text-orange-500" />} 
            title="Book Tracking" 
            desc="Log physical study progress and link it to PYQs." 
          />
          <FeatureCard 
            icon={<Zap className="w-6 h-6 text-purple-500" />} 
            title="Spaced Repetition" 
            desc="Intelligent revision cycles at 1, 3, 7, and 21 days." 
          />
        </div>
      </main>
    </div>
  );
}

function FeatureCard({ icon, title, desc }) {
  return (
    <motion.div 
      whileHover={{ y: -5 }}
      className="p-8 bg-white border border-brand-border rounded-3xl shadow-sm hover:shadow-premium transition-all"
    >
      <div className="mb-4">{icon}</div>
      <h3 className="text-lg font-bold mb-2">{title}</h3>
      <p className="text-brand-muted text-sm leading-relaxed font-medium">{desc}</p>
    </motion.div>
  );
}

// "use client";
// import { motion } from 'framer-motion';
// import Link from 'next/link';
// import { Target, BarChart3, BookMarked, Zap, ArrowRight } from 'lucide-react';

// export default function Home() {
//   return (
//     <div className="min-h-screen bg-brand-light text-brand-dark selection:bg-brand-accent selection:text-white">
//       {/* Navigation */}
//       <nav className="p-6 flex justify-between items-center max-w-7xl mx-auto">
//         <div className="text-2xl font-black tracking-tighter">PrepOS</div>
//         <div className="flex items-center gap-6">
//           <Link href="/login" className="font-bold text-sm hover:text-brand-accent transition-colors">Login</Link>
//           <Link href="/signup" className="bg-brand-dark text-white px-5 py-2.5 rounded-xl font-bold text-sm hover:scale-105 active:scale-95 transition-all">Get Started</Link>
//         </div>
//       </nav>

//       {/* Hero Section */}
//       <main className="max-w-7xl mx-auto px-6 pt-20 pb-32">
//         <div className="max-w-3xl">
//           <motion.div 
//             initial={{ opacity: 0, y: 20 }}
//             animate={{ opacity: 1, y: 0 }}
//             transition={{ duration: 0.6 }}
//           >
//             <h1 className="text-6xl md:text-7xl font-black leading-[1.1] tracking-tight mb-8">
//               Systematic <span className="text-brand-accent">UPSC</span> practice, simplified.
//             </h1>
//             <p className="text-xl text-brand-muted font-medium mb-10 leading-relaxed max-w-2xl">
//               A preparation operating system designed to help you master PYQs, track physical study progress, and maintain consistency through data analytics.
//             </p>
//             <div className="flex flex-col sm:flex-row gap-4">
//               <Link href="/signup" className="bg-brand-dark text-white px-8 py-4 rounded-2xl font-black text-lg text-center hover:shadow-xl transition-all flex items-center justify-center gap-2">
//                 Start Your Journey <ArrowRight size={20} />
//               </Link>
//               <Link href="/login" className="border border-brand-border px-8 py-4 rounded-2xl font-bold text-lg hover:bg-white transition-all text-center">
//                 Resume Preparation
//               </Link>
//             </div>
//           </motion.div>
//         </div>

//         {/* Feature Grid */}
//         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-32">
//           <FeatureCard 
//             icon={<Target className="text-brand-accent" />} 
//             title="Daily PYQ Engine" 
//             desc="Automated daily targets based on your specific exam completion date." 
//           />
//           <FeatureCard 
//             icon={<BarChart3 className="text-status-success" />} 
//             title="Mistake Analytics" 
//             desc="Deep classification of errors to identify conceptual vs. factual gaps." 
//           />
//           <FeatureCard 
//             icon={<BookMarked className="text-orange-500" />} 
//             title="Physical Tracking" 
//             desc="Manage your offline books like Laxmikant with chapter-wise mastery." 
//           />
//           <FeatureCard 
//             icon={<Zap className="text-purple-500" />} 
//             title="Spaced Repetition" 
//             desc="Intelligent revision cycles at 1, 3, 7, and 21 days for maximum retention." 
//           />
//         </div>
//       </main>
//     </div>
//   );
// }

// function FeatureCard({ icon, title, desc }) {
//   return (
//     <motion.div 
//       whileHover={{ y: -8 }}
//       className="p-8 bg-white border border-brand-border rounded-[32px] shadow-sm hover:shadow-premium transition-all"
//     >
//       <div className="bg-brand-light w-12 h-12 rounded-2xl flex items-center justify-center mb-6">
//         {icon}
//       </div>
//       <h3 className="text-lg font-black mb-2">{title}</h3>
//       <p className="text-brand-muted text-sm leading-relaxed font-medium">{desc}</p>
//     </motion.div>
//   );
// }