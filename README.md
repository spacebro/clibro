# spacebro-client-cli
Command Line Interface for spacebro-client

### Installation

1. `git clone https://github.com/soixantecircuits/spacebro-client-cli.git`
2. `cd spacebro-client-cli`
3. `npm install -g`

### Usage

Once installed, run `spacebro-client-cli`
```
spacebro-client-cli$ help

  Commands:

    help [command...]              Provides help for a given command.
    exit                           Exits application.
    subscribe <event>              Start listening to a specific spacebro event.
    unsubscribe <event>            Stop listening to a specific spacebro event.
    emit [options] <event> [data]  Emits a spacebro event with optionnal JSON parsed data.

```
