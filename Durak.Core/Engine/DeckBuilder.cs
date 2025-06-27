using Durak.Core.Models;

namespace Durak.Core.Engine;

public static class DeckBuilder
{
    public static Card[] BuildDeck(DeckType type)
    {
        var ranks = type switch
        {
            DeckType.TwentyFour => Enum.GetValues<Rank>().Where(r => (int)r >= 9),
            DeckType.ThirtySix => Enum.GetValues<Rank>().Where(r => (int)r >= 6),
            DeckType.FiftyTwo  => Enum.GetValues<Rank>(),
            _ => throw new ArgumentOutOfRangeException(nameof(type), type, null)
        };

        var deck = new List<Card>();
        foreach (var suit in Enum.GetValues<Suit>())
            foreach (var rank in ranks)
                deck.Add(new Card(suit, rank));
        return deck.ToArray();
    }
}
