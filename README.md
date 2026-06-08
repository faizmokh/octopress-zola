# octopress-zola

`octopress-zola` is a Zola theme that recreates the classic `octopress.org` layout and styling.

## Installation

Clone the theme into your Zola site:

```bash
git submodule add git@github.com:faizmokh/octopress-zola.git themes/octopress-zola
```

Or clone it directly without a submodule:

```bash
git clone git@github.com:faizmokh/octopress-zola.git themes/octopress-zola
```

Then enable it in `zola.toml`:

```toml
theme = "octopress-zola"
compile_sass = true
build_search_index = true
generate_feeds = true
feed_filenames = ["atom.xml"]

taxonomies = [
  { name = "categories", feed = true },
]
```

## Features

- Classic Octopress masthead, navigation, article layout, archive view, and sidebar presentation
- Configurable navigation, search form, RSS link, footer credit, sharing link, post navigation, and navbar color presets
- Theme-local Sass, images, and fonts with no dependency on a parent demo repository

## Required Site Setup

- Enable Sass compilation in `zola.toml`
- Enable `build_search_index = true` if you want the built-in nav search
- Add a root section or equivalent post section sorted by date
- Define the `categories` taxonomy if you want archive category links

## Minimal Config

```toml
[extra.octopress]
header_title = "Your Site"
header_subtitle = "A classic editorial blog"
header_alignment = "left"
rss_enabled = true
footer_credit = "Built with Zola"
show_post_navigation = true
show_sharing_links = true

[[extra.octopress.nav_items]]
name = "Blog"
url = "/"

[extra.octopress.search]
placeholder = "Search"

[extra.octopress.style]
nav_color = "blue"

[[extra.octopress.sidebar.sections]]
kind = "recent_posts"
title = "Recent Posts"
limit = 5
```

## Theme Config

The theme reads its settings from `[extra.octopress]`.

Native nav search uses Zola's generated `elasticlunr.min.js` and `search_index.<lang>.js` assets. Keep `build_search_index = true` enabled when `[extra.octopress.search]` is configured.

Optional header logo:

```toml
[extra.octopress.header_logo]
path = "images/brand-mark.png"
alt = "Site logo"
url = "/"
```

For backward compatibility, `logo_text` still falls back into `header_title` and `site_tagline` still falls back into `header_subtitle`.

`header_alignment` supports `left` and `center`.

Navbar presets are configured under `[extra.octopress.style]`:

```toml
[extra.octopress.style]
nav_color = "green"
```

Supported values are `green`, `blue`, and `gray`. If the setting is omitted or uses an unknown value, the theme falls back to the classic Octopress green navbar.

Sidebar visibility is controlled by the templates that include the sidebar partial. If no configured section resolves to visible content, the theme omits the sidebar container entirely.

Supported sidebar section types:

```toml
[[extra.octopress.sidebar.sections]]
kind = "recent_posts"
title = "Recent Posts"
limit = 5
```

```toml
[[extra.octopress.sidebar.sections]]
kind = "links"
title = "Links"

[[extra.octopress.sidebar.sections.items]]
name = "Documentation"
url = "/docs/"

[[extra.octopress.sidebar.sections.items]]
name = "Help"
url = "/help/"
```

```toml
[[extra.octopress.sidebar.sections]]
kind = "text"
title = "About"
content = "<p>Rendered as trusted HTML.</p>"
```

Mixed sections render in the configured order. Empty `text` content, `links` sections with no valid items, and `recent_posts` sections with no posts are omitted. If every configured section is omitted, no sidebar markup is rendered.
