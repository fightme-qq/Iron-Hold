# Mobile Performance Budget

Before shipping a mobile-first Phaser game:

- keep texture sizes reasonable: decoded texture memory is roughly `width * height * 4` bytes;
- target sprite frames near displayed size times 2-3 DPR instead of importing huge source art unchanged;
- prefer atlases over many tiny images;
- cap particles and active physics bodies;
- avoid per-frame object creation;
- reduce expensive debug drawing;
- test low-end Android-like viewport in Playwright and a real browser if possible;
- keep canvas scale from becoming larger than needed.
