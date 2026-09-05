#!/usr/bin/env python3
"""Generate crisp PNG icons for DupeScout Chrome Extension using pure Python stdlib."""
import base64
import json
import os
import struct
import zlib

def make_png(width: int, height: int, rgba_pixels: bytes) -> bytes:
    def chunk(chunk_type: bytes, data: bytes) -> bytes:
        crc = zlib.crc32(chunk_type + data) & 0xffffffff
        return struct.pack(">I", len(data)) + chunk_type + data + struct.pack(">I", crc)

    header = b"\x89PNG\r\n\x1a\n"
    ihdr_data = struct.pack(">IIBBBBB", width, height, 8, 6, 0, 0, 0)
    ihdr = chunk(b"IHDR", ihdr_data)

    raw_data = bytearray()
    for y in range(height):
        raw_data.append(0)
        start = y * width * 4
        raw_data.extend(rgba_pixels[start:start + width * 4])

    idat = chunk(b"IDAT", zlib.compress(bytes(raw_data)))
    iend = chunk(b"IEND", b"")
    return header + ihdr + idat + iend

def draw_dupescout_icon(size: int) -> bytes:
    pixels = bytearray(size * size * 4)
    cx, cy = size / 2.0, size / 2.0
    radius = size / 2.0 - 0.5
    
    bg_r, bg_g, bg_b = 15, 23, 42
    em_r, em_g, em_b = 16, 185, 129
    cy_r, cy_g, cy_b = 56, 189, 248
    ro_r, ro_g, ro_b = 244, 63, 94

    ring_r = size * 0.26
    ring_cx, ring_cy = size * 0.44, size * 0.44
    stroke_w = max(1.2, size / 10.0)

    for y in range(size):
        for x in range(size):
            idx = (y * size + x) * 4
            dx = abs(x - cx + 0.5)
            dy = abs(y - cy + 0.5)
            max_d = max(dx, dy)
            
            if max_d > radius:
                pixels[idx:idx+4] = [0, 0, 0, 0]
                continue
                
            r, g, b, a = bg_r, bg_g, bg_b, 255
            
            if max_d >= radius - max(1.0, size / 16.0):
                r, g, b = cy_r, cy_g, cy_b
                
            dist_to_lens = ((x + 0.5 - ring_cx)**2 + (y + 0.5 - ring_cy)**2)**0.5
            if abs(dist_to_lens - ring_r) <= stroke_w:
                r, g, b = em_r, em_g, em_b

            if x + y >= size * 1.15 and abs((x - ring_cx) - (y - ring_cy)) <= stroke_w * 0.9 and dist_to_lens > ring_r - stroke_w:
                r, g, b = em_r, em_g, em_b
                
            dist_to_spark = ((x + 0.5 - size * 0.35)**2 + (y + 0.5 - size * 0.35)**2)**0.5
            if dist_to_spark <= max(1.5, size / 12.0):
                r, g, b = ro_r, ro_g, ro_b

            pixels[idx] = r
            pixels[idx+1] = g
            pixels[idx+2] = b
            pixels[idx+3] = a

    return make_png(size, size, bytes(pixels))

def main():
    icons = {}
    for size in [16, 48, 128]:
        png_data = draw_dupescout_icon(size)
        icons[str(size)] = base64.b64encode(png_data).decode("utf-8")
    
    print(json.dumps(icons))

if __name__ == "__main__":
    main()
