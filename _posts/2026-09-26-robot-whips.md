---
layout: post
title: The need for speed
author: Krishna Suresh and Chris Atkeson
date: 2026-09-26
description: ""
tags: []
categories: []
related_posts: false
---

<video
src="{{ '/assets/video/robot-whips/teaser.mp4' | relative_url }}"
poster="{{ '/assets/img/robot-whips/teaser.jpg' | relative_url }}"
width="1920"
height="1080"
class="img-fluid rounded w-100"
controls
autoplay
playsinline
preload="metadata"
aria-label="Robot whips teaser"

> </video>

<p class="text-center"><i class="fa-solid fa-volume-high" aria-hidden="true"></i> <em>Sound on — press play if needed.</em></p>

Once upon a time, robot learning from demonstration of dynamic tasks was really time consuming and annoying to get working. But today, thanks to the magic of agentic programming, it can be surprisingly straightforward. And sometimes, **just copying the demonstrating** works, and the robot does something that impresses (or scares) your friends.

Many current robot demos show amazing capabilities but we often only see robots perform quasi-static behaviors. Quasi-static means that the robot can be paused and resumed at any time without the physics of the world taking over and causing problems. Often a key element of the robot training pipeline is human teleoperation; either done directly with the robot or through robot gripper hands such as [UMI](https://umi-gripper.github.io/). But unfortunately, doing dynamic tasks like juggling using teleoperation is hard[^teleop].

Motion capture with lightweight (or no) markers provides an easier way to capture dynamic behaviors directly since doing hard tasks like [cutting a tree](https://www.youtube.com/shorts/BEsc653WLAs?is=-9BpDgYcV-9lYeNm) would be difficult to demonstrate through a gripper interface[^offline]. Today there are a number of solutions which aim to estimate human hand and body poses such as [GVHMR](https://zju3dv.github.io/gvhmr/) or [HaMeR](https://geopavlakos.github.io/hamer/). And a number of subsequent works which aim to retarget that human motion to humanoid robots to achieve dynamic behaviors ([PHP Parkour](https://php-parkour.github.io/)). These examples are often limited to locomotion as retargeting of manipulation behaviors is not fully there yet (but there are a number of promising results: [RewardAI](https://www.rewardai.com/blog/OM-1/), [Unitree](https://www.youtube.com/watch?v=24h4FTH7plY)).

We found that if the robot is able to track just the demonstration hand motion well enough, it can actually perform some complex dynamic manipulation skills open-loop without any learning. This is actually annoying since one
of us is trying to do a thesis on learning dynamic tasks. We capture a human demonstration of a dynamic task such as cracking a whip, then generate a robot trajectory to track the hand motion, and execute open-loop tracking of the trajectory on the robot. Today this pipeline can be nearly fully automatically implemented with GPT-6 Astra. Below we show a two example dynamic manipulation tasks: cracking a whip and lassoing a cleat.[^robots]

Quick side note: the whips shown in this post are called signal/stock whips. These whips are built to generate the loud cracking noise when the tip breaks the sound barrier and is a popular art form: [Bavarian Whip Show](https://www.youtube.com/watch?v=4I6rVhg5UEY), [Four Corners](https://youtu.be/ietBtr7sOvs?t=41).

# Cracking a whip

<figure class="mx-auto my-4" style="max-width: 600px;" data-video-source-toggle>
  <div class="text-center mb-2">
    <div class="media-speed-toggle" role="group" aria-label="Cattleman's crack playback speed">
      <button
        type="button"
        data-video-src="{{ '/assets/video/robot-whips/cattleman1x.mp4' | relative_url }}"
        aria-controls="cattleman-video"
        aria-pressed="false"
      >Realtime <span class="media-speed-toggle-rate">1×</span></button>
      <button
        type="button"
        data-video-src="{{ '/assets/video/robot-whips/cattlemanslow.mp4' | relative_url }}"
        aria-controls="cattleman-video"
        aria-pressed="true"
      >Slow <span class="media-speed-toggle-rate">1/8×</span></button>
    </div>
  </div>
  <video
    id="cattleman-video"
    src="{{ '/assets/video/robot-whips/cattlemanslow.mp4' | relative_url }}"
    poster="{{ '/assets/img/robot-whips/cattlemanslow.jpg' | relative_url }}"
    width="900"
    height="900"
    class="img-fluid rounded w-100"
    controls
    data-lazy-autoplay
    muted
    loop
    playsinline
    preload="none"
    aria-label="Human demonstration of a cattleman's crack"
  ></video>
  <figcaption class="caption text-center">Human demonstration of a cattleman’s crack.</figcaption>
</figure>

<script src="{{ '/assets/js/video-lazy-load.js' | relative_url | bust_file_cache }}" defer></script>
<script src="{{ '/assets/js/video-source-toggle.js' | relative_url | bust_file_cache }}" defer></script>

We capture the human motion using Vicon motion capture with retroreflective markers on the whip handle (additional markers are placed on the whip to track the whip motion which makes data visualization clearer and cool to watch):

<p id="visualization-interaction-note"><em>The 3D visualizations below are interactive: drag to rotate and scroll to zoom.</em></p>

{% assign cattleman_mocap_realtime = '/assets/viser/robot-whips/cattlemans/mocap_realtime.viser' | relative_url %}
{% assign cattleman_mocap_slow = '/assets/viser/robot-whips/cattlemans/mocap_slow.viser' | relative_url %}
{% assign viser_viewer = '/assets/viser/viewer/' | relative_url %}

<figure class="mx-auto my-4" style="max-width: 600px;" data-viser-source-toggle>
  <div class="text-center mb-2">
    <div class="media-speed-toggle" role="group" aria-label="Cattleman's mocap playback speed">
      <button
        type="button"
        data-viser-src="{{ viser_viewer }}?playbackPath={{ cattleman_mocap_realtime | url_encode }}"
        aria-controls="cattleman-mocap"
        aria-pressed="true"
      >Realtime <span class="media-speed-toggle-rate">1×</span></button>
      <button
        type="button"
        data-viser-src="{{ viser_viewer }}?playbackPath={{ cattleman_mocap_slow | url_encode }}"
        aria-controls="cattleman-mocap"
        aria-pressed="false"
      >Slow <span class="media-speed-toggle-rate">0.25×</span></button>
    </div>
  </div>
  <div class="viser-embed">
    <iframe
      id="cattleman-mocap"
      src="{{ viser_viewer }}?playbackPath={{ cattleman_mocap_realtime | url_encode }}"
      title="Cattleman's crack motion capture visualization"
      aria-describedby="visualization-interaction-note"
      width="100%"
      height="500"
      loading="lazy"
    ></iframe>
  </div>
  <figcaption class="caption text-center">Motion capture of the cattleman’s crack.</figcaption>
</figure>

<script src="{{ '/assets/js/viser-source-toggle.js' | relative_url | bust_file_cache }}" defer></script>

A robot trajectory is then generated to track the demonstration hand motion (blue). The tracking is not exact since the robot trajectory (yellow) must obey joint velocity and dynamics limits.

{% assign cattleman_trajectory_realtime = '/assets/viser/robot-whips/cattlemans/traj1x.viser' | relative_url %}
{% assign cattleman_trajectory_slow = '/assets/viser/robot-whips/cattlemans/trajslow.viser' | relative_url %}

<figure class="mx-auto my-4" style="max-width: 600px;" data-viser-source-toggle>
  <div class="text-center mb-2">
    <div class="media-speed-toggle" role="group" aria-label="Cattleman's trajectory playback speed">
      <button
        type="button"
        data-viser-src="{{ viser_viewer }}?playbackPath={{ cattleman_trajectory_realtime | url_encode }}"
        aria-controls="cattleman-trajectory"
        aria-pressed="true"
      >Realtime <span class="media-speed-toggle-rate">1×</span></button>
      <button
        type="button"
        data-viser-src="{{ viser_viewer }}?playbackPath={{ cattleman_trajectory_slow | url_encode }}"
        aria-controls="cattleman-trajectory"
        aria-pressed="false"
      >Slow <span class="media-speed-toggle-rate">0.25×</span></button>
    </div>
  </div>
  <div class="viser-embed">
    <iframe
      id="cattleman-trajectory"
      src="{{ viser_viewer }}?playbackPath={{ cattleman_trajectory_realtime | url_encode }}"
      title="Cattleman's crack robot trajectory visualization"
      aria-describedby="visualization-interaction-note"
      width="100%"
      height="500"
      loading="lazy"
    ></iframe>
  </div>
  <figcaption class="caption text-center">Robot trajectory tracking the cattleman’s crack.</figcaption>
</figure>

Finally the robot can track that generated trajectory to crack a whip

<figure class="mx-auto my-4" style="max-width: 600px;" data-video-source-toggle>
  <div class="text-center mb-2">
    <div class="media-speed-toggle" role="group" aria-label="Robot cattleman's crack playback speed">
      <button
        type="button"
        data-video-src="{{ '/assets/video/robot-whips/cattlerobot1x.mp4' | relative_url }}"
        aria-controls="cattleman-robot-video"
        aria-pressed="false"
      >Realtime <span class="media-speed-toggle-rate">1×</span></button>
      <button
        type="button"
        data-video-src="{{ '/assets/video/robot-whips/cattlerobot18x.mp4' | relative_url }}"
        aria-controls="cattleman-robot-video"
        aria-pressed="true"
      >Slow <span class="media-speed-toggle-rate">1/8×</span></button>
    </div>
  </div>
  <video
    id="cattleman-robot-video"
    src="{{ '/assets/video/robot-whips/cattlerobot18x.mp4' | relative_url }}"
    poster="{{ '/assets/img/robot-whips/cattlerobot18x.jpg' | relative_url }}"
    width="1920"
    height="1080"
    class="img-fluid rounded w-100"
    controls
    data-lazy-autoplay
    muted
    loop
    playsinline
    preload="none"
    aria-label="Robot performing a cattleman's crack"
  ></video>
  <figcaption class="caption text-center">Robot performing a cattleman’s crack.</figcaption>
</figure>

Learning from mocap works with different types of whip crack motions such as a front cattleman:

{% assign front_cattleman_mocap_realtime = '/assets/viser/robot-whips/frontcattle/mocap.viser' | relative_url %}
{% assign front_cattleman_mocap_slow = '/assets/viser/robot-whips/frontcattle/mocapslow.viser' | relative_url %}
{% assign front_cattleman_trajectory_realtime = '/assets/viser/robot-whips/frontcattle/frontcattletraj.viser' | relative_url %}
{% assign front_cattleman_trajectory_slow = '/assets/viser/robot-whips/frontcattle/frontcattletrajslow.viser' | relative_url %}

<div id="front-cattleman-comparison" class="row my-4">
  <div class="col-md-6 mb-4">
    <figure class="mb-0" data-viser-source-toggle>
      <figcaption class="text-center mb-2 font-weight-bold">Motion capture</figcaption>
      <div class="text-center mb-2">
        <div class="media-speed-toggle" role="group" aria-label="Front cattleman's mocap playback speed">
          <button
            type="button"
            data-viser-src="{{ viser_viewer }}?playbackPath={{ front_cattleman_mocap_realtime | url_encode }}"
            aria-controls="front-cattleman-mocap"
            aria-pressed="false"
          >Realtime <span class="media-speed-toggle-rate">1×</span></button>
          <button
            type="button"
            data-viser-src="{{ viser_viewer }}?playbackPath={{ front_cattleman_mocap_slow | url_encode }}"
            aria-controls="front-cattleman-mocap"
            aria-pressed="true"
          >Slow <span class="media-speed-toggle-rate">0.25×</span></button>
        </div>
      </div>
      <div class="viser-embed">
        <iframe
          id="front-cattleman-mocap"
          src="{{ viser_viewer }}?playbackPath={{ front_cattleman_mocap_slow | url_encode }}"
          title="Front cattleman's crack motion capture visualization"
          aria-describedby="visualization-interaction-note"
          width="100%"
          height="450"
          loading="lazy"
        ></iframe>
      </div>
    </figure>
  </div>
  <div class="col-md-6 mb-4">
    <figure class="mb-0" data-viser-source-toggle>
      <figcaption class="text-center mb-2 font-weight-bold">Robot trajectory</figcaption>
      <div class="text-center mb-2">
        <div class="media-speed-toggle" role="group" aria-label="Front cattleman's trajectory playback speed">
          <button
            type="button"
            data-viser-src="{{ viser_viewer }}?playbackPath={{ front_cattleman_trajectory_realtime | url_encode }}"
            aria-controls="front-cattleman-trajectory"
            aria-pressed="false"
          >Realtime <span class="media-speed-toggle-rate">1×</span></button>
          <button
            type="button"
            data-viser-src="{{ viser_viewer }}?playbackPath={{ front_cattleman_trajectory_slow | url_encode }}"
            aria-controls="front-cattleman-trajectory"
            aria-pressed="true"
          >Slow <span class="media-speed-toggle-rate">0.25×</span></button>
        </div>
      </div>
      <div class="viser-embed">
        <iframe
          id="front-cattleman-trajectory"
          src="{{ viser_viewer }}?playbackPath={{ front_cattleman_trajectory_slow | url_encode }}"
          title="Front cattleman's crack robot trajectory visualization"
          aria-describedby="visualization-interaction-note"
          width="100%"
          height="450"
          loading="lazy"
        ></iframe>
      </div>
    </figure>
  </div>
</div>

<figure class="mx-auto my-4" style="max-width: 600px;" data-video-source-toggle>
  <div class="text-center mb-2">
    <div class="media-speed-toggle" role="group" aria-label="Robot front cattleman's crack playback speed">
      <button
        type="button"
        data-video-src="{{ '/assets/video/robot-whips/front_cattle.mp4' | relative_url }}"
        aria-controls="front-cattleman-robot-video"
        aria-pressed="false"
      >Realtime <span class="media-speed-toggle-rate">1×</span></button>
      <button
        type="button"
        data-video-src="{{ '/assets/video/robot-whips/front_cattle_slow.mp4' | relative_url }}"
        aria-controls="front-cattleman-robot-video"
        aria-pressed="true"
      >Slow motion</button>
    </div>
  </div>
  <video
    id="front-cattleman-robot-video"
    src="{{ '/assets/video/robot-whips/front_cattle_slow.mp4' | relative_url }}"
    poster="{{ '/assets/img/robot-whips/front_cattle_slow.jpg' | relative_url }}"
    width="1920"
    height="1080"
    class="img-fluid rounded w-100"
    controls
    data-lazy-autoplay
    muted
    loop
    playsinline
    preload="none"
    aria-label="Robot performing a front cattleman's crack"
  ></video>
  <figcaption class="caption text-center">Robot performing a front cattleman’s crack.</figcaption>
</figure>

Sometimes even if the robot can't track the demonstration trajectory perfectly the robot is still able to crack the whip:

{% assign overhead_trajectory_realtime = '/assets/viser/robot-whips/overhead/overheadtraj.viser' | relative_url %}
{% assign overhead_trajectory_slow = '/assets/viser/robot-whips/overhead/overheadtrajslow.viser' | relative_url %}

<div id="overhead-comparison" class="row my-4">
  <div class="col-md-6 mb-4">
    <figure class="mb-0" data-viser-source-toggle>
      <figcaption class="text-center mb-2 font-weight-bold">Robot trajectory</figcaption>
      <div class="text-center mb-2">
        <div class="media-speed-toggle" role="group" aria-label="Overhead crack trajectory playback speed">
          <button
            type="button"
            data-viser-src="{{ viser_viewer }}?playbackPath={{ overhead_trajectory_realtime | url_encode }}"
            aria-controls="overhead-trajectory"
            aria-pressed="false"
          >Realtime <span class="media-speed-toggle-rate">1×</span></button>
          <button
            type="button"
            data-viser-src="{{ viser_viewer }}?playbackPath={{ overhead_trajectory_slow | url_encode }}"
            aria-controls="overhead-trajectory"
            aria-pressed="true"
          >Slow <span class="media-speed-toggle-rate">0.25×</span></button>
        </div>
      </div>
      <div class="viser-embed embed-responsive embed-responsive-4by3">
        <iframe
          id="overhead-trajectory"
          class="embed-responsive-item"
          src="{{ viser_viewer }}?playbackPath={{ overhead_trajectory_slow | url_encode }}"
          title="Overhead whip crack robot trajectory visualization"
          aria-describedby="visualization-interaction-note"
          loading="lazy"
        ></iframe>
      </div>
    </figure>
  </div>
  <div class="col-md-6 mb-4">
    <figure class="mb-0" data-video-source-toggle>
      <figcaption class="text-center mb-2 font-weight-bold">Robot video</figcaption>
      <div class="text-center mb-2">
        <div class="media-speed-toggle" role="group" aria-label="Robot overhead crack playback speed">
          <button
            type="button"
            data-video-src="{{ '/assets/video/robot-whips/overhead.mp4' | relative_url }}"
            aria-controls="overhead-robot-video"
            aria-pressed="false"
          >Realtime <span class="media-speed-toggle-rate">1×</span></button>
          <button
            type="button"
            data-video-src="{{ '/assets/video/robot-whips/overhead_slow.mp4' | relative_url }}"
            aria-controls="overhead-robot-video"
            aria-pressed="true"
          >Slow motion</button>
        </div>
      </div>
      <div class="embed-responsive embed-responsive-4by3 rounded bg-white">
        <video
          id="overhead-robot-video"
          src="{{ '/assets/video/robot-whips/overhead_slow.mp4' | relative_url }}"
          poster="{{ '/assets/img/robot-whips/overhead_slow.jpg' | relative_url }}"
          width="1920"
          height="1080"
          class="embed-responsive-item bg-white"
          style="object-fit: contain;"
          controls
          data-lazy-autoplay
          muted
          loop
          playsinline
          preload="none"
          aria-label="Robot performing an overhead whip crack"
        ></video>
      </div>
    </figure>
  </div>
</div>

# Lassoing a cleat

{% assign cleat_realtime = '/assets/viser/robot-whips/cleat/cleat.viser' | relative_url %}
{% assign cleat_slow = '/assets/viser/robot-whips/cleat/cleatslow.viser' | relative_url %}

<figure class="mx-auto my-4" style="max-width: 600px;" data-viser-source-toggle>
  <div class="text-center mb-2">
    <div class="media-speed-toggle" role="group" aria-label="Cleat visualization playback speed">
      <button
        type="button"
        data-viser-src="{{ viser_viewer }}?playbackPath={{ cleat_realtime | url_encode }}"
        aria-controls="cleat-visualization"
        aria-pressed="false"
      >Realtime <span class="media-speed-toggle-rate">1×</span></button>
      <button
        type="button"
        data-viser-src="{{ viser_viewer }}?playbackPath={{ cleat_slow | url_encode }}"
        aria-controls="cleat-visualization"
        aria-pressed="true"
      >Slow <span class="media-speed-toggle-rate">0.25×</span></button>
    </div>
  </div>
  <div class="viser-embed">
    <iframe
      id="cleat-visualization"
      src="{{ viser_viewer }}?playbackPath={{ cleat_slow | url_encode }}"
      title="Lassoing a cleat interactive visualization"
      aria-describedby="visualization-interaction-note"
      width="100%"
      height="500"
      loading="lazy"
    ></iframe>
  </div>
  <figcaption class="caption text-center">Lassoing a cleat.</figcaption>
</figure>

<figure class="mx-auto my-4" style="max-width: 600px;" data-video-source-toggle>
  <div class="text-center mb-2">
    <div class="media-speed-toggle" role="group" aria-label="Cleat robot video playback speed">
      <button
        type="button"
        data-video-src="{{ '/assets/video/robot-whips/cleat.mp4' | relative_url }}"
        aria-controls="cleat-robot-video"
        aria-pressed="false"
      >Realtime <span class="media-speed-toggle-rate">1×</span></button>
      <button
        type="button"
        data-video-src="{{ '/assets/video/robot-whips/cleat_slow.mp4' | relative_url }}"
        aria-controls="cleat-robot-video"
        aria-pressed="true"
      >Slow motion</button>
    </div>
  </div>
  <video
    id="cleat-robot-video"
    src="{{ '/assets/video/robot-whips/cleat_slow.mp4' | relative_url }}"
    poster="{{ '/assets/img/robot-whips/cleat_slow.jpg' | relative_url }}"
    width="900"
    height="900"
    class="img-fluid rounded w-100"
    controls
    data-lazy-autoplay
    muted
    loop
    playsinline
    preload="none"
    aria-label="Robot lassoing a cleat"
  ></video>
  <figcaption class="caption text-center">Robot lassoing a cleat.</figcaption>
</figure>

More videos of robot lassoing [https://www.youtube.com/shorts/ey0uHuXv8Fs](https://www.youtube.com/shorts/ey0uHuXv8Fs).

# How to automatically track a demonstration?

This process used to be a tedious endeavor involving manually cleaning and curating data, complex solvers, dynamics, and data management. But in the age of agentic coding tools, GPT-6 Astra can automatically implement retargeting pipelines from a single prompt by pulling from and combining the many wonderful open source tools created by the robotics community ([drake](https://drake.mit.edu/), [casadi](https://web.casadi.org/), [pinocchio](https://github.com/stack-of-tasks/pinocchio), [pink](https://github.com/pink-kinematics/pink), [mjlab](https://github.com/mujocolab/mjlab), etc.). One problem with agentic programming is that it makes credit assignment (acknowledgements and thanks) to other people or agents harder.

Given a hand trajectory, the goal of retargeting is to generate a robot trajectory which tracks the motion of the hand as accurately as possible. If we didn’t care about the speed of the hand then this can be performed using many inverse kinematics methods by either sampling many intermediate points and generating feasible joint configurations (then timing can be done with [TOPPRA](https://arxiv.org/abs/1707.07239)) or via differential inverse kinematics to smoothly track a hand path ([great tutorial on IK](https://www.youtube.com/watch?v=D4sH7ETHr-k&list=WL&index=1&t=1555s)). However, these methods do not take into account the robot dynamics. On the other hand, methods like trajectory optimization and reinforcement learning have been used to achieve dynamically feasible trajectories for high speed motions but can get stuck in local minima or be unable to track the demonstration accurately. One solution is to simply combine the methods by warm-starting the trajectory optimization with a solution generated by an inverse kinematics solver.

In addition to robot trajectory generation, Astra was able to implement the required systems for tracking the trajectory from automatically collecting calibration data, generating a dynamics model and implementing an inverse dynamics controller.

<figure class="mx-auto my-4" style="max-width: 600px;">
  <video
    id="calibration-video"
    src="{{ '/assets/video/robot-whips/calib.mp4' | relative_url }}"
    poster="{{ '/assets/img/robot-whips/calib.jpg' | relative_url }}"
    width="1080"
    height="1138"
    class="img-fluid rounded w-100"
    controls
    data-lazy-autoplay
    muted
    loop
    playsinline
    preload="none"
    aria-label="Robot collecting calibration data"
  ></video>
  <figcaption class="caption text-center">Robot collecting calibration data using a script written by GPT-6 Astra.</figcaption>
</figure>

# What if the robot can’t track the demonstration?

Sometimes high speed motion performed by the demonstrator is too fast or the kinematics are not feasible given the robot’s morphology and joint limits. We explored this issue in past work: [https://flying-knots.github.io/](https://flying-knots.github.io/), where the robot is unable to track the demonstration trajectory accurately but with a simple dynamics model and less than 10 trials on the hardware the robot can learn to perform the task.

# Why do we care about dynamic manipulation?

Because it is fun!

But we do have to call out a nice [paper](https://publications.ri.cmu.edu/storage/publications/pub_files/pub2/mason_matthew_1993_1/mason_matthew_1993_1.pdf) by Matt Mason and Kevin Lynch emphasizing the joy of movement and the need for speed.

<!-- # When would retargeting fail?

Contact dynamics, force control, changes to the dynamics -->

# Send us your demos and ideas
Send us your work on robots doing or learning dynamic tasks. Also if you have any cool dynamic manipulation tasks you want a robot to do send it our way! 

## Acknowledgments

This work was funded by the [Robotics and AI Institute](https://rai-inst.com/).

## Footnotes

[^robots]: The robot in the whip cracking demo is an OpenarmX and the robot in the cleat demo is an xArm7 (with green tape to reduce IR reflections of the mocap system).

[^teleop]: It is difficult to teleoperate a robot fast because 1) the human operator feels different inertial forces than the robot experiences, and perception of contact or grasp forces is difficult, 2) robot velocity, acceleration, force or torque, and motor current and power limits are not intuitive to the human operator, especially near singularities, which happens often with the wrist, and 3) it is scary and there is a high risk of damaging the manipulated objects, the teleoperation setup, or the robot.

<!-- Teleop limits the capabilities of the robot primarily in its ability to produce high velocity motions since robot motions which can achieve high velocity are difficult to generate online since a controller would need to take into account the full motion to effectively actuate the motors to not violate joint and power limits (velocity, torque, current draw, etc.). -->

[^offline]: For data capture where a human demonstrator is performing a task through a data capture glove such as UMI, Koala, etc. it is possible to generate robot motions to track fast hand trajectories, but it is often difficult for a demonstrator to actually perform dynamic behaviors through the capture interface due to its weight, momentum, and bulk. Try to brush your teeth with weights strapped to your wrist.

<!-- For data capture where a human demonstrator is performing a task through a data capture glove such as [UMI](https://umi-gripper.github.io/), [Koala](https://koalagripper.rai-inst.com/), etc. it is then possible to generate robot motions to track fast hand trajectories, but it is often difficult for a demonstrator to actually perform dynamic behaviors through the capture interface due to its weight and bulk. -->
