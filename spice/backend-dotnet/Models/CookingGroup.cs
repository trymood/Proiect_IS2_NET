namespace Spice.Api.Models;

public class CookingGroup
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public int CreatedBy { get; set; }
    public string? CoverPic { get; set; }
    public DateTime CreatedAt { get; set; }

    public User Creator { get; set; } = null!;
    public ICollection<GroupMember> Members { get; set; } = new List<GroupMember>();
    public ICollection<Post> Posts { get; set; } = new List<Post>();
}
