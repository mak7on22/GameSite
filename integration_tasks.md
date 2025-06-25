# Техническое задание для Codex: интеграция фронтенда «Дурак онлайн» в ASP.NET Core 8

> Цель — запустить существующую игру (React + TypeScript) внутри проекта **GameSite (net8.0)** без ошибок, с корректным UI и сохранением всех написанных ранее модулей и тестов.

---

## Этап 1. Очистка и синхронизация NuGet‑пакетов

1. В `GameSite.csproj` оставить только совместимые сборки: 1.1. Удалить `React.Web`, `React.Web.Mvc4` (зависимы от System.Web). 1.2. Если сервер‑сайд рендеринг **не нужен**, удалить также `React.AspNet`, `React.Core`. 1.3. Оставить единственную версию SignalR — **8.0.17** для сервера и клиента.
2. Выполнить `dotnet clean && dotnet restore`; убедиться, что сборка проходит без исключения `System.Web.IHttpHandler/IHttpModule`.

## Этап 2. Структурирование фронтенда

3. Переместить *исходники* TypeScript и React в `ClientApp/` (не удалять существующие файлы `src/durak.ts`, `tests/**`).
4. Создать `ClientApp/package.json` с скриптами `dev`, `build`, `test`.
5. Добавить `vite.config.ts`, настроить `outDir: '../wwwroot/js'`.
6. Обновить пути импорта карт так, чтобы они указывали на `/textures/cards/…` в `wwwroot`.

## Этап 3. Сборка и публикация

7. Реализовать `npm run build` → генерирует `wwwroot/js/assets/index.js` и CSS.
8. В `GameSite.csproj` добавить таргет:
   ```xml
   <Target Name="ViteBuild" AfterTargets="Publish">
     <Exec WorkingDirectory="ClientApp" Command="npm install" />
     <Exec WorkingDirectory="ClientApp" Command="npm run build" />
   </Target>
   ```
9. Проверить, что `dotnet publish -c Release` кладёт бандл в `wwwroot/js`.

## Этап 4. Razor‑страницы

10. `Views/Game/Index.cshtml` — оставить одну карточку **card‑durak** 250×320 px, ссылка `/Game/DurakOnline`.
11. `Views/Game/DurakOnline.cshtml` — контейнер `<div id="durak-root"></div>`, подключение бандла:
    ```html
    <link rel="stylesheet" href="~/js/assets/index.css" />
    <script type="module" src="~/js/assets/index.js"></script>
    ```
12. Удалить старый UMD `DurackOnline.js` (он дублирует логику).

## Этап 5. Исправление UI‑несоответствий

13. В CSS заменить `flex-direction: column` на `row` для ручных областей:
    ```css
    .ai-hand, .player-hand { display:flex; gap:12px; }
    ```
14. В компоненте DeckArea вывести:
    ```tsx
    <div className="deck-area">
       <img src={trumpCard.img} className="card trump" />
       <span className="deck-counter">× {deck.length}</span>
    </div>
    ```
15. Добавить стили `deck-area`, `deck-counter`, `card.trump`.
16. Подключить локальный React (через Vite‑бандл) → убрать загрузку с CDN, чтобы UI не появлялся с задержкой.

## Этап 6. Сохранение логики и тестов

17. **Не удалять** существующие файлы `src/durak.ts`, `tests/**`; собрать логику в один пакет.
18. Провести реэкспорт функций (`dealInitial`, `attack`, `defend`, `aiMove`) для использования в компонентах.
19. Обновить Jest‑конфиг, чтобы проходили все тесты из `tests/`.

## Этап 7. Проверка

20. Локально: `dotnet run` → переход `/Game/DurakOnline` отображает игру за < 1 с, без F5.
21. Карты раздаются горизонтально, счётчик колоды и козырная карта видимы.
22. Кнопки «Бито» / «Забрать» функционируют, после раунда происходит добор.
23. В консоли браузера нет ошибок; все запросы к `/textures/cards/*` и `/js/*` возвращают 200.
24. `npm test` выводит «✓ all tests passed».

## Этап 8. Сдача

25. Создать PR с чёткими коммит‑месседжами `feat: vite build`, `fix: ui layout`, `refactor: move sources`.
26. Приложить к PR скриншот работающей страницы и вывод `dotnet publish`.

---

**Сроки:** этапы 1–6 выполнить за 5 рабочих дней; этапы 7–8 — +2 дня на тесты и ревью. Потеря или перезапись существующих исходников недопустима — все файлы из `src/**` и `tests/**` должны сохраниться.

