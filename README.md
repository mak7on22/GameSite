# GameSite

This project is an ASP.NET Core web application. For Google authentication to work you need to provide the OAuth `ClientId` and `ClientSecret`.

Add them in `appsettings.Development.json` or provide them via environment variables when deploying. If these values are not set, Google authentication is skipped and the rest of the application will still run. The login page will automatically hide the Google login option when the credentials are missing.

See more usage details in [docs/README.md](docs/README.md).
