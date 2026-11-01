---
title: "Robot mouche: a Raspberry Pi robot in C++"
description: "A Raspberry Pi 4 robot in C++, built by a team of four at INSA Rouen, driven from a web control panel over Wi-Fi or following a line seen by its camera."
---

# Robot mouche: a remote-controlled, line-following robot

## Overview

For the "Electronics for embedded systems" course at INSA Rouen Normandie, in 2023, our team of four built a robot with two modes: driven freely from a web control panel over Wi-Fi, or following a line on the floor with its camera while watching for obstacles with a LiDAR sensor.

The robot is built around a Raspberry Pi 4, with an L293D driver for its two motors, a Benewake TF-Luna short-range LiDAR, a camera module based on the OV5647 sensor, a 16×2 LCD driven through an I2C expander, and a MAX98357A amplifier to play sounds.

## Technical choices

- **A C++ program on Linux.** The main program, built with PlatformIO, uses WiringPi for GPIO access and cpp-httplib for its HTTP server.
- **A web control panel.** A static web page drives the robot through a small HTTP API: joystick direction and speed, settings such as the current mode, and sounds to play. The program turns the direction into a speed for each motor.
- **Line detection in a separate process.** When line-following mode starts, the C++ program launches a Python script that captures camera frames with Picamera2 and reduces the top rows of each frame to a brightness profile of 640 values. The C++ side reads this profile, locates the line from the pixels above a threshold and converts its position into a steering angle. When the line is lost, the robot turns toward the side where it was last seen.
- **Stop before obstacles.** In line-following mode, the robot stops while the LiDAR measures an obstacle closer than 5 cm. The LCD shows the measured distance or an obstacle warning, and a sound plays.
- **Testable without the robot.** GPIO access goes through a pin interface with a Raspberry Pi 4 implementation and a native one, so the code builds off the robot. GitHub Actions runs a Unity test of the PID controller, which the final line follower does not use.

## Explore the project

- [Source code](https://github.com/AlixANNERAUD/robot_mouche): C++ program, Python camera script and web control panel.
