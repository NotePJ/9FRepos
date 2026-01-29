using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;

namespace AbpProject.Data;

public class AbpProjectDbContextFactory : IDesignTimeDbContextFactory<AbpProjectDbContext>
{
    public AbpProjectDbContext CreateDbContext(string[] args)
    {
        AbpProjectGlobalFeatureConfigurator.Configure();
        AbpProjectModuleExtensionConfigurator.Configure();

        AbpProjectEfCoreEntityExtensionMappings.Configure();
        var configuration = BuildConfiguration();

        var builder = new DbContextOptionsBuilder<AbpProjectDbContext>()
            .UseSqlServer(configuration.GetConnectionString("Default"));

        return new AbpProjectDbContext(builder.Options);
    }

    private static IConfigurationRoot BuildConfiguration()
    {
        var builder = new ConfigurationBuilder()
            .SetBasePath(Directory.GetCurrentDirectory())
            .AddJsonFile("appsettings.json", optional: false)
            .AddEnvironmentVariables();

        return builder.Build();
    }
}