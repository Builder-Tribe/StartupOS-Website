/**
 * Pure JavaScript in-browser ZIP generator (zero external dependencies).
 * Implements standard PKZIP format with stored (uncompressed) entries.
 */

const CRC_TABLE = new Uint32Array(256);
for (let i = 0; i < 256; i++) {
  let c = i;
  for (let k = 0; k < 8; k++) {
    c = (c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1);
  }
  CRC_TABLE[i] = c;
}

function calculateCRC32(bytes) {
  let crc = 0 ^ (-1);
  for (let i = 0; i < bytes.length; i++) {
    crc = (crc >>> 8) ^ CRC_TABLE[(crc ^ bytes[i]) & 0xFF];
  }
  return (crc ^ (-1)) >>> 0;
}

/**
 * Creates a valid ZIP binary buffer from an array of files.
 * @param {Array<{name: string, content: string}>} files 
 * @returns {Uint8Array}
 */
export function createZipBuffer(files) {
  const textEncoder = new TextEncoder();
  const fileEntries = [];
  let offset = 0;

  for (const f of files) {
    const nameBytes = textEncoder.encode(f.name);
    const contentBytes = textEncoder.encode(f.content);
    const crc = calculateCRC32(contentBytes);

    fileEntries.push({
      name: f.name,
      nameBytes,
      contentBytes,
      crc,
      offset,
      size: contentBytes.length
    });
    offset += 30 + nameBytes.length + contentBytes.length;
  }

  let centralDirSize = 0;
  for (const e of fileEntries) {
    centralDirSize += 46 + e.nameBytes.length;
  }

  const totalSize = offset + centralDirSize + 22;
  const buffer = new Uint8Array(totalSize);
  const view = new DataView(buffer.buffer);

  let pos = 0;
  // Write Local File Headers + Content
  for (const e of fileEntries) {
    view.setUint32(pos, 0x04034b50, true);
    view.setUint16(pos + 4, 20, true);
    view.setUint16(pos + 6, 0, true);
    view.setUint16(pos + 8, 0, true); // Stored
    view.setUint16(pos + 10, 0, true);
    view.setUint16(pos + 12, 0, true);
    view.setUint32(pos + 14, e.crc, true);
    view.setUint32(pos + 18, e.size, true);
    view.setUint32(pos + 22, e.size, true);
    view.setUint16(pos + 26, e.nameBytes.length, true);
    view.setUint16(pos + 28, 0, true);
    pos += 30;
    buffer.set(e.nameBytes, pos);
    pos += e.nameBytes.length;
    buffer.set(e.contentBytes, pos);
    pos += e.size;
  }

  const centralDirOffset = pos;
  // Write Central Directory Headers
  for (const e of fileEntries) {
    view.setUint32(pos, 0x02014b50, true);
    view.setUint16(pos + 4, 20, true);
    view.setUint16(pos + 6, 20, true);
    view.setUint16(pos + 8, 0, true);
    view.setUint16(pos + 10, 0, true);
    view.setUint16(pos + 12, 0, true);
    view.setUint16(pos + 14, 0, true);
    view.setUint32(pos + 16, e.crc, true);
    view.setUint32(pos + 20, e.size, true);
    view.setUint32(pos + 24, e.size, true);
    view.setUint16(pos + 28, e.nameBytes.length, true);
    view.setUint16(pos + 30, 0, true);
    view.setUint16(pos + 32, 0, true);
    view.setUint16(pos + 34, 0, true);
    view.setUint16(pos + 36, 0, true);
    view.setUint32(pos + 38, 0, true);
    view.setUint32(pos + 42, e.offset, true);
    pos += 46;
    buffer.set(e.nameBytes, pos);
    pos += e.nameBytes.length;
  }

  // Write End of Central Directory Record
  view.setUint32(pos, 0x06054b50, true);
  view.setUint16(pos + 4, 0, true);
  view.setUint16(pos + 6, 0, true);
  view.setUint16(pos + 8, fileEntries.length, true);
  view.setUint16(pos + 10, fileEntries.length, true);
  view.setUint32(pos + 12, centralDirSize, true);
  view.setUint32(pos + 16, centralDirOffset, true);
  view.setUint16(pos + 20, 0, true);

  return buffer;
}

/**
 * Triggers a browser file download from string content.
 */
export function downloadMarkdownFile(filename, content) {
  const blob = new Blob([content], { type: 'text/markdown;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename.endsWith('.md') ? filename : `${filename}.md`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Triggers a browser ZIP file download from an array of files.
 */
export function downloadZipBundle(zipFilename, files) {
  const buffer = createZipBuffer(files);
  const blob = new Blob([buffer], { type: 'application/zip' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = zipFilename.endsWith('.zip') ? zipFilename : `${zipFilename}.zip`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
