# BRANCH DATABASE

## File system

├── .idea/
├── backend-dotnet/
│   ├── .idea/
│   ├── bin/
│   ├── Controllers/
│   ├── Data/
│   ├── DTOs/
│   ├── Models/
│   ├── obj/
│   ├── Properties/
│   ├── Services/
│   ├── .dockerignore
│   ├── appsettings.Development.json
│   ├── appsettings.json
│   ├── Dockerfile
│   ├── Program.cs
│   └── Spice.Api.csproj
├── db-init/
│   └── 01-schema.sql
├── frontend/
│   ├── public/
│   ├── src/
│   ├── .dockerignore
│   ├── Dockerfile
│   └── nginx.conf
├── docker-compose.yml
└── Spice.slnx

## Descriere sistem de fișiere

#### a) Spice.Api.csproj

În `backend-dotnet/Spice.Api.csproj` se regăsesc dependențele necesare pentru sistem:
| Dependență | Versiune |
| ----------- | ----------- |
| Microsoft.AspNetCore.Authentication.JwtBearer | 8.0.11 |
| Microsoft.EntityFrameworkCore | 8.0.11 |
| Microsoft.EntityFrameworkCore.Design | 8.0.11 |
| Pomelo.EntityFrameworkCore.MySql | 8.0.2 |
| Swashbuckle.AspNetCore | 6.9.0 |

#### b) appsettings.json

Configurează conexiunea cu baza de date.

#### c) Program.cs

Programul principal.

#### d) Models

În folderul `spice/backend-dotnet/Models` se regăsesc clasele aferente aplicației:

- Comment.cs
- CookingGroup.cs
- Enums.cs
- Follower.cs
- GroupMember.cs
- Message.cs
- Post.cs
- PostLike.cs
- RoleUpgradeRequest.cs
- SavedPost.cs
- User.cs

#### e) Dockerfiles și docker-compose.yml

2 Dockerfiles (unul pentru frontend și unul pentru backend) și un docker-compose.yml.

## Rulare

1. Deschide Docker/cmd/Powershell în Proiect_IS2_NET/spice.
2. Rulează `docker compose up --build`
3. Așteaptă și deschide pagina la http://localhost:3000.

#### Alte considerente

| Item | Unde | Descriere |
| ----------- | ----------- | ----------- |
| http://localhost:5000/swagger | Deschide Swagger | Browser |
| `docker compose up --build` | Construiește containerul | Terminal Docker/cmd/Powershell |
| `docker compose down -v` | Distruge containerul (inclusiv volumul) | Terminal Docker/cmd/Powershell |
| `dotnet add package numepachet --version x.x.x` | Adaugă pachet nuget | cmd |
| `dotnet nuget locals all --clear` | Șterge toate dependențele instalate local | cmd |

