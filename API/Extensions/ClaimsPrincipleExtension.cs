using System.Security.Claims;

namespace API.Extensions;

public static class ClaimsPrincipleExtension
{
    public static string GetUsername(this ClaimsPrincipal user)
    {
        var username = user.FindFirstValue(ClaimTypes.Name) ?? throw new Exception();
        return username;
    }

    public static int GetUserId(this ClaimsPrincipal user)
    {
        var userId = user.FindFirstValue(ClaimTypes.NameIdentifier) ?? throw new Exception();
        return int.Parse(userId);
    }
}
