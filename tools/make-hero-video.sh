#!/bin/bash
# Turns the green-screen clip into the transparent hero video used by the site:
#   - removes the dark green background (strict key everywhere, so dark clothes stay opaque; a looser key only in a ring around the globe
#     to drop the green halo of its glow), then shrinks the edge by 1px and softens it
#   - lightly denoises the colour (the clip is grainy, which makes the file big)
#   - drops the first 4 frames (the first frame has a stray dark halo)
#   - plays forward then backward (ping-pong) so the loop has no jump
#   - encodes VP9 with alpha (WebM; Chrome, Edge, Firefox) and writes a still poster (WebP with alpha)
# usage: tools/make-hero-video.sh <green-screen.mp4> <out-dir> [crf]
set -euo pipefail
IN=${1:?input mp4}; OUT=${2:?output dir}; CRF=${3:-36}
mkdir -p "$OUT"
ffmpeg -v error -y -i "$IN" \
  -f lavfi -i "color=c=black:s=768x1168:r=24:d=6.05,format=gray,geq=lum='255*lt(hypot(X-212\,Y-138)\,160)*gt(hypot(X-212\,Y-138)\,108)',gblur=sigma=4" -an -filter_complex \
"[0:v:0]format=rgb24,split=3[c][k1][k2];\
[k1]colorkey=0x003f00:0.10:0.04,format=rgba,alphaextract,format=gray[a10];\
[k2]colorkey=0x003f00:0.18:0.08,format=rgba,alphaextract,format=gray[a18];\
[a10][a18][1:v]maskedmerge,erosion,gblur=sigma=0.6[a];\
[c]hqdn3d=2:1.5:5:5[cd];[cd][a]alphamerge,format=yuva420p,trim=start_frame=4:end_frame=145,setpts=PTS-STARTPTS,split[f][r0];\
[r0]reverse,trim=start_frame=1:end_frame=140,setpts=PTS-STARTPTS[r];\
[f][r]concat=n=2:v=1:a=0[out]" \
  -map "[out]" -c:v libvpx-vp9 -pix_fmt yuva420p -b:v 0 -crf "$CRF" -auto-alt-ref 0 -row-mt 1 -deadline good -cpu-used 2 \
  "$OUT/hero-character.webm"
ffmpeg -v error -y -c:v libvpx-vp9 -i "$OUT/hero-character.webm" -frames:v 1 -vf format=rgba "$OUT/hero-character-poster.png"
convert "$OUT/hero-character-poster.png" -quality 92 "$OUT/hero-character-poster.webp"
rm -f "$OUT/hero-character-poster.png"
ls -la "$OUT"
