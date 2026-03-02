---
layout: page
title: Quasi-static Planning Through Contact
description: Contact-rich planning experiments for quasi-static pushing with contact smoothing analysis.
img: assets/img/projects/planning_through_contact/good.mov
importance: 0
category: Robotics
---

Final project for 16-745 at CMU on quasi-static planning through contact.

[Paper (PDF)]({{ '/assets/img/projects/planning_through_contact/16_745_Project_Report%20%282%29.pdf' | relative_url }}) |
[Poster (PDF)]({{ '/assets/img/projects/planning_through_contact/Quasi-static%20Planning%20Through%20Contact%20-%20Poster.pdf' | relative_url }})

## Successful Examples

In these demos, the ball has no pre-specified trajectory and finds the contact plans via trajectory optimization on the smoothed contact dynamics directly.

<div class="row">
  <div class="col-sm mt-3 mt-md-0">
    {% include video.liquid path="assets/img/projects/planning_through_contact/good.mov" class="img-fluid rounded z-depth-1" controls=true loop=true muted=true title="Good trajectory 1" %}
  </div>
  <div class="col-sm mt-3 mt-md-0">
    {% include video.liquid path="assets/img/projects/planning_through_contact/good2.mov" class="img-fluid rounded z-depth-1" controls=true loop=true muted=true title="Good trajectory 2" %}
  </div>
</div>

<div class="row">
  <div class="col-sm mt-3 mt-md-0">
    {% include video.liquid path="assets/img/projects/planning_through_contact/good_rotate.mov" class="img-fluid rounded z-depth-1" controls=true loop=true muted=true title="Good rotating push" %}
  </div>
  <div class="col-sm mt-3 mt-md-0">
    {% include video.liquid path="assets/img/projects/planning_through_contact/simple_pusht_good.mov" class="img-fluid rounded z-depth-1" controls=true loop=true muted=true title="Simple Push-T good case" %}
  </div>
</div>

## Contact Smoothing: Force at a Distance and Reducing Rho
Examples of how the contact smoothing behavior impacts the dynamics, contact smoothing is iteratively reduced over trials.
<div class="row">
  <div class="col-sm mt-3 mt-md-0">
    {% include video.liquid path="assets/img/projects/planning_through_contact/force_at_dist1.mov" class="img-fluid rounded z-depth-1" controls=true loop=true muted=true title="Force at a distance" %}
  </div>
  <div class="col-sm mt-3 mt-md-0">
    {% include video.liquid path="assets/img/projects/planning_through_contact/reduce_rho.mov" class="img-fluid rounded z-depth-1" controls=true loop=true muted=true title="Reduce rho" %}
  </div>
</div>

<div class="row">
  <div class="col-sm mt-3 mt-md-0">
    {% include video.liquid path="assets/img/projects/planning_through_contact/iteratively_reduce_rho.mov" class="img-fluid rounded z-depth-1" controls=true loop=true muted=true title="Iteratively reduce rho" %}
  </div>
  <div class="col-sm mt-3 mt-md-0">
    {% include figure.liquid loading="eager" path="assets/img/projects/planning_through_contact/rho.png" title="Rho visualization" class="img-fluid rounded z-depth-1" %}
  </div>
</div>

## Fails

<div class="row">
  <div class="col-sm mt-3 mt-md-0">
    {% include video.liquid path="assets/img/projects/planning_through_contact/orient_but_fail.mov" class="img-fluid rounded z-depth-1" controls=true loop=true muted=true title="Orient but fail 1" %}
  </div>
  <div class="col-sm mt-3 mt-md-0">
    {% include video.liquid path="assets/img/projects/planning_through_contact/orient_but_fail2.mov" class="img-fluid rounded z-depth-1" controls=true loop=true muted=true title="Orient but fail 2" %}
  </div>
</div>
