CogniCity MSF Server - API
==========================

## /events/
Events, organised by geography. Returned as either TopoJSON or GeoJSON.

#### Response Object Properties
- id: unique event identifier (e.g. "1")
- status: event status (e.g. "active")
- type: type of event (e.g. "flood")
- created: ISO8601 datetime string with time zone (e.g. "2017-05-22T20:35:00.000Z")
- report_key: unique key for reports submitted against this event (e.g. "rySUYYO-W")
- metadata: event information
- uuid: PostgreSQL UUID for event (currently unused)

* * *

### GET /events
Get all events.

#### Query Parameters
|Query parameter|Description|Format|Required|
|---------------|-----------|------|--------|
|status|Filter by event status (active/inactive)|String|No|
|geoformat|What format should geographic results use (one of topojson, geojson defaults to topojson)|String|No|

#### Example
Here is a simple call to GET all inactive cards.
```sh
curl -X GET "http://localhost:8001/events/?status=inactive"
```
Two events were found
```js
{
  "statusCode": 200,
  "result": {
    "type": "Topology",
    "objects": {
      "output": {
        "type": "GeometryCollection",
        "geometries": [
          {
            "type": "Point",
            "properties": {
              "id": "135",
              "status": "inactive",
              "type": "flood",
              "created": "2017-05-22T20:35:00.000Z",
              "report_key": "H1N9ohFbW",
              "metadata": {
                "user": "integrated tester",
                "updated_by": "integrated tester"
              },
              "uuid": "faa9f051-5dc8-4686-b556-9d426dec2426"
            },
            "coordinates": [
              9999,
              0
            ]
          },
          {
            "type": "Point",
            "properties": {
              "id": "136",
              "status": "inactive",
              "type": "flood",
              "created": "2017-05-22T20:35:00.000Z",
              "report_key": "S11io3YbW",
              "metadata": {
                "user": "integrated tester",
                "updated_by": "integrated tester"
              },
              "uuid": "e1d434bc-031e-45c9-9acc-f1b6ed676fdc"
            },
            "coordinates": [
              9999,
              0
            ]
          }
        ]
      }
    },
    "arcs": [],
    "transform": {
      "scale": [
        0.009500950095009501,
        1
      ],
      "translate": [
        45,
        45
      ]
    },
    "bbox": [
      45,
      45,
      140,
      45
    ]
  }
}
```

* * *

### GET /events/:id
Get a specific event where id is the event identifier.

|Query parameter|Description|Format|Required|
|---------------|-----------|------|--------|
|geoformat|What format should geographic results use (one of topojson, geojson defaults to topojson)|String|No|

* * *

### POST /events/
Create a new event, returns complete event object.

#### Request Body Objects
|Attribute|Description|Format|Required|
|---------------|-----------|------|--------|
|status|Event status (active or inactive)|String|Yes|
|type|Type of event|String|Yes|
|created|Timestamp|String (ISO 8601)|Yes|
|location|Centroid of event|lat/lng in EPSG:4326|Yes|
|metadata|Event information|String (JSON)|

#### Example
Example post to create event.
```sh
curl -X POST \
  http://localhost:8001/events/ \
  -H 'cache-control: no-cache' \
  -H 'content-type: application/json' \
  -H 'postman-token: 081c12f5-6ab8-f215-ddc1-c22a454b9e42' \
  -d '{
								"status": "active",
								"type": "flood",
								"created": "2017-05-22T20:35Z",
								"location":{
									"lat":45,
									"lng":140
								},
								"metadata":{
									"user":"tester"
								}
						}'
```

Event was created, and complete object is returned.
```js
{
  "statusCode": 200,
  "result": {
    "type": "Topology",
    "objects": {
      "output": {
        "type": "GeometryCollection",
        "geometries": [
          {
            "type": "Point",
            "properties": {
              "id": "101",
              "type": "flood",
              "created": "2017-05-22T20:35:00.000Z",
              "report_key": "r1ukxMtW-",
              "metadata": {
                "user": "tester"
              },
              "uuid": "3fbe2c30-0588-4414-9ba7-738e09ed7c63"
            },
            "coordinates": [
              0,
              0
            ]
          }
        ]
      }
    },
    "arcs": [],
    "transform": {
      "scale": [
        1,
        1
      ],
      "translate": [
        140,
        45
      ]
    },
    "bbox": [
      140,
      45,
      140,
      45
    ]
  }
}
```

* * *

### POST /events/:id
Update an existing event's status, append new metadata, and returns complete event object.

#### Request Body Objects
|Attribute|Description|Format|Required|
|---------------|-----------|------|--------|
|status|Event status (active or inactive)|String|Yes|
|metadata|Event information|String (JSON)|
*Note: metadata should contain audit information on the update, such as user responsible etc.*

#### Example
Example post to update event and set status to inactive
```sh
curl -X POST \
curl -X POST \
  http://localhost:8001/events/27 \
  -H 'cache-control: no-cache' \
  -H 'content-type: application/json' \
  -H 'postman-token: 5e96c7ae-b3be-6b3c-c3c8-f3956a70a87f' \
  -d '{
	"status":"inactive",
	"metadata":{
		"updated_by":"Sarah & Duck"
	}
}'
```

Event was updated, and complete object is returned. Note appended metadata.
```js
  {
    "statusCode": 200,
    "result": {
      "type": "Topology",
      "objects": {
        "output": {
          "type": "GeometryCollection",
          "geometries": [
            {
              "type": "Point",
              "properties": {
                "id": "27",
                "status": "inactive",
                "type": "flood",
                "created": "2017-05-22T20:35:00.000Z",
                "report_key": "Hy-t3JFb-",
                "metadata": {
                  "user": "test",
                  "updated_by": "Sarah & Duck"
                },
                "uuid": "59f31294-120a-452d-9a10-b0e637043f6c"
              },
              "coordinates": [
                0,
                0
              ]
            }
          ]
        }
      },
      "arcs": [],
      "transform": {
        "scale": [
          1,
          1
        ],
        "translate": [
          140,
          45
        ]
      },
      "bbox": [
        140,
        45,
        140,
        45
      ]
    }
  }
```

* * *

## /reports/
Reports, organised by geography. Returned as either TopoJSON or GeoJSON.

#### Response Object Properties
- id: unique report identifier (e.g. "1")
- event_id: unique event identifier (e.g. "1")
- status: report status (e.g. "confirmed")
- created: ISO8601 datetime string with time zone (e.g. "2017-05-22T20:35:00.000Z")
- report_key: unique key for reports submitted against this event (e.g. "rySUYYO-W")
- content: report information

* * *

### GET /events
Get all events.

#### Query Parameters
|Query parameter|Description|Format|Required|
|---------------|-----------|------|--------|
|event_id|Filter by event identifier|Integer|No|
|geoformat|What format should geographic results use (one of topojson, geojson defaults to topojson)|String|No|

#### Example
Here is a simple call to GET all inactive cards.
```sh
curl -X GET \
  http://localhost:8001/reports \
  -H 'cache-control: no-cache' \
  -H 'postman-token: 194f1268-36f0-5ee3-65c8-93753ed3374d'
```

One report was found
```js
{
  "statusCode": 200,
  "result": {
    "type": "Topology",
    "objects": {
      "output": {
        "type": "GeometryCollection",
        "geometries": [
          {
            "type": "Point",
            "properties": {
              "id": "52",
              "event_id": "24",
              "status": "verified",
              "created": "2017-06-06T01:08:00.000Z",
              "report_key": "r1gm2JtZb",
              "content": {
                "user": "postman",
                "details": "user input...",
                "verified_by": "postman"
              }
            },
            "coordinates": [
              0,
              0
            ]
          }
        ]
      }
    },
    "arcs": [],
    "transform": {
      "scale": [
        1,
        1
      ],
      "translate": [
        45,
        45
      ]
    },
    "bbox": [
      45,
      45,
      45,
      45
    ]
  }
}
```

### GET /reports/:id
Get a specific report where id is the report identifier.

|Query parameter|Description|Format|Required|
|---------------|-----------|------|--------|
|geoformat|What format should geographic results use (one of topojson, geojson defaults to topojson)|String|No|

* * *

### POST /reports/
Create a new report, returns complete report object.

#### Request Body Objects
|Attribute|Description|Format|Required|
|---------------|-----------|------|--------|
|event_id|Event identifier|Integer|Yes|
|status|Report status (confirmed or verified)|String|Yes|
|created|Timestamp|String (ISO 8601)|Yes|
|location|Point location of report|lat/lng in EPSG:4326|Yes|
|content|Report information|String (JSON)|

#### Example
Example post to create event.
```sh
curl -X POST \
  http://localhost:8001/reports/ \
  -H 'cache-control: no-cache' \
  -H 'content-type: application/json' \
  -H 'postman-token: f59bd374-8a24-6538-7db0-5e828775c701' \
  -d '{
	"event_id": "135",
	"status": "confirmed",
	"created": "2017-05-22T20:35Z",
	"location":{
		"lat":45,
		"lng":45
	},
	"report_key": "H1N9ohFbW",
	"content":{
		"user":"test",
		"text":"This is a report"
	}
}'
```

Event was created, and complete object is returned.
```js
{
  "statusCode": 200,
  "result": {
    "type": "Topology",
    "objects": {
      "output": {
        "type": "GeometryCollection",
        "geometries": [
          {
            "type": "Point",
            "properties": {
              "id": "65",
              "event_id": "135",
              "status": "confirmed",
              "created": "2017-05-22T20:35:00.000Z",
              "report_key": "H1N9ohFbW",
              "content": {
                "text": "This is a report",
                "user": "test"
              }
            },
            "coordinates": [
              0,
              0
            ]
          }
        ]
      }
    },
    "arcs": [],
    "transform": {
      "scale": [
        1,
        1
      ],
      "translate": [
        45,
        45
      ]
    },
    "bbox": [
      45,
      45,
      45,
      45
    ]
  }
}
```
