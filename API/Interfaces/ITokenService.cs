using API.Entities;

namespace API.Intefcafes;

public interface ITokenService
{
    Task<string> CreateToken(AppUser user);
}
