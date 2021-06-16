#!/bin/bash

TOKEN="<your token>"

# Special characters such as spaces need to be escaped
SEARCH_TEXT="12%20sydney%20road%20manly"

curl -X "GET" \
  "https://api.addressaustralia.com.au/v1/enrich/$SEARCH_TEXT" \
  -H "accept: application/json" \
  -H "Authorization: Bearer $TOKEN"
