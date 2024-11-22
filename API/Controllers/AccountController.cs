using System.Security.Cryptography;
using System.Text;
using API.Data;
using API.DTOs;
using API.Entities;
using API.Intefcafes;
using AutoMapper;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace API.Controllers;

public class AccountController(UserManager<AppUser> userManager, ITokenService tokenService, 
    IMapper mapper) : BaseAPIController
{
    [HttpPost("register")]
    public async Task<ActionResult<UserDTO>> Register([FromBody] RegisterDTO registerDTO)
    {
        if (await UserExists(registerDTO.Username))
            return BadRequest("Username already taken!");

        var user = mapper.Map<AppUser>(registerDTO);
        
        user.UserName = registerDTO.Username.ToLower();

        var result = await userManager.CreateAsync(user, registerDTO.Password);
        if (!result.Succeeded) return BadRequest(result.Errors);

        var userDTO = mapper.Map<UserDTO>(user);
        userDTO.Token = await tokenService.CreateToken(user);

        return userDTO;
    }
    [HttpPost("login")]
    public async Task<ActionResult<UserDTO>> Login(LoginDTO loginDTO)
    {
        var user = await userManager.Users.Include(x => x.Photos).FirstOrDefaultAsync
            (x => x.NormalizedUserName == loginDTO.Username.ToUpper());

        if (user == null) return Unauthorized("Invalid username");

        var result = await userManager.CheckPasswordAsync(user, loginDTO.Password);
        if (!result) return Unauthorized("Invalid password");

        var userDTO = mapper.Map<UserDTO>(user);
        userDTO.Token = await tokenService.CreateToken(user);

        return userDTO;
    }
    private async Task<bool> UserExists(string userName)
    {
        return await userManager.Users.AnyAsync
            (x => x.NormalizedEmail == userName.ToUpper());
    }
}
