---
# Feel free to add content and custom Front Matter to this file.
# To modify the layout, see https://jekyllrb.com/docs/themes/#overriding-theme-defaults

layout: home
---

Here are some things I made.

![separator](imgs/separator.png)

## [![logo](imgs/logo.png)](https://gira.github.io/PhysicalBits/) {#physical-bits}

(2014-2021)

Physical Bits is a __web-based programming environment__ for __educational robotics__ that supports __live coding__ and __autonomy__ using a __hybrid blocks/text__ programming language.

[![line-follower](imgs/line_follower.gif)](https://gira.github.io/PhysicalBits/)

### A little bit of history

I started this project a couple of years ago as an attempt to fix a limitation of [Physical Etoys](#physical-etoys). At the time, Physical Etoys allowed to program Arduino boards (as well as several other robotic kits such as [Lego NXT](https://en.wikipedia.org/wiki/Lego_NXT)) using the [Etoys](https://en.wikipedia.org/wiki/Etoys_(programming_language)) scripting system. This was great, but it meant that the robots had to always be connected to the computer running Physical Etoys, which was a severe limitation.

My first solution was to simply translate the Etoys scripts (which were actually Smalltalk code) to C++, compile this code and upload it to the robot. I did this for both Arduino and Lego NXT (which was annoying because they required slightly different code). My little compiler worked well enough and it allowed us to run Physical Etoys scripts autonomously, but it was soon evident that in our search for robot autonomy we lost everything that was great about Physical Etoys: the live environment, the instant feedback, the monitoring capabilities, and the ability to easily make different electronic devices interact with each other in interesting ways.

[![liveness](imgs/liveness2.gif)](https://gira.github.io/PhysicalBits/)
> Programming in Physical Bits is an interactive experience: every change you make is automatically compiled and transmitted to the robot so you can instantly see the effects of your change. And once you're happy with your program you can store it permanently and unplug your board from the computer. The program will now run autonomously, without requiring a connection to the computer.

We needed some other solution so I decided to make a firmware that was capable of not only interact with the computer through serial port commands but also to run programs autonomously. To that end, I started working on a small bytecode virtual machine that I could upload to the robot alongside our custom firmware (which at the time was just a less capable version of [Firmata](https://github.com/firmata/arduino)). I decided to start with Arduino (which seemed to be the most popular platform) and later port this to Lego NXT (this port never happened, though).

[![blocks-code](imgs/blocks-code.gif)](https://gira.github.io/PhysicalBits/)
> Physical Bits includes a block-based programming language suitable for beginners but it also supports text-based programming for more advanced users. To ease the transition the environment automatically generates the textual code from the blocks (and viceversa).

Anyway, this small side project of mine eventually grew into its own thing, more people joined the [team](https://gira.github.io/PhysicalBits/about/) and contributed code an ideas, we designed and developed a custom programming language for educational robotics, we added a visual editor (based on [Blockly](https://developers.google.com/blockly/)), we implemented bidirectional translation of blocks/code, we added a simple debugger, and we packaged everything into an [electron](https://www.electronjs.org/) app.

Altough this project is far from over, we have released a few versions that you can freely download and try. If you do, please let us know what you think.


### More info

- Links:
  - [Official website](https://gira.github.io/PhysicalBits/)
  - [Online demo](https://gira.github.io/PhysicalBits/demo/)
  - [Download](https://gira.github.io/PhysicalBits/download/)
  - [Source code](https://github.com/GIRA/PhysicalBits)
- Publications:
  - [Physical Bits: A Live Programming Environment for Educational Robotics (2021)](https://link.springer.com/chapter/10.1007%2F978-3-030-67411-3_26)
  - [A Concurrent Programming Language for Arduino and Educational Robotics (2017)](http://sedici.unlp.edu.ar/handle/10915/63529)
  - [On the Design and Implementation of a Virtual Machine for Arduino (2017)](https://link.springer.com/chapter/10.1007/978-3-319-42975-5_19)

If you want to see Physical Bits in action you can watch this [demo](https://youtu.be/VMX5ltAYxYY). It's recorded in spanish but it has english subtitles.

<iframe width="100%" height="416" src="https://www.youtube.com/embed/VMX5ltAYxYY" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>


![separator](imgs/separator.png)

## Low Poly Racing

(2020-2021)

This was going to be a racing game, but I got bored before building the race track so I left it incomplete. Maybe I'll finish it someday, who knows...

UPDATE 2021/06/11: At last, I added a racetrack.

- Links:
  - [Play online! (new racetrack)](https://richom.github.io/LowPolyRacing/build/race.html)
  - [Play online! (old demo)](https://richom.github.io/LowPolyRacing/build/demo.html)
  - [Source code](https://github.com/RichoM/LowPolyRacing)

[![lowpolyracing](imgs/lowpolyracing2.png)](https://richom.github.io/LowPolyRacing/build/race.html)

![separator](imgs/separator.png)

## webots-blockly

(2020)

Webots-blockly is an blocks-based editor for the Sumo competition in the [Roboliga Virtual 2020](https://github.com/gzabala/RoboligaVirtual). Roboliga is an annual educational robotics event in which argentinian students get together to compete and show their projects. Due to Covid-19 the 2020 event was held online with the help of the [webots simulator](https://cyberbotics.com/). In order to help younger students with their robot programming I made this editor that generates python code from blocks.

- Links:
  - [Online demo](https://richom.github.io/webots-blockly/editor/)
  - [Download](https://github.com/RichoM/webots-blockly/releases)
  - [Source code](https://github.com/RichoM/webots-blockly)

[![webots-blockly](imgs/webots-blockly.png)](https://richom.github.io/webots-blockly/editor/)

![separator](imgs/separator.png)

## Paper Airplane

(2020)

This is a simple game about a paper airplane lost in space that has to avoid crashing into asteroids. It's really nothing more than a Flappy Bird clone but I like this game because it's easy to program and fun to play. I tend to use it as a learning exercise whenever I try a new game engine. In this case, [Godot](https://godotengine.org/).

- Links:
  - [Play online!](https://richom.github.io/PaperAirplane/build/demo.html)
  - [Source code](https://github.com/RichoM/PaperAirplane)

[![paper-airplane](imgs/paper-airplane.png)](https://richom.github.io/PaperAirplane/build/demo.html)

![separator](imgs/separator.png)

## Sunset Flight

(2020)

Just an airplane flying through the mountains at sunset.

- Links:
  - [Play online!](https://richom.github.io/SunsetFlight/build/demo.html)
  - [Source code](https://github.com/RichoM/SunsetFlight)

[![sunset-flight](imgs/sunset-flight.png)](https://richom.github.io/SunsetFlight/build/demo.html)

![separator](imgs/separator.png)

## Terrain Generation

(2020)

These are some scenes I made while learning about procedural content generation using [Godot](https://godotengine.org/).

- Links:
  - [Demo 1 - Simple terrain](https://richom.github.io/TerrainGeneration/SimpleTerrain/build/demo.html)
  - [Demo 2 - Infinite terrain](https://richom.github.io/TerrainGeneration/InfiniteTerrain/build/demo.html)
  - [Source code](https://github.com/RichoM/SunsetFlight)

[![terrain-generation](imgs/terrain-generation.png)](https://richom.github.io/TerrainGeneration/SimpleTerrain/build/demo.html)

![separator](imgs/separator.png)

## Julia Set

(2020)

An interactive visualization of the [Julia Set](https://en.wikipedia.org/wiki/Julia_set). I made this to learn about shader programming.

- Links:
  - [Online demo](https://richom.github.io/JuliaSet/build/demo.html)
  - [Source code](https://github.com/RichoM/JuliaSet)

[![julia-set](imgs/julia-set.png)](https://richom.github.io/JuliaSet/build/demo.html)

![separator](imgs/separator.png)

## Wizards of Lezama

(2014-2017)

I worked on this game with a couple of friends. I was in charge of programming, [Sebastián Blanco](https://www.papacorps.com/) did the game design, [Camila Martorelli](https://www.instagram.com/cosmicmagpie/) was responsible for the art, and [Sebastián Codex](https://twitter.com/sebastiancodex) composed the music. Although we never finished this project we did release an early alpha, so you can check it out if you want (I'm not sure if the server is still up, though).

- Links:
  - [Website](https://www.papacorps.com/wizards-of-lezama)

[![wol](imgs/wol.png)](https://www.papacorps.com/wizards-of-lezama)

![separator](imgs/separator.png)

## Esclava (card game)

(2020)

This is a card game that my ex used to play with her friends. I don't really understand what's fun about it and I don't remember the rules. The code is a mess, but you could probably get a sense of what the game is about by looking at it. Also, this was a useful exercise to learn about [firebase](https://firebase.google.com/).

- Links:
  - [Play online](https://richom.github.io/cards-game-js/esclava4.html)
  - [Source code](https://github.com/RichoM/cards-game-js)

[![esclava](imgs/esclava.png)](https://richom.github.io/cards-game-js/esclava4.html)

![separator](imgs/separator.png)

## MiniMorphicJS

(2015)

This is just a very basic and incomplete implementation of the [Morphic UI framework](http://wiki.squeak.org/squeak/morphic) written in Javascript.

- Links:
  - [Demo 1 (buttons, particles, sprites, and animations)](http://richom.github.io/MiniMorphicJS/demo.html)
  - [Demo 2 (drag and drop)](http://richom.github.io/MiniMorphicJS/cards.html)
  - [Demo 3 (morph hierarchy)](http://richom.github.io/MiniMorphicJS/puzzle.html)
  - [Source code](https://github.com/RichoM/MiniMorphicJS)

[![mini-morphic-js](imgs/mini-morphic-js.png)](http://richom.github.io/MiniMorphicJS/demo.html)

![separator](imgs/separator.png)

## Physical Etoys

(2008-2013)

Physical Etoys is a free open-source extension of [Etoys](https://en.wikipedia.org/wiki/Etoys_(programming_language)) developed by Gonzalo Zabala, Sebastián Blanco, Matías Teragni, and myself at the Universidad Abierta Interamericana. Physical Etoys allows to easily program different electronic devices such as [Lego NXT](https://en.wikipedia.org/wiki/Lego_NXT), [Arduino](https://en.wikipedia.org/wiki/Arduino) boards, [Sphero](https://en.wikipedia.org/wiki/Sphero), [Kinect](https://en.wikipedia.org/wiki/Kinect), [Wiimote](https://en.wikipedia.org/wiki/Wiimote) joystick, among others.

- Links:
  - [Wikipedia page](https://en.wikipedia.org/wiki/Physical_Etoys)

![physical-etoys](imgs/physical-etoys.png)

![separator](imgs/separator.png)

## dotnet.Database

(2016)

This is just a thin wrapper around ADO.NET that makes it *less* annoying to run SQL queries in .Net.

- Links:
  - [Nuget package](https://www.nuget.org/packages/RichoM.Database/)
  - [Source code](https://github.com/RichoM/dotnet.Database)

```c#
var db = new Database<SqlConnection>("your connection string");

// Execute INSERT
db.NonQuery("INSERT INTO Test (id, name) VALUES (@id, @name)")
    .WithParameter("@id", Guid.NewGuid())
    .WithParameter("@name", "Juan")
    .Execute();

// Execute SELECT
var rows = db
    .Query("SELECT id, name FROM Test")
    .Select(row =>
    {
        Guid id = row.GetGuid("id");
        string name = row.GetString("name");
        return new Tuple<Guid, string>(id, name);
    });
```

![separator](imgs/separator.png)

## Disk Space Analyzer

(2018)

This is a small utility program I made to help me diagnose some disk space problems (Windows only).

- Links:
  - [Download](https://github.com/RichoM/DiskSpaceAnalyzer/releases)
  - [Source code](https://github.com/RichoM/DiskSpaceAnalyzer)

![disk-space-analyzer](imgs/disk-space-analyzer.png)

![separator](imgs/separator.png)

## GSoC: Squeakland Education Project

(2010)

In 2010 I participated as a student in the [Google Summer of Code](https://summerofcode.withgoogle.com/) program for the Smalltalk community (under the umbrella of the [European Smalltalk User Group](https://esug.github.io/)). It was a great experience, I learned a lot, I got to meet some awesome people such as [Randy Caton](https://www.pcs.cnu.edu/~rcaton/) (who was my mentor for the project), and I had a lot of fun.

- Links:
  - [Proposal](http://gsoc2010.esug.org/projects/squeakland-education)
  - [Results](https://www.pcs.cnu.edu/~rcaton/ESUG/ESUG.html)

![gsoc](imgs/gsoc.png)

![separator](imgs/separator.png)

## RobotSoccer

(2008-2011)

This was a simple framework that allowed to participate in Robot Soccer competitions using [Squeak Smalltalk](https://squeak.org/). It was designed to support different robots by changing the robot abstraction layer: we implemented adapters for virtual robots from the [FIRA simurosot](https://www.firaworldcup.org/VisitorPages/show.aspx?ItemID=805,0) category, real robots made with [Lego NXT](https://en.wikipedia.org/wiki/Lego_Mindstorms_NXT), and home-made robots.

- Links:
  - [Source code](http://www.squeaksource.com/RobotSoccer.html)

![robot-soccer](imgs/robot-soccer.png)
