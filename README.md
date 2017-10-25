# rhmap-params
This module adds a new endpoint to the running Cloud app. This new endpoint returns back the fh parameters needed to do a manual call from an external program like POSTMAN.

The params check returns a JSON response formatted as shown 
below (using a single whitespace between key and values):

```json
{
    "body": {
        "cuid":"<uuid>",
        "cuidMap":null,
        "destination":"web",
        "sdk_version":"FH_PHONEGAP_SDK",
        "appid":"<App ID>",
        "appkey":"<App Key>",
        "projectid":"<Project Id>",
        "connectiontag":"<Connection Tag>",
    },
    "header": {
        "X-FH-cuid":"<uuid>",
        "X-FH-cuidMap":null,
        "X-FH-destination":"web",
        "X-FH-sdk_version":"FH_PHONEGAP_SDK",
        "X-FH-appid":"<App ID>",
        "X-FH-appkey":"<App Key>",
        "X-FH-projectid":"<Project Id>",
        "X-FH-connectiontag":"<Connection Tag>",
    }
}
```

## Usage
The module should be initialised from your application.js 
file as shown below. This will setup a new endpoint in your application called "/params", so ensure none of your endpoints are called params to avoid conflicts.

This modules requires an API_KEY, this can be created at: Profile > Settings > API Key Management > Add New Key

```javascript
// Before var app = express()
require('rhmap-params')(app,"<API_KEY>");
```
