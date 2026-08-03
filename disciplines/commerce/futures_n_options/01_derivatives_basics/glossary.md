{
  "$schema": "https://vega.github.io/schema/vega-lite/v5.json",

  "data": {
    "values": [
      {"Type":"Futures","Volume":45},
      {"Type":"Options","Volume":35},
      {"Type":"Swaps","Volume":15},
      {"Type":"Forwards","Volume":5}
    ]
  },

  "mark": "bar",

  "encoding": {
    "x": {
      "field": "Type",
      "type": "nominal"
    },
    "y": {
      "field": "Volume",
      "type": "quantitative"
    }
  }
}