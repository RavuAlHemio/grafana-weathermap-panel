# Grafana weathermap panel plugin

Warning: extremely basic

Warning: offers very few customization options

Warning: setup is very, very manual

## Installation

Clone this repository (or extract a current ZIP snapshot) into a new
subdirectory of your Grafana `plugins/` subdirectory, e.g.
`plugins/grafana-weathermap-panel/`.

## Data sources

If used as a Grafana panel, all data is requested through Grafana and should
therefore work with all Grafana-supported data sources.

If run standalone (the `dist_genwmap/` subdirectory), only Prometheus is
supported.

## Running standalone

The configuration file for a standalone run is similar to that of a Grafana
panel, but requires some settings abstracted away by Grafana. It is recommended
to first construct the panel using Grafana and use the *Panel JSON* feature to
construct the bulk of the configuration.

An example standalone configuration:

    {
        "weathermap": <the contents of Panel JSON in Grafana>,
        "dataSources": {
            "prometheus": "http://prometheus:9090"
        },
        "lookbackInterval": "15m"
    }
