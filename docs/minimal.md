# Minimal configuration for the Grafana weathermap plugin

In this example, we have a tiny network consisting of two switches and are using
Grafana to visualize traffic and CPU statistics collected using Prometheus.

The two switches are named `Sw1` and `Sw2`; they are interconnected via
interface `Eth1/54` on both ends.

The metrics we would like to visualize are

* `net:interface:in:ratePercent:max15min`, the maximum percentage of link
  saturation with incoming data over the last 15 minutes (with labels *device*
  and *interface*)
* `net:interface:out:ratePercent:max15min`, the maximum percentage of link
  saturation with outgoing data over the last 15 minutes (with labels *device*
  and *interface*)
* `cpu:usage:percent:max15min`, the maximum CPU usage percentage over the last
  15 minutes (with label *device*)

## Defining the metrics

After adding the weathermap panel to our Grafana dashboard, we define the two
metrics we are interested in for this weathermap.

On the *Metrics* tab, first, choose the correct data source.

Click on *Add Query* and type `net:interface:in:ratePercent:max15min`. The
legend text is used to refer to the metrics from within the weathermap, so type
`{{device}}--in--{{interface}}` into the *Legend format* field. Finally, tick
the *Instant* checkbox, as the metric already calculates an aggregate value.

Do the same for `net:interface:out:ratePercent:max15min` (with legend text
`{{device}}--out--{{interface}}`) and `cpu:usage:percent:max15min` (with legend
text `{{device}}--cpu`).

We can now access, at the very least, the following metrics from within the
weathermap configuration:

* `Sw1--in--Eth1/54`
* `Sw2--in--Eth1/54`
* `Sw1--out--Eth1/54`
* `Sw2--out--Eth1/54`
* `Sw1--cpu`
* `Sw2--cpu`

## Defining basic options

On the *Options* tab, we set the canvas *Width* and *Height* both to 600 and the
*Stroke width* to 4.

We choose the legend *Type* to be *vertical, labels on the right*, set *X* to 0,
*Y* to 10, *Length* to 550 and *Width* to 5.

As the gradient *Type*, we choose *linear*. We add two stops:

* green: *Position* 0, *Stroke* to `#7eb26d`, *Fill* to `#b7dbab`, and tick
  *Show label in legend*.
* red: *Position* 100, *Stroke* to `#e24d42`, *Fill* to `#f29191`, and tick
  *Show label in legend*.

Since we chose a linear gradient, the values in between will be interpolated.

## Adding the switches as nodes

On the *Nodes* tab, we add two nodes:

* *Label* `Sw1`, *X* 100, *Y* 290, *W* 35, *H* 20, *Metric* `Sw1--cpu`
* *Label* `Sw2`, *X* 400, *Y* 290, *W* 35, *H* 20, *Metric* `Sw2--cpu`

The nodes should appear on the weathermap and be colored according to their CPU
usage.

## Adding the link between the switches as an edge

On the *Edges* tab, we add a single edge with the following settings:

* *Node 1:* `Sw1`
* *Node 2:* `Sw2`
* *Bend direction*: empty
* *Bend magnitude*: empty
* *Metric*: `Sw1--out--Eth1/54`
* *Metric 2*: `Sw2--out--Eth1/54`

(We could also use the corresponding `in` metrics; generally, the result should
be the same.)

A connection appears between the two nodes on the weathermap. Its left half is
colored according to the traffic going from `Sw1` to `Sw2`; its right half
according to the traffic going in the opposite direction.
