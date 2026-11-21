namespace Spice.Api.Models;

public class GroupMember
{
    public int GroupId { get; set; }
    public int UserId { get; set; }
    public GroupRole Role { get; set; } = GroupRole.MEMBER;
    public DateTime JoinedAt { get; set; }

    public CookingGroup Group { get; set; } = null!;
    public User User { get; set; } = null!;
}
