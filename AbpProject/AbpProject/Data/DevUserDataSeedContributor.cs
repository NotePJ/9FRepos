using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.Options;
using Volo.Abp.Data;
using Volo.Abp.DependencyInjection;
using Volo.Abp.Guids;
using Volo.Abp.Identity;
using Volo.Abp.MultiTenancy;
using Volo.Abp.Uow;
using Volo.Abp;
using Microsoft.Extensions.Logging;

namespace AbpProject.Data;

public class DevUserDataSeedContributor : IDataSeedContributor, ITransientDependency
{
    private readonly IGuidGenerator _guidGenerator;
    private readonly IdentityUserManager _identityUserManager;
    private readonly ICurrentTenant _currentTenant;
    private readonly ILogger<DevUserDataSeedContributor> _logger;

    public DevUserDataSeedContributor(
        IGuidGenerator guidGenerator,
        IdentityUserManager identityUserManager,
        ICurrentTenant currentTenant,
        ILogger<DevUserDataSeedContributor> logger)
    {
        _guidGenerator = guidGenerator;
        _identityUserManager = identityUserManager;
        _currentTenant = currentTenant;
        _logger = logger;
    }

    [UnitOfWork]
    public virtual async Task SeedAsync(DataSeedContext context)
    {
        // ???????????? Development mode ????????????? tenant
        if (!context.Properties.ContainsKey("IsDevelopment") || _currentTenant.Id.HasValue)
        {
            return;
        }

        var isDevelopment = context.Properties["IsDevelopment"] as bool? ?? false;
        if (!isDevelopment)
        {
            return;
        }

        _logger.LogInformation("Creating dev user...");
        
        // ????? dev user ????? username/password ????? ??????? validation
        await CreateDevUserAsync("dev", "dev@localhost", "Dev@123");
    }

    private async Task CreateDevUserAsync(string userName, string email, string password)
    {
        var existingUser = await _identityUserManager.FindByNameAsync(userName);

        if (existingUser != null)
        {
            _logger.LogInformation($"Dev user '{userName}' already exists.");
            return;
        }

        var user = new Volo.Abp.Identity.IdentityUser(
            _guidGenerator.Create(),
            userName,
            email,
            _currentTenant.Id
        )
        {
            Name = "Developer"
        };

        _logger.LogInformation($"Attempting to create dev user '{userName}' with email '{email}'...");
        
        var result = await _identityUserManager.CreateAsync(user, password);
        
        if (!result.Succeeded)
        {
            var errors = string.Join(", ", result.Errors.Select(e => $"{e.Code}: {e.Description}"));
            _logger.LogError($"Failed to create dev user: {errors}");
            throw new AbpException($"Failed to create dev user: {errors}");
        }
        
        _logger.LogInformation($"Successfully created dev user '{userName}'.");
    }
}
