# website

> Hack for LA's website https://www.hackforla.org

This is a standard [Jekyll][jekyll] site hosted right here on [GitHub pages][ghpages].

There are a few options for developing the site locally.

## Developing via Docker (Recommended)

This is the recommended approach to quickly getting started.

There are two pre-requisites: Docker and Docker Compose.
The recommended installation method is [Docker CE][dockerce] for Windows 10 64-bit,
Mac, and Linux users. Users of unsupported operating systems may check out [Docker Toolbox][dockertoolbox] instead.

More on using Docker and the concepts of containerization:

* [Get started with Docker][docker]
* [Get started with Docker Compose][dockercompose]

### Build and serve the website locally

This command starts a jekyll server locally. The server watches for changes to
the source files and rebuilds and refreshes the site automatically in your browser.

```bash
docker-compose up
```

Now browse to http://localhost:4000

### Tear down

To stop and completely remove the jekyll server (i.e. the running Docker container):

*(do this anytime Docker or jekyll configuration or other repository settings change)*

```bash
docker-compose down
```

To stop the server, but not destroy it (often sufficient for day-to-day work):

```bash
docker-compose stop
```

Bring the same server back up later with:

```bash
docker-compose up
```

## Developing directly with Ruby / Jekyll

With `ruby` and `jekyll` installed locally, use the [`jekyll` CLI commands][jekyllcli] directly to build and serve the site:

```bash
jekyll serve
```

Now browse to http://localhost:4000.

Due to the difficulty of getting a consistent environment running, this method is
*not recommended*, particularly for Windows users.

[dockerce]: https://docs.docker.com/install/#supported-platforms
[dockercompose]: https://docs.docker.com/compose/gettingstarted/
[docker]: https://docs.docker.com/get-started/
[dockertoolbox]: https://docs.docker.com/toolbox/overview/
[ghpages]: https://pages.github.com/
[jekyll]: https://jekyllrb.com
[jekyllcli]: https://jekyllrb.com/docs/usage/
