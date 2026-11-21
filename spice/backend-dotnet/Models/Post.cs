namespace Spice.Api.Models;

// O "rețetă" este un Post cu PostType.RETETA (nu există tabel separat).
public class Post
{
    public int Id { get; set; }
    public int UserId { get; set; }
    public int? GroupId { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Content { get; set; } = string.Empty;
    public string? ImageUrl { get; set; }
    public PostType PostType { get; set; } = PostType.GENERAL;
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }

    public User User { get; set; } = null!;
    public CookingGroup? Group { get; set; }
    public ICollection<PostLike> Likes { get; set; } = new List<PostLike>();
    public ICollection<Comment> Comments { get; set; } = new List<Comment>();
    public ICollection<SavedPost> SavedBy { get; set; } = new List<SavedPost>();
}
