using Project_Manager_Api.Data;
using Microsoft.EntityFrameworkCore;
using Project_Manager_Api.Services;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Text;

try // Wrapping Program.cs in a global try/catch ensures that any critical configuration or infrastructure error
// (such as missing database, invalid authentication setup, or missing JWT key) will be logged immediately,
// and the process will crash instead of failing silently. This is best practice for production-ready .NET APIs:
// let the application fail fast if essential services or configuration are not available,
// and handle user/data/business logic errors only in controllers/services.

{
    var builder = WebApplication.CreateBuilder(args);
    builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(policy =>
    {
        policy.WithOrigins(
        "http://localhost:3000",
        "https://project-manager-api-beryl.vercel.app",
        "https://project-manager-api-assaf-abadis-projects.vercel.app",
        "https://project-manager-api-git-main-assaf-abadis-projects.vercel.app",
        "https://project-manager-u3bhq00pe-assaf-abadis-projects.vercel.app"
    )
    .AllowAnyHeader()
    .AllowAnyMethod();
    });
});// Configure CORS to allow requests from the frontend (React app) running on localhost:3000


    builder.Services.AddScoped<IAuthService, AuthService>();// Register the authentication service
    builder.Services.AddScoped<IProjectService, ProjectService>();// Register the project service
    builder.Services.AddScoped<ITaskService, TaskService>();// Register the task service

    builder.Services.AddControllers();// Add services to the container for controllers

    builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlite(builder.Configuration.GetConnectionString("DefaultConnection")));
    // Configure Entity Framework Core to use SQLite with the connection string from appsettings.json

    builder.Services.AddEndpointsApiExplorer();//for Swagger
    builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new() { Title = "Project Manager API", Version = "v1" });

    // Add JWT Auth to Swagger
    c.AddSecurityDefinition("Bearer", new Microsoft.OpenApi.Models.OpenApiSecurityScheme
    {
        Name = "Authorization",
        Type = Microsoft.OpenApi.Models.SecuritySchemeType.Http,
        Scheme = "Bearer",
        BearerFormat = "JWT",
        In = Microsoft.OpenApi.Models.ParameterLocation.Header,
        Description = "Enter 'Bearer' [space] and then your valid token in the text input below.\r\n\r\nExample: \"Bearer eyJhbGci...\"",
    });
    c.AddSecurityRequirement(new Microsoft.OpenApi.Models.OpenApiSecurityRequirement
    {
        {
            new Microsoft.OpenApi.Models.OpenApiSecurityScheme
            {
                Reference = new Microsoft.OpenApi.Models.OpenApiReference
                {
                    Type = Microsoft.OpenApi.Models.ReferenceType.SecurityScheme,
                    Id = "Bearer"
                }
            },
            new string[] {}
        }
    });
});


    // JWT Authentication setup
    builder.Services.AddAuthentication(options =>
    {
        options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
        options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
    })
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = false,
            ValidateAudience = false,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            IssuerSigningKey = new SymmetricSecurityKey(
                Encoding.UTF8.GetBytes(
                    builder.Configuration["Jwt:Key"] ?? "MySuperSecretKeyForDev!!123456789000000"
                )
            )
        };
    });

    var app = builder.Build();
    using (var scope = app.Services.CreateScope())
    {
        var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
        db.Database.Migrate(); // This will apply any pending migrations to the database
    }

    if (app.Environment.IsDevelopment())
    {
        app.UseSwagger();
        app.UseSwaggerUI();
    }
    app.UseCors(); // Enable CORS globally
    app.UseHttpsRedirection();

    app.UseAuthentication();
    app.UseAuthorization();

    app.MapControllers();

    app.Run();
}
catch (Exception ex)
{
    // Catch-all for fatal errors during app startup (DB/config issues)
    // In production, you would use a proper logger.
    Console.Error.WriteLine("Fatal error during startup: " + ex.Message);
    Console.Error.WriteLine(ex.ToString());
    throw; // Crash the process to signal configuration or infrastructure issues.
}
