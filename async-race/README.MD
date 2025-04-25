# 🚗 Async Race

## 📦 Setup

```bash
npm install

npm run dev      # run frontend
npm run start    # run frontend

## ℹ️ API Connection Issues

If the project doesn't work after starting (e.g. no cars displayed or the race doesn't start), it's likely that your local API is running on a different port than `4001`.

🔧 In this case, **open and update the port** in the following files:

- `src/api/api.ts`
- `src/api/engineApi.ts`
- `src/api/winnersApi.ts`

Find the line like:
```ts
const BASE_URL = 'http://127.0.0.1:4001'; just replace 4001 with your local API port.
``