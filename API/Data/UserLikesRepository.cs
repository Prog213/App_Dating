using API.DTOs;
using API.Entities;
using API.Helpers;
using API.Interfaces;
using AutoMapper;
using AutoMapper.QueryableExtensions;
using Microsoft.EntityFrameworkCore;

namespace API.Data;

public class UserLikesRepository(DataContext context, IMapper mapper) : IUserLikesRepository
{
    public void AddLike(UserLike userLike)
    {
        context.Likes.Add(userLike);
    }

    public void DeleteLike(UserLike userLike)
    {
        context.Likes.Remove(userLike);
    }

    public async Task<IEnumerable<int>> GetCurrentUserLikeIds(int currentUserId)
    {
        return await context.Likes
            .Where(x => x.SourceUserId == currentUserId)
            .Select(x => x.TargetUserId)
            .ToListAsync();
    }

    public async Task<UserLike?> GetUserLike(int sourceUserId, int targetUserId)
    {
        return await context.Likes.FindAsync(sourceUserId, targetUserId);
    }

    public async Task<PagedList<MemberDTO>> GetUserLikes(LikesParams likesParams)
    {
        var likes = context.Likes.AsQueryable();
        IQueryable<MemberDTO> query;

        switch (likesParams.Predicate)
        {
            case "liked":
                query = likes
                    .Where(x => x.SourceUserId == likesParams.UserId)
                    .Select(x => x.TargetUser)
                    .ProjectTo<MemberDTO>(mapper.ConfigurationProvider);
                break;

            case "likedBy":
                query = likes
                    .Where(x => x.TargetUserId == likesParams.UserId)
                    .Select(x => x.SourceUser)
                    .ProjectTo<MemberDTO>(mapper.ConfigurationProvider);
                break;

            default:
                var userLikes = await GetCurrentUserLikeIds(likesParams.UserId);

                query = likes
                    .Where(x => x.TargetUserId == likesParams.UserId && userLikes.Contains(x.SourceUserId))
                    .Select(x => x.SourceUser)
                    .ProjectTo<MemberDTO>(mapper.ConfigurationProvider);
                break;
        }

        return await PagedList<MemberDTO>.CreateAsync(query, likesParams.PageNumber, likesParams.PageSize);
    }

    public async Task<bool> SaveAllAsync()
    {
        return await context.SaveChangesAsync() > 0;
    }
}
