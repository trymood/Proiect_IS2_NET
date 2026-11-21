namespace Spice.Api.Models;

public class Follower
{
    public int Id { get; set; }
    public int FollowerId { get; set; }   // cine urmărește
    public int FollowingId { get; set; }  // pe cine urmărește
    public DateTime CreatedAt { get; set; }

    public User FollowerUser { get; set; } = null!;
    public User FollowingUser { get; set; } = null!;
}
