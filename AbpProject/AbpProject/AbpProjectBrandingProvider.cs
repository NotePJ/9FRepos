using Microsoft.Extensions.Localization;
using AbpProject.Localization;
using Volo.Abp.DependencyInjection;
using Volo.Abp.Ui.Branding;

namespace AbpProject;

[Dependency(ReplaceServices = true)]
public class AbpProjectBrandingProvider : DefaultBrandingProvider
{
    private IStringLocalizer<AbpProjectResource> _localizer;

    public AbpProjectBrandingProvider(IStringLocalizer<AbpProjectResource> localizer)
    {
        _localizer = localizer;
    }

    public override string AppName => _localizer["AppName"];
}