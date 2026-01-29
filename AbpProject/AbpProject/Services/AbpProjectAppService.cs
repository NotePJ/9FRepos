using Volo.Abp.Application.Services;
using AbpProject.Localization;

namespace AbpProject.Services;

/* Inherit your application services from this class. */
public abstract class AbpProjectAppService : ApplicationService
{
    protected AbpProjectAppService()
    {
        LocalizationResource = typeof(AbpProjectResource);
    }
}