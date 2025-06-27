using Durak.Core.Engine;
using Durak.Core.Models;

namespace Durak.Core.Tests;

public class DeckBuilderTests
{
    [Theory]
    [InlineData(DeckType.TwentyFour, 24)]
    [InlineData(DeckType.ThirtySix, 36)]
    [InlineData(DeckType.FiftyTwo, 52)]
    public void BuildDeck_GeneratesCorrectNumberOfCards(DeckType type, int expected)
    {
        var deck = DeckBuilder.BuildDeck(type);
        Assert.Equal(expected, deck.Length);
        Assert.Equal(deck.Length, deck.Distinct().Count());
    }
}
