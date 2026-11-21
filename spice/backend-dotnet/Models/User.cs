namespace Spice.Api.Models;

public class User
{
    public int Id { get; set; }
    public string Username { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string PasswordHash { get; set; } = string.Empty;
    public int? Age { get; set; }
    public UserRole Role { get; set; } = UserRole.AMATOR;
    public bool IsVerified { get; set; }
    public int FailedAttempts { get; set; }
    public bool IsBlocked { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? DeletedAt { get; set; }
    public string? ProfilePic { get; set; }

    public ICollection<Post> Posts { get; set; } = new List<Post>();
    public ICollection<Comment> Comments { get; set; } = new List<Comment>();
    public ICollection<PostLike> PostLikes { get; set; } = new List<PostLike>();
    public ICollection<SavedPost> SavedPosts { get; set; } = new List<SavedPost>();
    public ICollection<RoleUpgradeRequest> RoleUpgradeRequests { get; set; } = new List<RoleUpgradeRequest>();
    public ICollection<GroupMember> GroupMemberships { get; set; } = new List<GroupMember>();
    public ICollection<CookingGroup> CreatedGroups { get; set; } = new List<CookingGroup>();
    // Rânduri din followers în care acest utilizator urmărește pe cineva
    public ICollection<Follower> Following { get; set; } = new List<Follower>();
    // Rânduri din followers în care acest utilizator este urmărit
    public ICollection<Follower> Followers { get; set; } = new List<Follower>();
    public ICollection<Message> SentMessages { get; set; } = new List<Message>();
    public ICollection<Message> ReceivedMessages { get; set; } = new List<Message>();
}
