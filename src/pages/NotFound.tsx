import { Link } from 'react-router-dom'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-empire-bone flex items-center justify-center">
      <div className="text-center">
        <p className="font-display text-[7.5rem] font-bold text-empire-ink tracking-[-0.04em] leading-none mb-4">
          404<sup className="text-[0.3em] font-light text-empire-gold italic align-super">err</sup>
        </p>
        <h1 className="font-display text-[1.75rem] font-semibold text-empire-ink mb-2">Página não encontrada</h1>
        <p className="text-empire-steel text-base mb-8">O endereço que você acessou não existe.</p>
        <Link to="/" className="btn-primary text-sm">
          Voltar ao início
        </Link>
      </div>
    </div>
  )
}
