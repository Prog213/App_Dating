using System.Security.Cryptography;
using System.Text;
using API.Data;
using API.DTOs;
using API.Entities;
using API.Intefcafes;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace API.Controllers;

public class AccountController(DataContext context, ITokenService tokenService) : BaseAPIController
{
    [HttpPost("register")]
    public async Task<ActionResult<UserDTO>> Register([FromBody] RegisterDTO registerDTO)
    {   
        return Ok();
        // if (await UserExists(registerDTO.Username)) 
        //     return BadRequest("Username already taken!");

        // using var hmac = new HMACSHA512();

        // var user = new AppUser{
        //     UserName = registerDTO.Username,
        //     PasswordHash = hmac.ComputeHash(Encoding.UTF8.GetBytes(registerDTO.Password)),
        //     PasswordSalt = hmac.Key
        // };

        // context.Users.Add(user);
        // await context.SaveChangesAsync();

        // return new UserDTO{
        //     Username = user.UserName,
        //     Token = tokenService.CreateToken(user)
        // };
    }
    [HttpPost("login")]
    public async Task<ActionResult<UserDTO>> Login (LoginDTO loginDTO){
        var user = await context.Users.FirstOrDefaultAsync
            (x => x.UserName.ToLower() == loginDTO.Username.ToLower());

        if (user == null) return Unauthorized("Invalid username");

        using var hmac = new HMACSHA512(user.PasswordSalt);
        var computedHash = hmac.ComputeHash(Encoding.UTF8.GetBytes(loginDTO.Password));

        for (int i = 0; i < computedHash.Length; i++)
        {
            if (computedHash[i] != user.PasswordHash[i]) 
                return Unauthorized("Invalid password");
        }

        return new UserDTO{
            Username = user.UserName,
            Token = tokenService.CreateToken(user)
        };
    }
    private async Task<bool> UserExists(string userName){
        return await context.Users.AnyAsync
            (x => x.UserName.ToLower() == userName.ToLower());
    }
}
