# eatonfellowship.github.io

## The problem
The [eatonfellowship.org](https://eatonfellowship.org) website is built using the GoDaddy website builder. The builder has a calendar widget that is flawed in that it always shows the previous day's events instead of the current day which can lead to confusion.

## The solution
It's a bit of a hack, but the html/css/javascript in this project is a replacement for that widget to address the current day issue. It also has the added benefit of giving us finer grained control over the look and feel of the calendar events list.

### Why GitHub?
Well apart from the obvious reasons for using GitHub to store a project's code, like using a [Version Control System](https://guides.github.com/introduction/git-handbook) and all of the great [features](https://github.com/features) on GitHub.com the main reason is [CORS](https://en.wikipedia.org/wiki/Cross-origin_resource_sharing), or more specifically the lack of an **"Access-Control-Allow-Origin: \*"** header on [Google Calendar](https://calendar.google.com/calendar/u/0/embed?src=eatonzoom1133@gmail.com&ctz=America/Los_Angeles), making it impossible for us to grab the iCal file directly from Google using [AJAX](https://en.wikipedia.org/wiki/Ajax_%28programming%29) . So to get around that we are hosting the iCal file here on GitHub which does have the needed Access-Control-Allow-Origin header. It also allows us to host our javascript code from [eatonfellowship.github.io](https://eatonfellowship.github.io) instead of copying it into the GoDaddy website builder itself.

**So**, this means that we have to manually export the iCal file from Google Calendar and upload it to GitHub every time we make a change to the calendar. Luckily for us, the calendar doesn't change often. If you are the one in charge of doing that, here's a [tutorial](https://docs.google.com/document/d/1y--zvK7W-l8b4DcZpR-s-iL0NtK9ZLwd5Y15x6IYyDY/edit?usp=sharing).

# Testing Locally
When you make changes to the calendar and re-export the ics file, it's good to verify locally that things still work.
* download new .ics file to someplace like eaton-new.ics
* change `ec.js` to look at the new file
* change `ec.html` to point to the local `ec.js` file
* from a terminal start a simple python server on port 8000:  `pyton -m http.server 8000` from the same directory as `ec.js`
* load `ec.html` in Safari/chrome
* verify the calendar looks as you expect
* revert back the url changes (in javascript / html)
* move the calendar to the "real" spot (`mv eaton-new.ics eaton.ics`)