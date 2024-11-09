using System.Security.Claims;
using API.DTOs;
using API.Entities;
using API.Extensions;
using API.Interfaces;
using API.Services;
using AutoMapper;
using AutoMapper.Execution;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers;

[Authorize]
public class UsersController(IUserRepository repo, IMapper mapper, IPhotoService photoService)
    : BaseAPIController
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
        var user = await repo.GetUserByUsernameAsync(User.GetUsername());

        if (user == null) return BadRequest();

        mapper.Map(member, user);

        if (await repo.SaveAllAsync()) return NoContent();

        return BadRequest("Error updating user");
    }

    [HttpPost("add-photo")]
    public async Task<ActionResult<PhotoDTO>> AddPhoto(IFormFile file)
    {
        var user = await repo.GetUserByUsernameAsync(User.GetUsername());

        if (user == null) return BadRequest();

        var result = await photoService.AddPhotoAsync(file);

        if (result.Error != null) return BadRequest(result.Error.Message);

        var photo = new Photo
        {
            Url = result.SecureUrl.AbsoluteUri,
            PublicId = result.PublicId
        };

        user.Photos.Add(photo);

        if (await repo.SaveAllAsync())
            return CreatedAtAction(nameof(GetUser),
                new { username = user.UserName }, mapper.Map<PhotoDTO>(photo));

        return BadRequest("Error storing photo");
    }
    [HttpPut("set-main-photo/{photoId}")]
    public async Task<ActionResult> SetMainPhoto(int photoId)
    {

        var user = await repo.GetUserByUsernameAsync(User.GetUsername());

        if (user == null) return BadRequest();

        var photo = user.Photos.FirstOrDefault(x => x.Id == photoId);

        if (photo == null || photo.IsMain) return BadRequest();

        var mainPhoto = user.Photos.FirstOrDefault(x => x.IsMain == true);

        if (mainPhoto != null) mainPhoto.IsMain = false;

        photo.IsMain = true;
        if (await repo.SaveAllAsync()) return NoContent();

        return BadRequest();
    }

    [HttpDelete("delete-photo/{photoId}")]
    public async Task<ActionResult> DeletePhoto(int photoId)
    {
        var user = await repo.GetUserByUsernameAsync(User.GetUsername());

        if (user == null) return BadRequest();

        var photo = user.Photos.FirstOrDefault(x => x.Id == photoId);

        if (photo == null) return NotFound();

        if (photo.IsMain) return BadRequest("You cannot delete your main photo");

        if (photo.PublicId != null)
        {
            var result = await photoService.DeletePhotoAsync(photo.PublicId);
            if (result.Error != null) return BadRequest(result.Error.Message);
        }

        user.Photos.Remove(photo);

        if (await repo.SaveAllAsync()) return Ok();

        return BadRequest("Failed to delete photo");
    }
}