import { useEffect, useState, type FormEvent } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { ArrowLeft, Loader2, Lock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Logo } from "@/components/site/Logo";

export const Route = createFileRoute("/auth")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Entrar | Área administrativa Dmais" },
      { name: "description", content: "Acesso à área administrativa da Dmais Comunicação Visual." },
      { property: "og:title", content: "Área administrativa | Dmais Comunicação Visual" },
      { property: "og:description", content: "Acesso restrito ao painel de conteúdo." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [adminExists, setAdminExists] = useState<boolean | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) navigate({ to: "/admin", replace: true });
    });
    supabase.rpc("admin_exists").then(({ data }) => setAdminExists(Boolean(data)));
  }, [navigate]);

  async function submit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      if (mode === "login") {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        toast.success("Bem-vindo de volta!");
        navigate({ to: "/admin", replace: true });
      } else {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: `${window.location.origin}/auth` },
        });
        if (error) throw error;
        if (data.session) navigate({ to: "/admin", replace: true });
        else {
          toast.success("Conta criada! Confirme pelo link enviado ao seu e-mail e depois entre.");
          setMode("login");
        }
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Erro inesperado";
      toast.error(msg.includes("Invalid login") ? "E-mail ou senha incorretos." : msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="grid min-h-screen bg-background lg:grid-cols-2">
      <div className="relative hidden overflow-hidden border-r border-border bg-ink bg-grid lg:flex lg:flex-col lg:justify-between lg:p-12">
        <Logo />
        <div>
          <p className="eyebrow">Painel administrativo</p>
          <h1 className="display mt-6 text-7xl">Seu site.<br /><span className="text-glow">Sob controle.</span></h1>
          <p className="mt-6 max-w-md text-muted-foreground">Gerencie serviços, portfólio, avaliações e textos da Dmais Comunicação Visual em um só lugar.</p>
        </div>
        <div className="h-4 w-48 hazard" />
      </div>
      <div className="flex items-center justify-center p-6">
        <form onSubmit={submit} className="w-full max-w-sm">
          <Link to="/" className="mb-10 inline-flex items-center gap-2 font-mono text-xs uppercase tracking-widest text-muted-foreground hover:text-primary">
            <ArrowLeft className="size-4" /> Voltar ao site
          </Link>
          <div className="lg:hidden"><Logo /></div>
          <span className="mt-8 grid size-12 place-items-center rounded-sm border border-primary/40 text-primary"><Lock className="size-5" /></span>
          <h2 className="display mt-6 text-4xl">{mode === "login" ? "Entrar" : "Criar administrador"}</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            {mode === "login" ? "Acesso restrito à equipe Dmais." : "A primeira conta criada se torna a administradora do site."}
          </p>
          <div className="mt-8 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">E-mail</Label>
              <Input id="email" type="email" required autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} className="h-12 rounded-sm" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Senha</Label>
              <Input id="password" type="password" required minLength={6} autoComplete={mode === "login" ? "current-password" : "new-password"} value={password} onChange={(e) => setPassword(e.target.value)} className="h-12 rounded-sm" />
            </div>
            <Button type="submit" variant="hero" size="xl" className="w-full" disabled={loading}>
              {loading && <Loader2 className="animate-spin" />} {mode === "login" ? "Entrar no painel" : "Criar conta"}
            </Button>
          </div>
          {adminExists === false && (
            <button type="button" onClick={() => setMode(mode === "login" ? "signup" : "login")} className="mt-6 text-sm text-muted-foreground hover:text-primary">
              {mode === "login" ? "Primeiro acesso? Criar conta de administrador" : "Já tenho conta — entrar"}
            </button>
          )}
        </form>
      </div>
    </div>
  );
}
