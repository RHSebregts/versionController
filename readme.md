# Version Controller

Tiny cli app to change program versions based on git tags

## Setup

Please provide an .env file with an array of objects called `PROGRAMS`. Objects should have `program` and `directory` keys. The `directory` should be the relative path to the folder where the program is located.
The `directory` should be a git repository. Version Controller does not pull or push to remote origins.

### Adding apps to Version Controller

    PROGRAMS  = '[{"program":"PROGRAM_NAME","directory":"../DIR_RELATIVE_TO_VERSION_CONTROLLER"}]'

### What versions of a program does Version Controller serve?

Version Controller looks for tags within the git repository and offers tags as options to switch to. 
Tags will be presented as options in reversed alphabetical order.