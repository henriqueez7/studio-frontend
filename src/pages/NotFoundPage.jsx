import { Home, MoveLeft } from "lucide-react";
import { Link } from "react-router-dom";

export default function NotFoundPage() {
  return (
    <div className="grid min-h-screen place-items-center bg-[#f4f7fb] px-6 py-24">
      <div className="w-full max-w-2xl rounded-[32px] border border-slate-200 bg-white p-10 text-center shadow-[0_20px_60px_rgba(15,23,42,0.08)]">
        <p className="text-sm uppercase tracking-[0.32em] text-[#6d4cad]">Página não encontrada</p>
        <h1 className="mt-5 text-3xl font-semibold text-slate-900 sm:text-4xl">
          Este caminho não existe no Studio Henrique Corte.
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-sm leading-7 text-slate-600 sm:text-base">
          Confira o endereço digitado ou volte para uma área conhecida do sistema.
        </p>

        <Link
          to="/"
          className="mt-8 inline-flex items-center justify-center gap-2 rounded-full bg-[#6d4cad] px-6 py-3 text-sm font-semibold text-white transition hover:brightness-105"
        >
          <MoveLeft className="h-4 w-4" />
          Voltar para o início
        </Link>

        <div className="mt-10 inline-flex h-16 w-16 items-center justify-center rounded-full bg-[#ede7fb] text-[#6d4cad] shadow-[0_12px_24px_rgba(109,76,173,0.12)]">
          <Home className="h-7 w-7" />
        </div>
      </div>
    </div>
  );
}
