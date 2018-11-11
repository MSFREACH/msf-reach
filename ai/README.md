# Vizalytics AI API

An API is provided at https://msf.vizalytics.com by Vizalytics for sending current event data and returning relevant contacts (based on the contacts in the MSF REACH database), documents (based on supplied documents from the MSF SharePoint), and suggestions for response (based on mission history data in the MSF REACH database). 

Data on the event is POSTed in the HTTP body in JSON format, see [example body](example_post_body.json) and returned as JSON, see [example response](example_response.json). The API is documented in [Swagger](https://swagger.io) [JSON](swagger.json) and [YAML](swagger.yaml) formats.