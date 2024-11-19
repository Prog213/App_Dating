using API.DTOs;
using API.Entities;
using API.Extensions;
using API.Helpers;
using API.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers;

public class LikesController(IUserLikesRepository repo) : BaseAPIController
{
    [HttpPost("{targetUserId}")]
    public async Task<ActionResult> ToggleLike(int targetUserId)
    {
        var sourceUserId = User.GetUserId();

        if (sourceUserId == targetUserId) return BadRequest("You cannot like yourself");

        var existingLike = await repo.GetUserLike(sourceUserId, targetUserId);

        if (existingLike == null)
        {
            var like = new UserLike
            {
                SourceUserId = sourceUserId,
                TargetUserId = targetUserId
            };
            repo.AddLike(like);
        }
        else
        {
            repo.DeleteLike(existingLike);
        }

        if (await repo.SaveAllAsync()) return Ok();

        return BadRequest("Error saving like");
    }

    [HttpGet("list")]
    public async Task<ActionResult<IEnumerable<int>>> GetCurrentUserLikesIds()
    {
        return Ok(await repo.GetCurrentUserLikeIds(User.GetUserId()));
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<MemberDTO>>> GetUserLikes([FromQuery] LikesParams likesParams)
    {
        likesParams.UserId = User.GetUserId();
        var users = await repo.GetUserLikes(likesParams);

        Response.AddPaginationHeader(users);

        return Ok(users);
    }
}
