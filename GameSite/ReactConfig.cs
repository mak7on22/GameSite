using React;
using WebActivatorEx;

[assembly: PreApplicationStartMethod(typeof(GameSite.ReactConfig), nameof(GameSite.ReactConfig.Configure))]

namespace GameSite
{
    public static class ReactConfig
    {
        public static void Configure()
        {
            ReactSiteConfiguration.Configuration
                .SetLoadBabel(true)
                .AddScript("~/js/DurackOnline.js");
        }
    }
}
