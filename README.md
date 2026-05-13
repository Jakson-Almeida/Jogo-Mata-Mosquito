# Mata Mosquito

Jogo arcade no browser: clica nos mosquitos, gere combo, sobrevive ao tempo. Stack: **React (Vite)** + **Node (Express)**.

## Requisitos

- Node.js 18+

## Desenvolvimento

Na raiz do repositório:

```bash
npm install
npm run dev
```

- Frontend: [http://localhost:5173](http://localhost:5173) (Vite)
- API: [http://localhost:3001](http://localhost:3001) (`/api/health`, `/api/scores`)

O Vite faz proxy de `/api` para o servidor Express.

## Produção

```bash
npm run build
npm start
```

O Express serve o build estático do cliente e as rotas `/api/*`.

## Versão clássica (HTML)

O estado anterior (HTML, CSS e JS estáticos) está na branch **`old`**.

```bash
git checkout old
```

## Melhorias face à versão clássica

- **Jogabilidade:** pontuação, combo por acertos seguidos, pausa (Espaço ou P), rondas com duração e ritmo por nível, reinício sem recarregar a página.
- **UI:** tema escuro, cartões de nível, HUD com vidro, animações no mosquito e feedback visual ao acerto.
- **Backend:** API simples para registo opcional de pontuações (`POST /api/scores`).
