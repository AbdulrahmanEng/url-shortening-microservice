URL Shortening Microservice
==========================

Creates shortened urls.

## Tools

* [Node](https://nodejs.org).
* [Express](https://expressjs.com/)
* [nedb](https://github.com/louischatriot/nedb)

## Instructions

1. Install packages.

`npm install`

2. Run app.

`npm start`
   
3. Pass a url as a parameter.

`https://shortn-url.glitch.me/new/https://www.alphabetagammadelta.com`

4. Take note of the shortened url.

```
{
  "original_url": "https://www.alpabetagammadelta.com",
  "short_url": "https://shortn-url.glitch.me/3"
}
```