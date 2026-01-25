# [Stop-Time-Blindness] 
(https://simplecaci.github.io/Stop-Time-Blindness/)

![HTML](https://img.shields.io/badge/HTML5-orange)
![JavaScript](https://img.shields.io/badge/JavaScript-yellow)
![Canvas](https://img.shields.io/badge/Canvas-Live%20Rendering-blue)
![Picture-in-Picture](https://img.shields.io/badge/Picture--in--Picture-Browser%20API-purple)
![Status](https://img.shields.io/badge/Status-Experimental-lightgrey)


A lightweight productivity + mindfulness experiment exploring how to stream a live HTML canvas into Picture-in-Picture (PiP).

---

## Overview

This repo explores a workflow:

Canvas → MediaStream → Video → Picture-in-Picture

Draw a live animation (timer/avatar UI) on a -canvas-, capture it as a MediaStream, feed it into a -video-, then open PiP from that video.

---
<img width="1307" height="714" alt="image" src="https://github.com/user-attachments/assets/729c172c-96b1-4e1c-bfed-84b235944e56" />
<img width="1134" height="671" alt="image" src="https://github.com/user-attachments/assets/47db0b24-05d3-4d45-ac24-5e8ab077590b" />

## How It Works

Canvas

<canvas></canvas>

MediaStream

const stream = canvas.captureStream(fps);

This returns a MediaStream, similar to webcam input.

Video Bridge

A <video></video> element is used so the browser treats the stream as real video:

video.srcObject = stream;

src takes a URL, while srcObject takes a MediaStream.

Picture-in-Picture

await video.requestPictureInPicture();

This opens the PiP window.

---

## Running the Project

Recommended (Local Server)

python -m http.server 8000

Open:

[http://localhost:8000/browswerPIP.html](http://localhost:8000/browswerPIP.html)

---

## Known Issues

* Animation timing: capture must start before the draw loop
* PiP updates may pause when the tab is inactive

---

## Key Discovery

Chrome’s Document Picture-in-Picture API may be the real solution:

[https://developer.chrome.com/docs/web-platform/document-picture-in-picture](https://developer.chrome.com/docs/web-platform/document-picture-in-picture)

---

## Next Steps

* Fix capture timing
* Explore Document PiP
* Turn this into a reusable module for live canvas widgets
