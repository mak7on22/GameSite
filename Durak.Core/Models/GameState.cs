namespace Durak.Core.Models;

public record GameState(
    IReadOnlyList<Player> Players,
    int AttackerIndex,
    int DefenderIndex,
    Suit Trump,
    IReadOnlyList<Card> Deck,
    IReadOnlyList<Turn> Table);
