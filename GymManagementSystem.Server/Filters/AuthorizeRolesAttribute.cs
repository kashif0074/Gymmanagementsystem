using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;
using GymManagementSystem.Server.Services;

namespace GymManagementSystem.Server.Filters;

[AttributeUsage(AttributeTargets.Class | AttributeTargets.Method)]
public class AuthorizeRolesAttribute : Attribute, IAsyncActionFilter
{
    private readonly string[] _roles;

    public AuthorizeRolesAttribute(params string[] roles)
    {
        _roles = roles;
    }

    public async Task OnActionExecutionAsync(ActionExecutingContext context, ActionExecutionDelegate next)
    {
        var authHeader = context.HttpContext.Request.Headers["Authorization"].ToString();
        if (string.IsNullOrEmpty(authHeader) || !authHeader.StartsWith("Bearer ", StringComparison.OrdinalIgnoreCase))
        {
            context.Result = new UnauthorizedObjectResult(new { message = "Authentication token is missing." });
            return;
        }

        var token = authHeader["Bearer ".Length..].Trim();
        var payload = TokenHelper.VerifyToken(token);
        if (payload == null)
        {
            context.Result = new UnauthorizedObjectResult(new { message = "Authentication token is invalid or expired." });
            return;
        }

        // Store identity information in HttpContext Items for controller logic
        context.HttpContext.Items["Username"] = payload.Username;
        context.HttpContext.Items["Role"] = payload.Role;

        if (_roles.Length > 0 && !_roles.Contains(payload.Role, StringComparer.OrdinalIgnoreCase))
        {
            context.Result = new ObjectResult(new { message = "Forbidden: Access denied." }) { StatusCode = 403 };
            return;
        }

        await next();
    }
}
