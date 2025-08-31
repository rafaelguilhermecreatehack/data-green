import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/layout/Header";
import HeroSection from "@/components/sections/HeroSection";
import Footer from "@/components/layout/Footer";
import { supabase } from "@/integrations/supabase/client";

const Index = () => {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        navigate("/dashboard");
      }
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setUser(session?.user ?? null);
        if (session?.user) {
          navigate("/dashboard");
        }
      }
    );

    return () => subscription.unsubscribe();
  }, [navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Carregando...</p>
        </div>
      </div>
    );
  }

  // Only show landing page if user is not authenticated
  if (user) {
    return null; // Will redirect to dashboard
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <HeroSection />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
