using System.Linq;
using Durak.Core.Models;

namespace Durak.Core.Engine;

public record PlayCard(int PlayerIndex, Card Card) : ICommand
{
    public GameState Apply(GameState state)
    {
        var players = state.Players.ToArray();
        var player = players[PlayerIndex];
        var hand = player.Hand.Where(c => c != Card).ToList();
        players[PlayerIndex] = player with { Hand = hand };
        var table = state.Table.Append(new Turn(Card)).ToArray();
        return state with { Players = players, Table = table };
    }
}
