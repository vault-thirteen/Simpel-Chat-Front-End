# Simpel Chat Front-End

This is a front-end part for the `Simpel Chat` 

The server part is available at another repository:  
https://github.com/vault-thirteen/Simpel-Chat-Server

The name `Simpel` is not a mistake. This name is intentional. `Simpel` is the 
word `Simple` in its normal, unspoiled form.

## Functionality

The front-end part supports all the functionality of the server, I.E. it has 
full support of the application programming interface of the server, also 
known as server's API. See the `api.js` file for more information.

The front-end part is clever enough to read server's settings from the server, 
I.E. it does not need to "hard-code" settings in the configuration file.

The front-end part caches static files for economy of network traffic.

The provided web interface uses only simple HTML forms and elements, such as 
simple buttons, text, and minimum of CSS styles. No animation and fancy images
are included into the interface. 

This front-end part may be considered as a technical demonstration of 
capabilities of the chat server engine. 

This product is aimed at hobbyist and small user groups. Although, if you want 
to use the product for large user groups, nothing stops you from tweaking 
settings for greater limits.

## Technologies

The front-end uses simple, and sometime even primitive, algorithms, methods and 
technologies. First of all, front-end part is written in Go programming 
language and uses web browser as a means of interaction with end user. 

User's interface or UI is written in pure HTML with CSS and scripts written in 
pure JavaScript language. This is very important. The whole web interface is 
written from scratch using only simple constructs of a modern version of 
JavaScript language without any third-party libraries ! This approach makes 
the front-end part independent of bugs in third-party libraries and allows to 
reduce size of script files.

Unfortunately, modern JavaScript language used in web browsers has numerous 
problems and limitations, which are not a thing in common desktop applications 
written in normal programming languages, such as Java, C# or even C++. 

## Installation

1. Prepare your SSL certificates. 
 
A script to create self-signed certificates is available in the `script` 
folder.

2. Build the project using the `build.bat` script.

3. Copy files and folders from the created `_BUILD_` directory to your place.

4. Get the executable binary file using the following command.

> go install github.com/vault-thirteen/Simpel-Chat-Front-End/src@latest

5. Replace the executable file created by build script by the file received 
with `go install` command.

6. Say "Thank you" to the developers of Go language for not fixing old bugs in 
`go install` tool, for old bugs with versioning and many other old bugs in Go 
language.

**Important note**. Do not try to build the executable file locally. You will 
see an old versioning bug and will be unable to use the front-end normally.

## Usage

To start a front-end, compile the application and provide it with a path to the 
application configuration file. A build script `build.bat` can help you.

> front-end.exe /path/to/front-end.json

An example of an application configuration file can be found in the `settings` 
folder, the file is named `front-end.json`.

Open a web browser at `https://localhost` address to start using the web interface.

The default listening port of the front-end part is a standard HTTPS port 443. 
If you need to change the port, you can tweak the configuration in the settings 
file which uses a simple JSON format. 

## Reason

This project was started in memory of old-school web chats which were
popular in the early 2000-ish years. This product is very simplistic, yet 
quite powerful for its purpose.
