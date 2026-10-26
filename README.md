# Лабораторные работы по Web3

Проект содержит результаты лабораторных работ 2–4: контракт гостевой книги `Poster`, токен ERC-20 `LabToken`, контракт `TokenGatedPoster`, тесты Truffle и пользовательский интерфейс Next.js.

## Развёрнутые контракты Sepolia

- Poster: `0x8dCb41B34f56297BC311E5376c4599983d857c58`
- LabToken: `0x6b5ADc5E76256cCB67f07764b59FDCC748876307`
- TokenGatedPoster: `0x992d976Cf778312A4Fde8fD4c1174492a58f8FDE`

Все три контракта имеют точное совпадение исходного кода и байткода в Sourcify.

## Проверка

```text
npm install
npm run compile
npm run test
```

Интерфейс находится в каталоге `ui`. Для работы требуется MetaMask с выбранной сетью Ethereum Sepolia.

Секретные фразы, закрытые ключи и пароли в репозиторий не включены.
