# Этап 1: SDK-образ для сборки
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
ARG BUILD_CONFIGURATION=Release
WORKDIR /src

# Копируем .csproj и восстанавливаем зависимости
COPY ["GameSite/GameSite.csproj", "GameSite/"]
RUN dotnet restore "./GameSite/GameSite.csproj"

# Копируем весь остальной код
COPY . .
WORKDIR "/src/GameSite"
RUN dotnet build "GameSite.csproj" -c $BUILD_CONFIGURATION -o /app/build

# Этап 2: публикация
FROM build AS publish
ARG BUILD_CONFIGURATION=Release
RUN dotnet publish "GameSite.csproj" -c $BUILD_CONFIGURATION -o /app/publish /p:UseAppHost=false

# Этап 3: запуск
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS final
WORKDIR /app
EXPOSE 8080
EXPOSE 8081
COPY --from=publish /app/publish .
ENTRYPOINT ["dotnet", "GameSite.dll"]
