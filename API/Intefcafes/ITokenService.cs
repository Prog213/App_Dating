using API.Entities;

namespace API.Intefcafes;

public interface ITokenService
{
    string CreateToken(AppUser user);
}
