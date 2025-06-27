using Durak.Core.Models;

namespace Durak.Core.Engine;

public interface ICommand
{
    GameState Apply(GameState state);
}
