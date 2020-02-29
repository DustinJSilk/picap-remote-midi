# picap-remote-midi
Using Bare Conductive PiCaps, this project will host a local web server with multiple Raspberry Pis connected over WiFi using websockets. The server will create virtual MIDI instruments that can be mapped in Ableton Live.

# Setup

This project is setup to run on multiple Raspberry Pis that each have a PiCap installed. The PIs will connect through the local network to a MIDI server that is running Ableton Live (or similar).

## Raspberry PIs

Make sure the Raspberry PIs are setup and running the latest software, including the picap package. This section will only work on a Raspberry Pi.

Clone the repo, cd into it, and then:

`$ sudo apt-get install picap`

`$ nvm install`

`$ nvm use`

Each Raspberry PI will need to have its equivelant .env file edited with the correct info.

Now install the project dependencies:

`$ npm install`

We now need to install Node v6.7.0 and the node-picap module to run as a child process as the node-picap module isn't support on modern versions of Node. This could be done better, we'll address it another time.

`$ cd ./src/subprocess_touch && nvm install 6.7.0 && nvm use 6.7.0 && npm install && cd ../../`

## MIDI Server

The MIDI server runs Ableton Live and will simply listen to the PI cap touch events and transcode them into MIDI signals. This needs to be set up on a desktop computer.

Install the dependencies. This may throw an error installing the picap module, ignore this, its an optionalDependency:

`$ npm install`

## Windows

Windows doesn't support native virtual MIDI instruments. You need to install loopMidi, and create the virtual instruments manually. Make sure they have the same names found in the config files. https://www.tobias-erichsen.de/software/loopmidi.html

## Philips Hue Lights

This project expects to control a set of Philips Hue Lights. You need to make sure you have a Hue Bridge connected to the same network.

## Madmapper

We control MadMapper with OSC. You'll need to correctly map these controls in MadMapper, much like mapping the MIDI keys in Ableton.
Use this tool to debug your messages if you're having a problem. https://www.npmjs.com/package/osc-debugger


## Networking

I've built this project for Raspberry PI 4s, however these should work on the Pi Zeros W. The PI 4s can connect with ethernet. If you're connecting to just a switch like I was, you'll need to set static IP addresses for every device to find each other, or connect a router/dhcp server to assign IPs.

The Hue Bridge still requires a WiFi signal to connect to the lights, so your MIDI server must still connect to the same WiFI to control the lights.

# Run

Run the MIDI server first

`$ npm run start:dev:server`

Then on each of your Raspberry Pis run the equivelant start script. You may need to edit these:

`$ npm run start:dev:pi:1`
