using API.DTOs;
using API.Entities;
using API.Helpers;

namespace API.Interfaces;

public interface IUserLikesRepository
{
    Task<UserLike?> GetUserLike(int sourceUserId, int likedUserId);
    Task<PagedList<MemberDTO>> GetUserLikes(LikesParams likesParams);
    Task<IEnumerable<int>> GetCurrentUserLikeIds(int currentUserId);
    void DeleteLike(UserLike userLike);
    void AddLike(UserLike userLike);
    Task<bool> SaveAllAsync();
}
