# BlogPostic
Social media platform that combines blogs and posts.

# Setup Projct
- Clone project
- npm i 
- clone [Web-App](https://github.com/s4timuen/BlogPostic-Web-App) into vue folder
- cd vue
- npm i 

# Config
- create config.env in root folder
- example config:
```
NODE_ENV=development
PORT=8080

DATABASE=somedb:<PASSWORD>somedb.io/somecollection
DATABASE_LOCAL=somedb://localhost:8080/somecollection
DATABASE_PASSWORD=supersecurepassword

JWT_SECRET=supersecuresecret
JWT_EXPIRES_IN=30d
JWT_COOKIE_EXPIRES_IN=90

WEB_APP_URL=http://localhost
WEB_APP_PORT=8081 
```

# Start Project
- npm run watch:js (start bundler)
- npm run nodemon (start server)
- cd vue
- npm run serve (start web-app)
