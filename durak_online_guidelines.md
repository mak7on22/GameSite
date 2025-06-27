# Онлайн «Дурак»: поэтапное руководство (React + ASP.NET, асинхронно)

> **Цель**: разработать многопользовательскую веб‑игру «Дурак» (классический, «подкидной») c фронтендом на React + TypeScript и бэкендом на ASP.NET Core (≥ 8.0). Все взаимодействие клиента с сервером — асинхронное (SignalR + REST).\
> **Стратегия**: отделить *игровое ядро* (чистая C#‑библиотека) от *транспорта* (SignalR hub) и *презентации* (React).

---

## 1. Архитектура верхнего уровня

```text
┌───────────────┐      WebSocket(SignalR)      ┌───────────────────────┐
│  React SPA    │  ←─────────────►──────────── │  ASP.NET Core API     │
│ (TypeScript)  │  ◄─────────────►──────────── │  + SignalR Hub        │
└───────────────┘       HTTP/REST/JSON        └───────────────────────┘
          ▲                                            │
          │                                            ▼
   Service Workers                              Game Engine DLL
          │                                             │
          ▼                                             ▼
  PWA / Offline                               (Pure, Tested Logic)
```

- **Game Engine (C# class‑library)** – никакой сети, только правила.
- **API & Hub** – маршруты REST (создать/список столов) + SignalR Hub (live‑ходы).
- **Client** – React‑SPA, Redux Toolkit или Zustand для состояния.
- **Transport** – WebSocket (SignalR) ⇒ 100 % async/await.

---

## 2. Шаг 1: Создай ядро игры

1. **Проект Class Library** (Durak.Core).
2. Модели: `Card`, `Deck`, `Player`, `Turn`, `GameState`.
3. Паттерн *Immutable + Command*:
   - Команды `PlayCard`, `TakeCards`, `Pass`, `FinishGame`.
   - Методы возвращают *новое* состояние (`GameState Apply(ICommand)`).
4. Тесты xUnit → полное покрытие правил.

### Пример класса карты

```csharp
public readonly record struct Card(Suit Suit, Rank Rank)
{
    public override string ToString() => $"{Rank} of {Suit}";
}
```

---

## 3. Шаг 2: ASP.NET Core backend

### 3.1 Проект + пакеты

```bash
dotnet new web -n Durak.Api
cd Durak.Api
dotnet add package Microsoft.AspNetCore.SignalR
```

### 3.2 Конфигурация

```csharp
var builder = WebApplication.CreateBuilder(args);

builder.Services.AddSignalR();
builder.Services.AddControllers();

builder.Services.AddSingleton<IGameManager, InMemoryGameManager>();

var app = builder.Build();
app.MapControllers();
app.MapHub<GameHub>("/hubs/game");
app.Run();
```

### 3.3 SignalR Hub (асинхронный)

```csharp
public class GameHub : Hub
{
    private readonly IGameManager _gm;
    public GameHub(IGameManager gm) => _gm = gm;

    public async Task JoinTable(string tableId, string player) {
        await Groups.AddToGroupAsync(Context.ConnectionId, tableId);
        await Clients.Group(tableId).SendAsync("PlayerJoined", player);
    }

    public async Task PlayCard(string tableId, CardDto card) {
        var result = await _gm.PlayAsync(tableId, Context.ConnectionId, card);
        await Clients.Group(tableId).SendAsync("State", result);
    }
}
```

- Все публичные методы Hub → `async Task`.
- Игровой менеджер *тоже* async (работа с БД, Redis, etc.).

---

## 4. Шаг 3: React клиент

### 4.1 Базовая настройка

```bash
npm create vite@latest durak-client -- --template react-ts
cd durak-client
npm i @microsoft/signalr zustand immer
```

### 4.2 Хук для SignalR

```ts
import { HubConnectionBuilder } from "@microsoft/signalr";
import { useEffect, useState, useRef } from "react";

export function useGameHub(url: string) {
  const [state, setState] = useState<GameState>();
  const connRef = useRef<signalR.HubConnection>();

  useEffect(() => {
    const conn = new HubConnectionBuilder().withUrl(url).withAutomaticReconnect().build();
    conn.on("State", s => setState(s));
    conn.start();
    connRef.current = conn;
    return () => { conn.stop(); };
  }, [url]);

  const play = async (card: Card) => connRef.current?.invoke("PlayCard", tableId, card);
  return { state, play };
}
```

- Все вызовы `invoke` → Promise → `await` в UI.
- Компоненты *читают* `state`, UI обновляется реактивно.

### 4.3 UI‑слои

| Слой             | Технологии              | Описание                                          |
| ---------------- | ----------------------- | ------------------------------------------------- |
| **Data**         | Zustand store           | хранит последний `GameState`, вычисляет селекторы |
| **Services**     | hooks                   | `useGameHub`, `useTableList`                      |
| **Components**   | React                   | `Lobby`, `Table`, `Hand`, `Card`                  |
| **Presentation** | Tailwind, Framer Motion | Анимации карт, responsive layout                  |

---

## 5. Асинхронные паттерны

- **Back‑pressure**: входящие команды кладём в `Channel<ICommand>`; GameManager обрабатывает последовательно, гарантируя целостность.
- **Cancellation**: передаём `CancellationToken` во все async методы.
- **Optimistic UI** на клиенте → локально применяем ход, откатываем по ошибке.
- **Ре‑коннект**: `withAutomaticReconnect()` и обработка событий `reconnecting`, `reconnected`.
- **Heartbeat**: Hub→Clients «Ping»/«Pong» каждые 30 с для детекта «мертвых» соединений.

---

## 6. Хранение состояния

1. **In‑Memory** (MVP) → ConcurrentDictionary\<tableId, GameState>.
2. Production: Redis (глобальные локации) с `StackExchange.Redis`.
3. Сериализация – `System.Text.Json` + `TypeInfo` (source‑gen) ⇒ минимальная аллокация.

---

## 7. Тестирование

- **Unit** – Durak.Core (100 % правил).
- **Integration** – `WebApplicationFactory` + `Microsoft.AspNetCore.SignalR.Client`.
- **E2E** – Playwright (React) сценарии «Создать стол – сделать ход – выйти».

---

## 8. CI/CD и деплой

| Шаг          | Инструмент                                           |
| ------------ | ---------------------------------------------------- |
| Build & Test | GitHub Actions (`dotnet test`, `npm test`)           |
| Containerize | Docker + multi‑stage: build API, serve SPA via Nginx |
| Deploy       | Fly.io / Render / VPS (systemd)                      |
| HTTPS        | Caddy / Traefik auto‑TLS                             |

---

## 9. Частые ошибки и решения

| Проблема                         | Причина                                        | Лечим                                            |
| -------------------------------- | ---------------------------------------------- | ------------------------------------------------ |
| **UI не видит обновлений**       | SignalR hub метод возвращает `void`, не `Task` | Всегда `async Task` и **await** внутри           |
| **Перетаскивание карт «лагает»** | больший state в одном сообщении                | Передавать *дифф* или композицию событий         |
| **Двойной ход одного игрока**    | гонка при параллельных Invoke                  | Channel + блокировка *по столу*                  |
| **CORS 404 при websockets**      | неправильный URL прокси                        | Nginx: `proxy_set_header Upgrade $http_upgrade;` |

---

## 10. Минимальный roadmap

1. **День 1‑3**: ядро игры + тесты.
2. **День 4**: API контроллеры `POST /tables` `GET /tables/{id}`.
3. **День 5**: SignalR Hub + клиент‑хук.
4. **День 6‑7**: React UI карточек + drag‑and‑drop (dnd‑kit).
5. **День 8**: энд‑ту‑энд тесты.
6. **День 9**: Docker, HTTPS.
7. **День 10**: полировка, зачистка багов.

---

## 11. Что дальше

- «Переводной дурак» / «Кози» – просто новый *Engine*.
- Рейтинговая система (Elo/Glicko).
- Мобильный PWA (add‑to‑home‑screen).

## 12. AI‑оппонент и Deck Selection

### 12.1 Где живёт AI

- **Durak.Core.Bot** – отдельный namespace внутри ядра.
- Интерфейс `IBotStrategy`:
  ```csharp
  public interface IBotStrategy
  {
      ValueTask<Card?> ChooseAttackAsync(GameState state, CancellationToken ct);
      ValueTask<Card?> ChooseDefenseAsync(GameState state, CancellationToken ct);
      ValueTask<bool> WantToTakeAsync(GameState state, CancellationToken ct);
  }
  ```
- Простейшая реализация `RandomBotStrategy` → выбирает первый валидный ход.
- Улучшение: **rule‑based heuristics** (бить меньшим козырем, экономить старшие козыри, «подкидывать» последовательные ранги).
- Обёртка `BotPlayer` подписывается на `GameStateChanged` события от `GameManager`; после хода человека бот вызывает стратегию и отправляет `PlayCard` через тот же `GameManager` (всё async/await).

### 12.2 Асинхронный workflow

```text
User ↔️ React ↔️ SignalR ↔️ GameManager
                                 ▲
                                 │
                                Bot (await Choose…())
```

- После каждого хода `GameManager` сверяет: **кто на очереди?** Если `BotPlayer`, вызывает `PlayBotTurnAsync()`.
- `PlayBotTurnAsync` → внутри `await Task.Delay(300 + Random(0,200))` имитировать «подумал».
- Бот работает **внутри сервера**, значит клиент получает его ходы через те же `State` broadcast‑ы.

---

### 12.3 Deck Selection (24/36/52)

1. В **React‑Lobby** компонент `DeckSelector` (RadioGroup dnd‑kit или shadcn/ui Switch).
2. При `POST /tables` клиент отправляет `deckSize` (24|36|52).
3. В ядре:
   ```csharp
   public enum DeckType { TwentyFour = 24, ThirtySix = 36, FiftyTwo = 52 }
   Deck BuildDeck(DeckType type) => type switch { … };
   ```
4. Тесты: убедиться, что козырь выбирается из правильного диапазона.

---

## 13. React‑маршруты и UI‑карточка

| Route                        | Компонент        | Описание                                                                      |
| ---------------------------- | ---------------- | ----------------------------------------------------------------------------- |
| `/games`                     | `<GamesList />`  | Grid карточек игр. Карточка «Дурак онлайн» содержит превью + кнопку «Играть». |
| `/games/durak`               | `<DurakLobby />` | Выбор deckSize; кнопка «Start vs AI».                                         |
| `/games/durak/play/:tableId` | `<DurakTable />` | Основной стол, обновляется через `useGameHub`.                                |

```tsx
function GameCard() {
  return (
    <Card onClick={() => navigate('/games/durak')} className="cursor-pointer hover:shadow-xl">
      <CardContent>
        <h3 className="text-xl font-semibold mb-2">Дурак онлайн</h3>
        <p className="text-sm text-muted-foreground">Классика на 24/36/52 карты. Играй против AI.</p>
      </CardContent>
    </Card>
  );
}
```

---

## 14. durak\_logic\_tasks.md (пример

**проектных задач для трекера**)

```md
# durak_logic_tasks.md

- [ ] Добавить enum DeckType и интегрировать в GameState
- [ ] Реализовать BuildDeck() под каждый размер
- [ ] Исправить раздачу карт при нестандартных колодах
- [ ] Написать RandomBotStrategy (IBotStrategy)
- [ ] Подключить BotPlayer к GameManager (async)
- [ ] Добавить endpoint POST /tables?bot=true&deckSize=36
- [ ] Обновить SignalR сообщения: Broadcast State после хода бота
- [ ] Unit‑тесты: бот делает валидный ход в 100 рандомных состояниях
```

---

## 15. Чек‑лист асинхронности

- **Все** публичные методы GameManager / Hub: `async` + возвращают `Task`/`ValueTask`.
- Блокировок `lock` — *минимум*, предпочтительно `Channel` + `await reader.ReadAsync()`.
- На клиенте — `Suspense`/`useTransition` для smooth UI.

