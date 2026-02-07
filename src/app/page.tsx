export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-blue-900 to-purple-900 p-8 text-white">
      <h1 className="text-6xl font-bold mb-6 animate-pulse">
        GSA Hub Reward
      </h1>
      
      <p className="text-2xl mb-10 max-w-2xl text-center">
        Bem-vindo ao hub central de licenças e recompensas GSA!
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="bg-white/10 backdrop-blur-md p-8 rounded-2xl border border-white/20 hover:border-white/40 transition-all">
          <h2 className="text-2xl font-semibold mb-4">Login</h2>
          <p>Acesse seu painel</p>
        </div>
        
        <div className="bg-white/10 backdrop-blur-md p-8 rounded-2xl border border-white/20 hover:border-white/40 transition-all">
          <h2 className="text-2xl font-semibold mb-4">Indicações</h2>
          <p>Ganhe créditos indicando</p>
        </div>
        
        <div className="bg-white/10 backdrop-blur-md p-8 rounded-2xl border border-white/20 hover:border-white/40 transition-all">
          <h2 className="text-2xl font-semibold mb-4">Carteira</h2>
          <p>Descontos até 80%</p>
        </div>
      </div>

      <p className="mt-12 text-sm opacity-70">
        Projeto rodando com Next.js 15 + Tailwind v4
      </p>
    </main>
  );
}