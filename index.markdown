---
# Feel free to add content and custom Front Matter to this file.
# To modify the layout, see https://jekyllrb.com/docs/themes/#overriding-theme-defaults

layout: page
---

Here are some things I made.

---
## Physical Bits

Physical Bits is a web-based programming environment for educational robotics that supports live coding and autonomy using a hybrid blocks/text programming language.

- Links: [Website](https://gira.github.io/PhysicalBits/), [Source code](https://github.com/GIRA/PhysicalBits)

![test](imgs/blocks-code.gif)

![test](imgs/liveness2.gif)

---
## webots-blockly

Webots-blockly is an blocks-based editor for the Sumo competition in the [Roboliga Virtual 2020](https://github.com/gzabala/RoboligaVirtual). Roboliga is an annual educational robotics event in which argentinian students get together to compete and show their projects. Due to Covid-19 the 2020 event was held online with the help of the [webots simulator](https://cyberbotics.com/). In order to help younger students with their robot programming I made this editor that generates python code from blocks.

- Links: [Demo](https://richom.github.io/webots-blockly/editor/), [Download](https://github.com/RichoM/webots-blockly/releases), [Source code](https://github.com/RichoM/webots-blockly)

![webots-blockly](imgs/webots-blockly.png)

---
## Paper Airplane

This is a simple game about a paper airplane lost in space that has to avoid crashing into asteroids. It's really nothing more than a Flappy Bird clone but I like this game because it's easy to program and fun to play. I tend to use it as a learning exercise whenever I try a new game engine. In this case, [Godot](https://godotengine.org/).

- Links: [Demo](https://richom.github.io/PaperAirplane/build/demo.html), [Source code](https://github.com/RichoM/PaperAirplane)

![paper-airplane](imgs/paper-airplane.png)

---
## Low Poly Racing

This was going to be a racing game, but I got bored before building the race track so I left it incomplete. Maybe I'll finish it someday, who knows...

- Links: [Demo](https://richom.github.io/LowPolyRacing/build/demo.html), [Source code](https://github.com/RichoM/LowPolyRacing)

![lowpolyracing](imgs/lowpolyracing.png)

---
## Sunset Flight

Just an airplane flying through the mountains at sunset.

- Links: [Demo](https://richom.github.io/SunsetFlight/build/demo.html), [Source code](https://github.com/RichoM/SunsetFlight)

![sunset-flight](imgs/sunset-flight.png)

---
## Terrain Generation

These are some scenes I made while learning about procedural content generation using [Godot](https://godotengine.org/).

- Links: [Demo 1](https://richom.github.io/TerrainGeneration/SimpleTerrain/build/demo.html), [Demo 2](https://richom.github.io/TerrainGeneration/InfiniteTerrain/build/demo.html), [Source code](https://github.com/RichoM/SunsetFlight)

![terrain-generation](imgs/terrain-generation.png)

---
## Julia Set

An interactive visualization of the [Julia Set](https://en.wikipedia.org/wiki/Julia_set). I made this to learn about shader programming.

- Links: [Demo](https://richom.github.io/JuliaSet/build/demo.html), [Source code](https://github.com/RichoM/JuliaSet)

![julia-set](imgs/julia-set.png)

---
## Wizards of Lezama

I worked on this game with a couple of friends. I was in charge of programming, [Sebastián Blanco](https://www.papacorps.com/) did the game design, [Camila Martorelli](https://www.instagram.com/cosmicmagpie/) was responsible for the art, and [Sebastián Codex](https://twitter.com/sebastiancodex) composed the music. Although we never finished this project we did release an early alpha, so you can check it out if you want (I'm not sure if the server is still up, though).

- Links: [Website](https://www.papacorps.com/wizards-of-lezama)

![wol](imgs/wol.png)

---
## Esclava (card game)

This is a card game that my ex used to play with her friends. I don't really understand what's fun about it and I don't remember the rules. The code is a mess, but you could probably get a sense of what the game is about by looking at it. Also, this was a useful exercise to learn about [firebase](https://firebase.google.com/).

- Links: [Demo](https://richom.github.io/cards-game-js/esclava4.html), [Source code](https://github.com/RichoM/cards-game-js)

![esclava](imgs/esclava.png)

---
## MiniMorphicJS

This is just a very basic and incomplete implementation of the [Morphic UI framework](http://wiki.squeak.org/squeak/morphic) written in Javascript.

- Links: [Demo 1](http://richom.github.io/MiniMorphicJS/demo.html), [Demo 2](http://richom.github.io/MiniMorphicJS/cards.html), [Demo 3](http://richom.github.io/MiniMorphicJS/puzzle.html), [Source code](https://github.com/RichoM/MiniMorphicJS)

![mini-morphic-js](imgs/mini-morphic-js.png)

---
## Physical Etoys

Physical Etoys is a free open-source extension of [Etoys](https://en.wikipedia.org/wiki/Etoys_(programming_language)) developed by Gonzalo Zabala, Sebastián Blanco, Matías Teragni, and myself at the Universidad Abierta Interamericana. Physical Etoys allows to easily program different electronic devices such as [Lego NXT](https://en.wikipedia.org/wiki/Lego_NXT), [Arduino](https://en.wikipedia.org/wiki/Arduino) boards, [Sphero](https://en.wikipedia.org/wiki/Sphero), [Kinect](https://en.wikipedia.org/wiki/Kinect), [Wiimote](https://en.wikipedia.org/wiki/Wiimote) joystick, among others.

- Links: [Wikipedia page](https://en.wikipedia.org/wiki/Physical_Etoys)

![physical-etoys](imgs/physical-etoys.png)

---
## dotnet.Database

This is just a thin wrapper around ADO.NET that makes it *less* annoying to run SQL queries in .Net.

- Links: [Nuget package](https://www.nuget.org/packages/RichoM.Database/), [Source code](https://github.com/RichoM/dotnet.Database)

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

---
## Disk Space Analyzer

This is a small utility program I made to help me diagnose some disk space problems (Windows only).

- Links: [Download](https://github.com/RichoM/DiskSpaceAnalyzer/releases), [Source code](https://github.com/RichoM/DiskSpaceAnalyzer)

![disk-space-analyzer](imgs/disk-space-analyzer.png)

---
## GSoC: Squeakland Education Project

In 2010 I participated as a student in the [Google Summer of Code](https://summerofcode.withgoogle.com/) program for the Smalltalk community (under the umbrella of the [European Smalltalk User Group](https://esug.github.io/)). It was a great experience, I learned a lot, I got to meet some awesome people such as [Randy Caton](https://www.pcs.cnu.edu/~rcaton/) (who was my mentor for the project), and I had a lot of fun.

- Links: [Proposal](http://gsoc2010.esug.org/projects/squeakland-education), [Results](https://www.pcs.cnu.edu/~rcaton/ESUG/ESUG.html)

![gsoc](imgs/gsoc.png)

---
## RobotSoccer

This was a simple framework that allowed to participate in Robot Soccer competitions using [Squeak Smalltalk](https://squeak.org/). It was designed to support different robots by changing the robot abstraction layer: we implemented adapters for virtual robots from the [FIRA simurosot](https://www.firaworldcup.org/VisitorPages/show.aspx?ItemID=805,0) category, real robots made with [Lego NXT](https://en.wikipedia.org/wiki/Lego_Mindstorms_NXT), and home-made robots.

- Links: [Source code](http://www.squeaksource.com/RobotSoccer.html)

![robot-soccer](imgs/robot-soccer.png)