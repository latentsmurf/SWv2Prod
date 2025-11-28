"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import {
  Clapperboard, Users, Shirt, MapPin, Box, Video, Wand2, Layers,
  Film, Camera, Music, Settings, Check, ChevronDown, ChevronUp,
  Play, ArrowRight, Sparkles, MonitorPlay, Smartphone, Zap, Clock
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ModeToggle } from "@/components/mode-toggle";

export default function Home() {
  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-[#050505] text-zinc-100 selection:bg-primary selection:text-black">
      {/* Background Image */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <Image
          src="/hero-background.png"
          alt="SceneWeaver Pro Background"
          fill
          className="object-cover opacity-40"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#050505]/80 to-[#050505]" />
      </div>

      {/* Navigation */}
      <nav className="relative z-50 flex w-full items-center justify-between px-6 py-6 max-w-7xl mx-auto">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-full bg-primary/20 border border-primary/50 flex items-center justify-center">
            <span className="text-primary font-bold">S</span>
          </div>
          <span className="text-xl font-bold tracking-tighter">SceneWeaver</span>
        </div>
        <div className="hidden md:flex items-center gap-8 text-sm font-medium text-zinc-400">
          <a href="#features" className="hover:text-white transition-colors">Features</a>
          <a href="#how-it-works" className="hover:text-white transition-colors">How it Works</a>
          <a href="#pricing" className="hover:text-white transition-colors">Pricing</a>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/production">
            <Button variant="ghost" className="text-zinc-300 hover:text-white hover:bg-white/5">
              Sign In
            </Button>
          </Link>
          <Link href="/new-project">
            <Button className="bg-primary text-black hover:bg-primary/90 font-bold rounded-full">
              Start Project
            </Button>
          </Link>
          <ModeToggle />
        </div>
      </nav>

      <main className="relative z-10 flex flex-col items-center w-full">

        {/* 1. Hero Section */}
        <section className="w-full max-w-5xl mx-auto px-6 pt-20 pb-32 sm:pt-32 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 mb-8 backdrop-blur-sm">
            <span className="flex h-2 w-2 rounded-full bg-primary animate-pulse"></span>
            <span className="text-xs font-medium text-zinc-300">AI video that works like a real film studio</span>
          </div>

          <h1 className="text-5xl sm:text-7xl md:text-8xl font-bold tracking-tighter mb-8 leading-[1.1]">
            From casting to final cut <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-white">all inside one AI studio</span>
          </h1>

          <p className="max-w-2xl mx-auto text-lg sm:text-xl text-zinc-400 mb-10 leading-relaxed">
            SceneWeaver is an AI production studio that thinks like a filmmaker. Cast characters, choose wardrobe, scout locations, pick props, then generate storyboards, previs, and edit-ready videos from scripts, PDFs, or simple ideas.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full sm:w-auto mb-16">
            <Link href="/new-project" className="w-full sm:w-auto">
              <Button size="lg" className="w-full sm:w-auto px-8 py-6 text-lg rounded-full bg-primary text-black font-bold hover:bg-primary/90 hover:scale-105 transition-all">
                Start a new project
              </Button>
            </Link>
            <Button size="lg" variant="outline" className="w-full sm:w-auto px-8 py-6 text-lg rounded-full border-white/10 hover:bg-white/5 backdrop-blur-sm">
              <Play className="mr-2 h-4 w-4" /> Watch a sample film
            </Button>
          </div>

          <div className="pt-8 border-t border-white/5">
            <p className="text-sm text-zinc-500 mb-6">Trusted by directors, agencies, and studios experimenting with AI-first production.</p>
            <div className="flex flex-wrap justify-center gap-8 opacity-40 grayscale">
              {/* Placeholders for logos */}
              {['Studio A', 'Agency B', 'Production C', 'Brand D'].map((logo) => (
                <span key={logo} className="text-lg font-bold font-serif">{logo}</span>
              ))}
            </div>
          </div>
        </section>

        {/* 2. Why SceneWeaver */}
        <section className="w-full bg-zinc-900/30 border-y border-white/5 py-24">
          <div className="max-w-7xl mx-auto px-6">
            <div className="grid md:grid-cols-2 gap-16 items-center">
              <div>
                <h2 className="text-3xl sm:text-4xl font-bold mb-6">AI that understands the <br />production pipeline</h2>
                <p className="text-lg text-zinc-400 mb-8 leading-relaxed">
                  Most AI video tools are just prompt boxes. SceneWeaver is built around the way real films get made.
                </p>
                <p className="text-lg text-zinc-400 mb-8 leading-relaxed">
                  Start by assembling your production package – cast, wardrobe, locations, and props – from a rich visual library. Then let AI help you break down scripts into scenes and shots, generate consistent storyboards, and build a shareable cut with voiceover and music.
                </p>
                <div className="p-4 bg-primary/10 border border-primary/20 rounded-lg mb-8">
                  <p className="font-medium text-primary">You are not just typing prompts. You are directing a film.</p>
                </div>
              </div>
              <div className="space-y-6">
                {[
                  { title: "Film-first workflow", desc: "Casting, wardrobe, locations, props, scenes, shots, coverage." },
                  { title: "Library-driven", desc: "Thousands of reusable faces, outfits, locations, and props, plus AI to generate new ones." },
                  { title: "Continuity by default", desc: "Once you set your cast and look, SceneWeaver keeps it consistent across scenes and shots." },
                  { title: "Fast handoff", desc: "Export to MP4, 4K, EDL/XML for Resolve or Premiere, or share storyboards as PDFs." }
                ].map((item, i) => (
                  <div key={i} className="flex gap-4">
                    <div className="h-10 w-10 rounded-full bg-white/5 flex items-center justify-center shrink-0 border border-white/10">
                      <Check className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-bold text-lg mb-1">{item.title}</h3>
                      <p className="text-zinc-400">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* 3. Designed for real production */}
        <section className="w-full py-24 max-w-7xl mx-auto px-6">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl sm:text-5xl font-bold mb-6">Built for how directors, agencies, and studios actually work</h2>
            <p className="text-xl text-zinc-400">SceneWeaver does not replace your process. It accelerates it. The platform mirrors the steps of a traditional production so your team can move faster without losing control.</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: Users, title: "Pre-production libraries", desc: "Cast, wardrobe, locations, and props live in curated libraries. Generate bespoke options with AI, then save them for next time." },
              { icon: Clapperboard, title: "Script and scene breakdown", desc: "Paste a script, upload a PDF, dictate a story, or generate one with AI. SceneWeaver splits it into scenes and links assets." },
              { icon: Camera, title: "Coverage and shot planning", desc: "Auto-generate shot lists with coverage presets. Fine-tune shot types, assign assets, and lock the style." },
              { icon: MonitorPlay, title: "Storyboard to edit", desc: "Turn shot lists into visual storyboards. Send them to the editor to add timing, voiceover, and music." }
            ].map((item, i) => (
              <div key={i} className="glass-card p-8 rounded-2xl border border-white/5 hover:border-primary/30 transition-all group">
                <div className="h-12 w-12 rounded-xl bg-white/5 flex items-center justify-center mb-6 group-hover:bg-primary/20 group-hover:text-primary transition-colors">
                  <item.icon className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-bold mb-3">{item.title}</h3>
                <p className="text-zinc-400 text-sm leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* 4. How it works */}
        <section id="how-it-works" className="w-full bg-zinc-900/30 border-y border-white/5 py-24">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-16">
              <h2 className="text-3xl sm:text-5xl font-bold mb-4">From idea to cut in four stages</h2>
            </div>

            <div className="grid md:grid-cols-4 gap-8 relative">
              {/* Connecting Line (Desktop) */}
              <div className="hidden md:block absolute top-12 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-white/10 to-transparent -z-10" />

              {[
                { step: "01", title: "Build your production package", items: ["Browse or generate cast & assets", "Pin choices to project", "Keep continuity"] },
                { step: "02", title: "Import or generate your story", items: ["Paste text or upload PDF", "AI structured breakdown", "Assign assets per scene"] },
                { step: "03", title: "Plan coverage & generate boards", items: ["Choose coverage presets", "Generate shot list", "Create visual storyboards"] },
                { step: "04", title: "Edit, add audio, and export", items: ["Timeline editor", "Voiceover & music", "Export MP4 or EDL/XML"] }
              ].map((stage, i) => (
                <div key={i} className="relative bg-[#050505] p-6 rounded-xl border border-white/5">
                  <div className="text-4xl font-bold text-white/10 mb-4">{stage.step}</div>
                  <h3 className="text-xl font-bold mb-4 h-14">{stage.title}</h3>
                  <ul className="space-y-3">
                    {stage.items.map((item, j) => (
                      <li key={j} className="flex items-start gap-2 text-sm text-zinc-400">
                        <div className="h-1.5 w-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 5. Feature Grid */}
        <section id="features" className="w-full py-24 max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-5xl font-bold">Key capabilities</h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon: Users, title: "Casting library", desc: "A growing library of AI-ready faces and characters. Filter by age, look, archetype, and vibe. Generate new cast members and reuse them across projects." },
              { icon: Box, title: "Wardrobe, locations, & props", desc: "Libraries for outfits, interiors, exteriors, and props that match real production needs. Generate and save custom looks as you go." },
              { icon: Clapperboard, title: "Script and shot engine", desc: "Turn scripts or ideas into structured scenes and camera plans. Use coverage presets, refine shot types, then lock your plan." },
              { icon: Layers, title: "Storyboard and previs", desc: "Batch generate images for every shot using your chosen style and models. Review, tweak, and export full storyboards." },
              { icon: Music, title: "Editor and audio tools", desc: "Drag-and-drop timeline, automatic timing, integrated AI voiceover and music. Create animatics and pitch films in the browser." },
              { icon: Settings, title: "Credits, teams, & admin", desc: "Credit-based billing, project-level analytics, admin dashboards, and fine control over which AI models are available per team." }
            ].map((feat, i) => (
              <div key={i} className="glass-card p-8 rounded-2xl border border-white/5 hover:border-white/20 transition-all">
                <feat.icon className="h-8 w-8 text-zinc-400 mb-6" />
                <h3 className="text-xl font-bold mb-3">{feat.title}</h3>
                <p className="text-zinc-400 text-sm leading-relaxed">{feat.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* 6. ACT Studio Highlight */}
        <section className="w-full py-12 px-6">
          <div className="max-w-7xl mx-auto rounded-3xl bg-gradient-to-br from-purple-900/20 to-blue-900/20 border border-white/10 p-8 md:p-16 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-primary/5 to-transparent pointer-events-none" />

            <div className="relative z-10 max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 mb-6">
                <Sparkles className="h-3 w-3 text-purple-400" />
                <span className="text-xs font-medium text-purple-300">New Feature</span>
              </div>

              <h2 className="text-3xl sm:text-5xl font-bold mb-6">ACT Studio – bring your characters to life from webcam</h2>
              <p className="text-lg text-zinc-300 mb-8 leading-relaxed">
                For performance-driven work, ACT Studio turns simple webcam clips into animated characters. Record yourself, stylize the first frame, and let AI transfer your motion to a character. Perfect for previs, animated explainers, and testing performance beats.
              </p>

              <Button className="bg-white text-black hover:bg-zinc-200 rounded-full px-8 py-6 font-bold">
                Try ACT Studio
              </Button>
            </div>
          </div>
        </section>

        {/* 7. Micro Drama / Vertical Series */}
        <section className="w-full py-12 px-6">
          <div className="max-w-7xl mx-auto rounded-3xl bg-gradient-to-br from-pink-900/20 to-rose-900/20 border border-pink-500/20 p-8 md:p-16 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-pink-500/5 to-transparent pointer-events-none" />
            <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-pink-500/10 rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10">
              <div className="flex flex-col md:flex-row gap-12 items-start">
                <div className="flex-1">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-pink-500/10 border border-pink-500/20 mb-6">
                    <Smartphone className="h-3 w-3 text-pink-400" />
                    <span className="text-xs font-medium text-pink-300">Vertical Series Mode</span>
                    <span className="text-[10px] font-bold text-pink-400 bg-pink-500/20 px-1.5 py-0.5 rounded">9:16</span>
                  </div>

                  <h2 className="text-3xl sm:text-5xl font-bold mb-6">
                    Built for <span className="text-pink-400">Micro Dramas</span> & Vertical Series
                  </h2>
                  <p className="text-lg text-zinc-300 mb-8 leading-relaxed">
                    Create binge-worthy vertical content like RealShort, ReelShort, and DramaBox. 
                    SceneWeaver understands the 9:16 format with cliffhanger-optimized script tools, 
                    fast-paced shot presets, and episode-to-episode character continuity.
                  </p>

                  <div className="flex flex-wrap gap-3 mb-8">
                    {['CEO Romance', 'Revenge Drama', 'Secret Billionaire', 'Werewolf Fantasy', 'Contract Marriage'].map((genre) => (
                      <span key={genre} className="px-3 py-1.5 bg-white/5 border border-white/10 rounded-full text-sm text-zinc-300">
                        {genre}
                      </span>
                    ))}
                  </div>

                  <Link href="/new-project">
                    <Button className="bg-pink-500 text-white hover:bg-pink-400 rounded-full px-8 py-6 font-bold">
                      Start a Micro Drama
                    </Button>
                  </Link>
                </div>

                {/* Feature Cards */}
                <div className="w-full md:w-80 space-y-4">
                  {[
                    { icon: Smartphone, title: "9:16 Native", desc: "All presets optimized for vertical mobile viewing" },
                    { icon: Zap, title: "Cliffhanger AI", desc: "Script assistant trained on viral micro drama hooks" },
                    { icon: Clock, title: "Episode Batching", desc: "Generate 10-100 episode series with consistent characters" },
                    { icon: Users, title: "Character Lock", desc: "Same faces, same style across every episode" },
                  ].map((feature, i) => (
                    <div key={i} className="flex items-start gap-3 p-4 bg-black/30 rounded-xl border border-white/5">
                      <div className="p-2 bg-pink-500/10 rounded-lg">
                        <feature.icon className="h-4 w-4 text-pink-400" />
                      </div>
                      <div>
                        <h4 className="font-bold text-white text-sm">{feature.title}</h4>
                        <p className="text-xs text-zinc-500">{feature.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 8. Who it is for */}
        <section className="w-full py-24 max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-5xl font-bold">Built for creative teams of all sizes</h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              { title: "Directors and filmmakers", desc: "Quickly turn new ideas or existing scripts into visual plans. Use SceneWeaver for storyboards, previs, and pitch films that make funding and approvals easier." },
              { title: "Agencies and brand teams", desc: "Create repeatable worlds for your brand – consistent cast, locations, and props that can be reused across campaigns. Rapidly mock up films for social and TV." },
              { title: "Solo creators and educators", desc: "Develop recurring characters and worlds for your channel or course. Turn episodes into planned, visualised content instead of one-off prompts." }
            ].map((segment, i) => (
              <div key={i} className="text-center p-6">
                <div className="h-16 w-16 rounded-full bg-white/5 mx-auto flex items-center justify-center mb-6 border border-white/10">
                  <span className="text-2xl font-bold text-zinc-500">{i + 1}</span>
                </div>
                <h3 className="text-xl font-bold mb-4">{segment.title}</h3>
                <p className="text-zinc-400 leading-relaxed">{segment.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* 8. FAQ */}
        <section className="w-full bg-zinc-900/30 border-y border-white/5 py-24">
          <div className="max-w-3xl mx-auto px-6">
            <h2 className="text-3xl font-bold mb-12 text-center">Frequently Asked Questions</h2>
            <FAQAccordion />
          </div>
        </section>

        {/* Footer CTA */}
        <section className="w-full py-32 text-center px-6">
          <h2 className="text-4xl sm:text-6xl font-bold mb-8 tracking-tighter">Ready to start directing?</h2>
          <p className="text-xl text-zinc-400 mb-10 max-w-2xl mx-auto">
            Join the filmmakers and studios building the future of production with SceneWeaver.
          </p>
          <Link href="/new-project">
            <Button size="lg" className="px-10 py-8 text-xl rounded-full bg-primary text-black font-bold hover:bg-primary/90 hover:scale-105 transition-all shadow-[0_0_40px_-10px_rgba(235,255,0,0.3)]">
              Start your first project
            </Button>
          </Link>
        </section>

      </main>
    </div>
  );
}

function FAQAccordion() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const faqs = [
    { q: "What makes SceneWeaver different from other AI video tools?", a: "SceneWeaver follows a real production pipeline. Instead of random one-off generations, you work with libraries of cast, wardrobe, locations, and props, plus structured scenes and shot lists. That means continuity, reuse, and results that feel like a film, not a one-shot experiment." },
    { q: "Do I need to know filmmaking to use SceneWeaver?", a: "No. Coverage presets and guided flows make it easy for non-directors. If you know how to describe a scene, SceneWeaver can help you plan shots and generate visuals." },
    { q: "Can I use my own brand assets and characters?", a: "Yes. You can upload reference images, define house styles and recurring characters, and keep them in your private libraries." },
    { q: "Can I export to my usual editing tools?", a: "Yes. You can export MP4 or 4K video, plus EDL/XML for DaVinci Resolve and Adobe Premiere so you can continue cutting and finishing in your existing pipeline." }
  ];

  return (
    <div className="space-y-4">
      {faqs.map((faq, i) => (
        <div key={i} className="border border-white/10 rounded-lg bg-black/20 overflow-hidden">
          <button
            onClick={() => setOpenIndex(openIndex === i ? null : i)}
            className="w-full flex items-center justify-between p-6 text-left hover:bg-white/5 transition-colors"
          >
            <span className="font-bold text-lg">{faq.q}</span>
            {openIndex === i ? <ChevronUp className="h-5 w-5 text-zinc-400" /> : <ChevronDown className="h-5 w-5 text-zinc-400" />}
          </button>
          {openIndex === i && (
            <div className="p-6 pt-0 text-zinc-400 leading-relaxed border-t border-white/5 bg-white/5">
              {faq.a}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
