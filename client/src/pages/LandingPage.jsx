import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles, Users, Rocket, ShieldCheck } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground overflow-hidden relative selection:bg-primary/30">
      
      {/* Abstract Background Shapes */}
      <div className="absolute top-[-20%] right-[-10%] w-[800px] h-[800px] bg-primary/20 rounded-full blur-[120px] pointer-events-none opacity-50 animate-pulse delay-700 mix-blend-multiply dark:mix-blend-screen"></div>
      <div className="absolute bottom-[-10%] left-[-10%] w-[600px] h-[600px] bg-secondary/30 rounded-full blur-[100px] pointer-events-none opacity-60 animate-pulse mix-blend-multiply dark:mix-blend-screen"></div>

      {/* Navbar (Landing Specific) */}
      <nav className="w-full flex items-center justify-between px-8 py-6 z-50">
         <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-primary text-primary-foreground flex items-center justify-center font-bold">S</div>
            <span className="font-serif font-bold text-xl tracking-tight">StudentFlow</span>
         </div>
         <div className="flex gap-4">
            <Link to="/login">
              <Button variant="ghost" className="hover:bg-primary/5 rounded-full px-6">Login</Button>
            </Link>
            <Link to="/register">
              <Button className="rounded-full px-6 shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-shadow">Get Started</Button>
            </Link>
         </div>
      </nav>

      {/* Hero Section */}
      <main className="flex-1 flex flex-col items-center justify-center text-center px-4 relative z-10 mt-[-80px]">
         <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass border-primary/20 text-primary text-sm font-medium mb-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
           <Sparkles className="h-4 w-4" />
           <span>V2.0 Now Live: Enhanced Study Groups</span>
         </div>
         
         <h1 className="text-5xl md:text-7xl font-serif font-bold tracking-tight max-w-4xl leading-[1.1] mb-6 animate-in fade-in slide-in-from-bottom-8 duration-1000">
           Collaborate. Create. <br/>
           <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-teal-400">Excel Together.</span>
         </h1>
         
         <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mb-10 leading-relaxed animate-in fade-in slide-in-from-bottom-12 duration-1000 delay-200">
           The premier academic platform connecting students for meaningful collaboration, ambitious projects, and career-defining internships.
         </p>
         
         <div className="flex flex-col sm:flex-row gap-4 animate-in fade-in slide-in-from-bottom-16 duration-1000 delay-300">
           <Link to="/register">
             <Button size="lg" className="h-14 px-8 text-lg rounded-full shadow-xl shadow-primary/25 hover:shadow-primary/40 hover:-translate-y-1 transition-all">
               Start Collaborating <ArrowRight className="ml-2 h-5 w-5" />
             </Button>
           </Link>
           <Link to="/groups">
             <Button size="lg" variant="outline" className="h-14 px-8 text-lg rounded-full glass hover:bg-white/50 border-primary/20 hover:border-primary/50 transition-all">
               Explore Groups
             </Button>
           </Link>
         </div>

         {/* Feature Grid Preview */}
         <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-20 max-w-5xl w-full px-4 animate-in fade-in slide-in-from-bottom-20 duration-1000 delay-500">
            {[
              { icon: Users, title: "Study Groups", desc: "Find peers who match your learning style and pace." },
              { icon: Rocket, title: "Project Hub", desc: "Launch ambitious projects with diverse teams." },
              { icon: ShieldCheck, title: "Verified Internships", desc: "Exclusive opportunities curated for your major." }
            ].map((feature, i) => (
              <div key={i} className="glass p-6 rounded-3xl text-left border-t border-white/60 hover:-translate-y-2 transition-transform duration-300">
                <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary mb-4">
                  <feature.icon className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-bold font-serif mb-2">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.desc}</p>
              </div>
            ))}
         </div>
      </main>

      <footer className="py-8 text-center text-sm text-muted-foreground relative z-10">
        <p>© 2026 StudentFlow. Crafted for Academic Excellence.</p>
      </footer>
    </div>
  );
}
