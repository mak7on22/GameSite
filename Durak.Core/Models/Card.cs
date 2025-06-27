namespace Durak.Core.Models;

public readonly record struct Card(Suit Suit, Rank Rank)
{
    public override string ToString() => $"{Rank} of {Suit}";
}
