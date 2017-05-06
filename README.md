# Spacebro CLI

Command Line Interface for connecting to a spacebro Galaxy.

## 🌍 Installation

```bash
$ yarn global add spacebro-client-cli
```

or

```bash
$ npm global add spacebro-client-cli
```

## ⚙ Configuration

You can pass a custom config file as second argument like this:

```bash
$ spacebro-client my-config.json
```

The JSON settings looks like:

```JSON
{
  "clientName": "spacebro-client-CLI",
  "channelName": "my-channel",
  "spacebro": {
    "address": "spacebro.space",
    "port": 3333
  }
}
```

## 👋 Usage

```bash
$ spacebro-client
```

You will, then enter the spacebro-client-CLI [REPL](https://en.wikipedia.org/wiki/Read%E2%80%93eval%E2%80%93print_loop).

Try to run the `help` command to see what can be done:

#### Help
```
spacebro-client$ help
```

then ⏎

#### Quit
To quit type: `exit` then ⏎

#### Emit event
For emiting event just type emit with the name of the event and the data you want to pass:

```
spacebro-client$ emit hello '{"msg":"moto"}'
```

You can pass option to the `emit` command:

- `--interval X eventName`: allows to emit every `X` second the event,
- `--stop eventName`: allows to stop interval emit for the `event` namde `eventName`

So you can type: `emit --interval 5 foo "{'msg':'hello'}"` to emit every `5` seconds the event `foo` with parameters : `{'msg':'hello'}`

To stop the repetition: `emit --stop foo`

#### Subscribe event
You can subscribe for an event. Say you want to listen for `hello`, you can use `subscribe` type:

```
spacebro-client$ subscribe hello
```           

#### Unsubscribe event
To remove the subscription, use `unsubscribe`. Type: 

```
spacebro-client$ unsubscribe hello
```

following with ⏎

## 📦 Dependencies

For this project we use:

- spacebro-client
- vorpal

## 🕳 Troubleshooting

If you need any help to use spacebro-cli please open an issue. We will try to reply as fast as possible.

## ❤️ Contribute

If you love the project, contribute! Just open an issue, fork, make some change and ask for a pull request.

Please follow standard-js format: https://standardjs.com/

Create a branch with the name of the feature or the fix you want to merge.