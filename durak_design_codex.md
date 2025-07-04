## Полный‑функциональный дизайн «Подкидного дурака» для Codex

*(инструкция ориентирована на разработчиков; все термины даны на русском и дублируются английскими, чтобы коду было легче «звенеть»)*  

---

### 1. Ключевые сущности и структуры данных  

| Сущность | Роль | Мини‑структура в коде |
|----------|------|-----------------------|
| **Card** | Карта с рангом `rank` (6 … Ace) и мастью `suit`. | `enum Suit {♥, ♦, ♣, ♠}`<br>`enum Rank {Six=6,…,Ace=14}`<br>`struct Card { Rank r; Suit s; }` |
| **Deck / Talon** | Колода из 36 карт. При инициализации тасуется; хранятся оставшиеся карты. | `vector<Card> deck;  // top == back()` |
| **TrumpSuit** | Масть козыря, равна масти последней карты в колоде. | `Suit trump;` |
| **Hand** | Набор карт игрока. | `vector<Card> hand;` |
| **Table** | Пары «атака→защита» (`Card attack; Card defence;`) плюс «свободные» атакующие карты. | `vector<pair<Card, optional<Card>>> table;` |
| **Player** | Модель человека или ИИ. Должна реализовывать интерфейсы `chooseAttack()`, `chooseDefence()`, `wantsPass()` … | `class IPlayer { virtual Action ask(GameState) = 0; }` |
| **GameState** | «Снимок» всех списков, чей ход, фазу и т. п. | см. FSM ниже |

---

### 2. Машина состояний (FSM) высокого уровня  

```
┌── Init ──┐
│          ▼
│   DealFirst6
│          ▼
│     TurnLoop
│  ┌──────────────┐
│  │  StartTurn   │
│  │  AttackLoop  │◄────────────┐
│  │  Resolve     │             │
│  └─────┬────────┘             │
└────────▼──────────────────────┘
          ▼
        Finish
```

* **StartTurn** – назначение атакующего/защитника  
* **AttackLoop** – повторяющиеся попытки подброса/защиты  
* **Resolve** – сброс или подбор + добор карт из колоды  
* **Finish** – остался 0 или 1 игрок с картами → объявление победителя/дурака  

---

### 3. Пошаговая логика

#### 3.1 Инициализация
1. Создать `deck` = 36 карт, перемешать (`std::shuffle + std::mt19937`).  
2. Вытащить последнюю карту, назначить `trump = lastCard.suit`, вернуть её «лицом вверх» в низ колоды.  
3. По кругу раздать каждому игроку по 6 карт.  
4. Сравнить самые младшие козыри → у кого он младше, тот **первый атакующий**.  

#### 3.2 Ход (Turn)
```text
while not gameOver:
    attacker = currentAttacker
    defender = playerToLeft(attacker)
    phase = AttackLoop
```

##### 3.2.1 AttackLoop
* **Ограничения**  
  * Максимум 6 пар на столе **или** столько, сколько карт у защитника в руке – что меньше.  
* **Очередность**  
  1. **Атакующий** выкладывает 1 карту (`attack card`).  
  2. **Защитник** обязан бить (см. 3.2.2) или **забрать** (`take`).  
  3. Любой игрок, включая атакующего, *по часовой* может подбросить карту, чей ранг уже есть на столе.  
  4. После каждого подброса – право бить снова за защитником.  

##### 3.2.2 Правила «бить» (`canBeat(defCard, atkCard)`):
* Карта той же масти **и** старшего ранга.  
* Любая козырь‑карта, если атакующая не козырь.  
* Козырь можно перебить только козырем выше ранга.  

##### 3.2.3 Завершение атаки
* **Защитился**: если все атакующие карты побиты ⇒ всё со стола в сброс.  
* **Взял**: иначе защитник забирает все карты на стол.  
* **Следующий атакующий**:  
  * При защите — левый от текущего защитника.  
  * При взятии — сам защитник.  

##### 3.2.4 Добор
Порядок: от **атакующего** по часовой до защиты, затем защитник. Каждый тянет из колоды до 6 карт, пока `deck` не пуст. Последний вытянувший забирает открытую козырную.  

#### 3.3 Окончание игры
* Как только колода пуста, игра продолжается без добора.  
* Игрок, который первым остался без карт, **выходит**.  
* Игра заканчивается, когда остаётся **0 или 1** игрок с картами.  
* Последний с картами – «дурак».  

---

### 4. Варианты правил / флаги конфигурации

| Флаг | Что меняет | Значение по умолчанию |
|------|------------|-----------------------|
| `transferable` | «Переводной» дурак (defender → attack) | `false` |
| `maxPairs` | Жёсткий лимит карт на столе | `6` |
| `discardPileVisible` | Видна ли стопка сброса | `false` |

---

### 5. Архитектура кода (псевдо C++/TypeScript)  

```cpp
struct GameConfig {
    bool transferable = false;
    int  maxPairs     = 6;
};

class Game {
    Deck deck;
    vector<Player*> players;
    Table table;
    GameConfig cfg;
    int idxAttacker;
    int idxDefender;
    void dealFirst6();
    void playTurn();
    bool isGameOver();
};
```

#### 5.1 Обработчик хода
```cpp
void Game::playTurn() {
    table.clear();
    Phase phase = Phase::Attack;
    while (phase != Phase::Resolve) {
        Action a = currentPlayer()->ask(stateSnapshot());
        validateAndApply(a);
        updatePhaseAndIndex();
    }
    resolveTable();
    replenishHands();
}
```

> **Совет**: держите проверки «можно / нельзя» в одном месте (`RulesEngine`), чтобы легко писать unit‑тесты.  

---

### 6. Алгоритмы ИИ (коротко)

| Ситуация | Эвристики |
|----------|-----------|
| **Атака** | младшая некозырная; держать козыри; подбрасывать дубликаты |
| **Защита** | минимальной; козырем в крайнем случае; учитывать перевод |
| **Подброс** | если у защитника ≥ карт на столе; не подбрасывать при руке ≤ 3 карт |

---

### 7. Тест‑пакет

1. Раздача: после `dealFirst6` у каждого 6 карт.  
2. `canBeat`: протестировать все комбинации.  
3. Лимит 6 пар: седьмая карта — `RuleError`.  
4. Пустая колода: `replenishHands` пропуск.  
5. Финал: сценарий «последняя защита проходит».  

---

### 8. Дополнительные фичи

* Сохранение/загрузка `GameState` (JSON/protobuf).  
* Сетевой режим: WebSocket + protobuf.  
* Реплей/лог для «перемотки».  
* Аналитика партии.  

---

### 9. Тонкие случаи

| Случай | Проверка |
|--------|----------|
| Перевод делает > 6 карт | отклонить действие |
| У защитника 0 карт до добора | защита автопроходит |
| Открытый козырь = последняя карта | снимается как последняя |
| Подброс с новым рангом | отклонить |

---

### 10. Skeleton главного цикла

```python
while not is_game_over():
    start_turn()
    while phase == "attack":
        act = current_player.choose_action(state)
        if rules.validate(act, state):
            state = rules.apply(act, state)
        else:
            raise IllegalMove
        phase = rules.next_phase(state)
    resolve_table()
    refill_hands()
    rotate_indices()
```

---

### 11. Дальнейшие шаги

1. Пишите unit‑тесты `canBeat`, `validateAttack`, `validateDefence`.  
2. Вынесите правила в `RulesEngine`.  
3. Добавьте перевод как дополнительный transition.  
4. Покрывайте баг‑репорты BDD‑сценариями.  

Удачной разработки!
