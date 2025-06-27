using Durak.Core.Models;

namespace Durak.Core.Engine;

public static class Game
{
    public static GameState Apply(GameState state, ICommand command)
        => command.Apply(state);
}
