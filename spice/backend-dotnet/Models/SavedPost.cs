namespace Spice.Api.Models;

public class SavedPost
{
    public int UserId { get; set; }
    public int PostId { get; set; }
    public DateTime SavedAt { get; set; }

    public User User { get; set; } = null!;
    public Post Post { get; set; } = null!;
}
