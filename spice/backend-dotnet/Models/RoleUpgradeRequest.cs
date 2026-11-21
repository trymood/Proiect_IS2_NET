namespace Spice.Api.Models;

public class RoleUpgradeRequest
{
    public int Id { get; set; }
    public int UserId { get; set; }
    public RequestStatus Status { get; set; } = RequestStatus.PENDING;
    public DateTime RequestedAt { get; set; }
    public DateTime? ReviewedAt { get; set; }

    public User User { get; set; } = null!;
}
