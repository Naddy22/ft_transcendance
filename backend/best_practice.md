

# Ruby Best Practices for Backend Development.


---

## Ruby Best Practices for Backend Development

### Organizing Your Code

1. Folder Structure:

Separate your code into logical modules:

```plaintext
ft_transcendance-backend/
├── app.rb          # Main app file
├── routes/         # Route files
│   ├── users.rb    # User-related endpoints
│   └── games.rb    # Game-related endpoints
├── models/         # Models (e.g., database interactions)
│   ├── user.rb
│   └── game.rb
├── helpers/        # Helper functions
│   └── auth.rb
├── public/         # Frontend assets
│   └── index.html
├── config/         # Configuration files
│   ├── database.yml
│   └── environment.rb
└── Gemfile
```

2. Example Route File (routes/users.rb):

```rb
require 'sinatra'

get '/users' do
  # Fetch all users
end

post '/register' do
  # User registration logic
end
```

3. Load All Routes in app.rb:

```rb
Dir['./routes/*.rb'].each { |file| require file }
```

---

### Error Handling

Handle errors gracefully to improve user experience:

```rb
error 400 do
  { error: 'Bad Request' }.to_json
end

error 404 do
  { error: 'Not Found' }.to_json
end

error 500 do
  { error: 'Internal Server Error' }.to_json
end
```

---

### Environment Management

Use dotenv to manage environment variables:

1. Create a .env file:

```plaintext
DB_NAME=ft_transcendance
DB_USER=ft_user
DB_PASSWORD=securepassword
```

2. Load variables in app.rb:

```rb
require 'dotenv/load'

db_user = ENV['DB_USER']
db_password = ENV['DB_PASSWORD']
```

---

### Testing

Add basic tests using the minitest gem:

1. Add minitest to your Gemfile:

```
gem 'minitest'
```

2. Create a test file (test/test_app.rb):

```rb
require 'minitest/autorun'
require_relative '../app'

class AppTest < Minitest::Test
  def test_homepage
    response = get '/'
    assert_equal 200, response.status
    assert_equal 'Welcome to ft_transcendance', response.body
  end
end
```

3. Run tests:

```bash
ruby test/test_app.rb
```

---

## To Check

Creating APIs or additional examples for WebSocket use cases...

---
---
