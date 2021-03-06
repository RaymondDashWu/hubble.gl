# Whats New

## 1.0.1

Initial release.

## 1.1.0 (draft)

- Encoders are constructed right before rendering starts, instead of only when a scene is defined. [#1](https://github.com/uber/hubble.gl/pull/1)
- DeckAdapter.render now accepts a onStop callback.
- Remove stop and dispose from FrameEncoders [#3](https://github.com/uber/hubble.gl/pull/3)
- Allow PNGEncoder transparent frames [#4](https://github.com/uber/hubble.gl/pull/4)
- Refactor encoder settings and scene settings api [#8](https://github.com/uber/hubble.gl/pull/8)
  - scene settings are defined at scene load time, so you can set scene resolution and animation length there.
  - encoder settings are defined before every render, so you can set seek options there.
  - format-specific encoder settings are namespaced by encoder (`jpeg` settings are under `jpeg`, etc..).
- Gif Encoder [#7](https://github.com/uber/hubble.gl/pull/7)