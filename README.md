# clibro

Command Line Interface for connecting to a [Spacebro](https://github.com/spacebro/spacebro) server.

## 🌍 Installation

```bash
$ yarn global add clibro
```

or

```bash
$ npm global add clibro
```

## ⚙ Configuration

You can pass a custom config file as second argument like this:

```bash
$ clibro my-config.json
```

The JSON settings looks like:

```JSON
{
  "service": {
    "spacebro": {
      "address": "spacebro.space",
      "port": 3344,
      "channel": "media-stream",
      "client": "clibro"
    }
  }
}
```

## 👋 Usage

Once clibro is installed, you can run it with:

```bash
$ clibro
```

You will then enter the clibro [Command-line interface](https://en.wikipedia.org/wiki/Command-line_interface). You can run the following commands:

#### Help
```
clibro$ help
```

Displays the list of commands.

#### Quit
To quit type: `exit` then ⏎

#### Emit event
To emit an event, use the `emit` command with the name of the event and the data you want to pass:

```
clibro$ emit myEvent '{"msg":"moto"}'
```

You can pass additional options to the `emit` command:

- `--interval X eventName`: the event is emitted every `X` seconds,
- `--stop eventName`: stops interval emitting for the event `eventName`

So you can type: `emit --interval 5 foobar "{'msg':'hello'}"` to emit the event `foobar` every `5` seconds with parameters `{'msg':'hello'}`

You can then type `emit --stop foobar` to stop emitting `foobar`.

#### Subscribe event
You can subscribe to an event. If you want `clibro` to print a message in the terminal every time it receives an event named `helloWorld`, you use the `subscribe` command:

```
clibro$ subscribe helloWorld
```           

#### Unsubscribe event
To remove the subscription, use the `unsubscribe` command:

```
clibro$ unsubscribe helloWorld
```

## 📦 Dependencies

For this project we use:

- spacebro-client
- vorpal

## 🕳 Troubleshooting

If you need any help to use clibro, please open an issue. We will try to reply as fast we can.

## ❤️ Contribute

If you love the project, contribute! If you have an idea, or something you want changed, open an issue and/or make a pull request.

When contributing, please make sur your code follows [the standard-js format](https://standardjs.com/) and passes every unit test by running the following scripts:

``` js
$ yarn lint
...
$ yarn test
```

Thank you!
