
# API

## REST endpoints

### Authentication

- `POST /auth/register` → `registerUser`
- `POST /auth/login` → `loginUser`
- `POST /auth/logout` → `logoutUser`


### User Managements

- `GET /users` → `getUsers`
- `GET /users/:id` → `getUser`
- `PUT /users/:id` → `updateUser`
- `DELETE /users/:id` → `deleteUser`

### Matches

- `GET /matches` → `getMatches`
- `GET /matches/:id` → `getMatch`

### Matchmaking

- `POST /matchmaking/join` → `joinMatchmaking`

### Tournaments

- `GET /tournaments` → `getTournaments`
- `GET /tournaments/:id` → `getTournament`

