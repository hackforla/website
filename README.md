# website

> Hack for LA's website https://www.hackforla.org

## Development setup

This is a standard [Jekyll][jekyll] site hosted right here on [GitHub pages][ghpages].

There are a few options for developing the site locally.

### Ruby / Jekyll

With `ruby` and `jekyll` installed, use the [`jekyll` CLI commands][jekyllcli] directly to
build and serve the site:

```bash
jekyll serve
```

Now browse to http://localhost:4000.

Due to the difficulty of getting a proper `ruby/jekyll` environment running, this method is
*not recommended* for Windows users.

### Docker

This is the recommended approach to quickly getting started.

There are two pre-requisites: Docker and Docker Compose. The recommended installation method is
[Docker CE][dockerce] for Windows 10 64-bit, Mac, and Linux users. Users of unsupported operating
systems may check out [Docker Toolbox][dockertoolbox] instead.

More on using Docker and the concepts of containerization:

* [Get started with Docker][docker]
* [Get started with Docker Compose][dockercompose]

#### Build the Docker image

Building (or rebuilding) the docker image:

```bash
docker-compose build --force-rm --no-cache --pull
```

This command should be run initially upon first cloning the repository, and periodically
after fetching changes from the remote.

* `--force-rm` removes intermediate build artifacts
* `--no-cache` ensures the build doesn't rely on previously cached build layers
* `--pull` gets the latest from the base image (`jekyll` in this case)

#### Build and serve the website

Run this command to start a jekyll server. The server watches for changes to the source
files and rebuilds the site automatically.

```bash
docker-compose up
```

Now browse to http://localhost:4000

#### Tear down

To stop and completely remove the jekyll server (i.e. the running Docker container):

```bash
docker-compose down
```

To stop the server, but not destroy it:

```bash
docker-compose stop
```

Bring the same server back up later with `docker-compose up`.


[dockerce]: https://docs.docker.com/install/#supported-platforms
[dockercompose]: https://docs.docker.com/compose/gettingstarted/
[docker]: https://docs.docker.com/get-started/
[dockertoolbox]: https://docs.docker.com/toolbox/overview/
[ghpages]: https://pages.github.com/
[jekyll]: https://jekyllrb.com
[jekyllcli]: https://jekyllrb.com/docs/usage/
