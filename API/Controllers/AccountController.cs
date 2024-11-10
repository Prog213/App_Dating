using System.Security.Cryptography;
using System.Text;
using API.Data;
using API.DTOs;
using API.Entities;
using API.Intefcafes;
using AutoMapper;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace API.Controllers;

public class AccountController(DataContext context, ITokenService tokenService, 
    IMapper mapper) : BaseAPIController
{
    [HttpPost("register")]
    public async Task<ActionResult<UserDTO>> Register([FromBody] RegisterDTO registerDTO)
    {
        if (await UserExists(registerDTO.Username))
            return BadRequest("Username already taken!");

        using var hmac = new HMACSHA512();

        var user = mapper.Map<AppUser>(registerDTO);
        
        user.UserName = registerDTO.Username.ToLower();
        user.PasswordHash = hmac.ComputeHash(Encoding.UTF8.GetBytes(registerDTO.Password));
        user.PasswordSalt = hmac.Key;

        context.Users.Add(user);
        await context.SaveChangesAsync();

        var userDTO = mapper.Map<UserDTO>(user);
        userDTO.Token = tokenService.CreateToken(user);

        return userDTO;
    }
    [HttpPost("login")]
    public async Task<ActionResult<UserDTO>> Login(LoginDTO loginDTO)
    {
        var user = await context.Users.Include(x => x.Photos).FirstOrDefaultAsync
            (x => x.UserName.ToLower() == loginDTO.Username.ToLower());

        if (user == null) return Unauthorized("Invalid username");

        using var hmac = new HMACSHA512(user.PasswordSalt);
        var computedHash = hmac.ComputeHash(Encoding.UTF8.GetBytes(loginDTO.Password));

        for (int i = 0; i < computedHash.Length; i++)
        {
            if (computedHash[i] != user.PasswordHash[i])
                return Unauthorized("Invalid password");
        }

        var userDTO = mapper.Map<UserDTO>(user);
        userDTO.Token = tokenService.CreateToken(user);

        return userDTO;
    }
    private async Task<bool> UserExists(string userName)
    {
        return await context.Users.AnyAsync
            (x => x.UserName.ToLower() == userName.ToLower());
    }
}
