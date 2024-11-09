using System.Security.Claims;
using API.DTOs;
using API.Entities;
using API.Interfaces;
using AutoMapper;
using AutoMapper.Execution;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers;

[Authorize]
public class UsersController(IUserRepository repo, IMapper mapper) : BaseAPIController
{
    [HttpGet]
    public async Task<ActionResult<IReadOnlyList<MemberDTO>>> GetUsers()
    {
        var users = await repo.GetMembersAsync();

        return Ok(users);
    }

    [HttpGet("{username}")]
    public async Task<ActionResult<MemberDTO>> GetUser(string username)
    {
        var user = await repo.GetMemberByUsernameAsync(username);

        if (user == null)
        {
            return NotFound();
        }

        return user;
    }

    [HttpPut]
    public async Task<ActionResult> UpdateUser(MemberUpdateDTO member)
    {
        var username = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

        if (username == null) return BadRequest();

        var user = await repo.GetUserByUsernameAsync(username);

        if (user == null) return BadRequest();

        mapper.Map(member, user);

        if (await repo.SaveAllAsync()) return NoContent();

        return BadRequest("Error updating user");
    }
}