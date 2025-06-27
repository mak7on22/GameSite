namespace Durak.Core.Models;

public record Player(string Id, IReadOnlyList<Card> Hand);
