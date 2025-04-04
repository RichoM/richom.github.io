---
layout: page
title: RoboCupJunior
permalink: /robocupjunior/
---

This page briefly describes my experience with RoboCupJunior. For other projects, please visit my [main page](index.markdown)

![separator](imgs/separator.png)

## Roboliga Virtual 

(2020 - Present)

In 2020, Gonzalo Zabala and I started organizing [Roboliga Virtual](https://virtual.roboliga.ar/), a __fully simulated robotics competition open to participants of all ages__. The event was created in response to the COVID-19 pandemic, which forced schools to transition to online learning.

We continued hosting the virtual competition beyond the pandemic due to its many advantages over in-person events. These include significantly lower travel costs for participants and the ability to extend the competition over several months. With a round taking place each week, teams have the opportunity to improve their code after each round, enhancing both learning and performance.

![roboliga-virtual](imgs/roboliga_2023.6.png)

__Roboliga Virtual uses the same simulation platform and tools as RoboCupJunior__, but we developed custom tools to address our specific needs.

Since the competition is open to participants of all ages, we designed the challenges with accessibility in mind. Roboliga Virtual consists of three independent challenges:

- __Sumo__: A wrestling match between two robots, primarily designed for beginners and young children
- __Fútbol__: A soccer match, largely equivalent to [RCJ Soccer Sim](https://robocup-junior.github.io/rcj-soccersim/).
- __Rescate__: A rescue simulation, identical to [RCJ Rescue Sim](https://v24.erebus.rcj.cloud/).

In addition to the traditional soccer and rescue challenges, we introduced the sumo category to encourage younger students to participate, as it requires significantly simpler programming. To further support beginners, we developed a custom [block-based programming language](https://github.com/RichoM/webots-blockly), allowing students with no prior coding experience to participate using a visual interface instead of a textual programming language.

![webots-blockly](imgs/webots-blockly.png)

For the soccer challenge, we developed several tools to enhance the simulation, including:

- __Simulation control tools__ [(Github)](https://github.com/GIRA/rcj-soccer-sim) to better manage the competition environment.
- __Example controllers__ [(GitHub)](https://github.com/GIRA/rsexamples) to facilitate development in multiple programming languages.
- __A visualizer__ [(GitHub)](https://github.com/RichoM/rsvisualizer) to simplify program execution inspection and debugging.

![rsvisualizer](imgs/rsvisualizer.png)

Thanks to its virtual nature, Roboliga Virtual has expanded to many Latin American countries. For Argentine teams, it now also serves as a __qualifier for RoboCup Rescue Sim__.

![separator](imgs/separator.png)

## Introductory Workshop for Teachers 

(2022)

My first real experience with _RCJ Rescue Sim_ was in 2022 when Gonzalo asked me to help design and conduct an introductory workshop for Panamanian teachers interested in participating in _RoboCup_.

We developed a __Moodle course covering everything needed to create a basic controller__, including lessons, code examples, and exercises with their corresponding solutions.

![separator](imgs/separator.png)

## Argentinian Team Mentorship

(2024)

In 2024, I collaborated with Gonzalo Zabala to train a group of six high school students selected to represent Argentina in the _RoboCup Rescue Simulation_ category.

We taught them __Python programming, basic algorithms, problem-solving, and image processing techniques using OpenCV__. All the materials we developed for this workshop were made open source and published [here](https://richom.github.io/rescuesim/).

I'm very proud to say that this team went on to compete in _RoboCup 2024_ in Eindhoven with outstanding [results](https://www.infobae.com/salud/ciencia/2024/07/30/estudiantes-argentinos-se-coronaron-campeones-en-el-mundial-de-robotica-en-paises-bajos/):

- __General ranking__: 5th place
- __Technical challenge__: 2nd place
- __Super teams__: 1st place

![robocup-2024](imgs/robocup-2024.jpeg)

![separator](imgs/separator.png)

## Rescue Sim Development Team 

(2025)

Since 2025, I have been part of the Rescue Sim development team, where I am responsible for improving the platform by fixing bugs and updating it to reflect this year’s rule changes.

![separator](imgs/separator.png)

That's all for now. Stay tuned!