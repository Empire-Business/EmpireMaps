import { Link } from 'react-router-dom'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-empire-bg flex items-center justify-center">
      <div className="text-center">
        <p className="font-display text-8xl text-gold-gradient font-semibold mb-4">404</p>
        <h1 className="text-2xl text-empire-text mb-2">Página não encontrada</h1>
        <p className="text-empire-text/50 mb-8">O endereço que você acessou não existe.</p>
        <Link to="/" className="btn-secondary text-sm">
          Voltar ao início
        </Link>
      </div>
    </div>
  )
}
