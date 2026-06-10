import tempfile
import unittest
from pathlib import Path

from tools.build_music_catalog import flac_duration, format_duration, load_track_manifest


def flac_bytes(sample_rate: int = 48_000, seconds: int = 3) -> bytes:
    # STREAMINFO: block sizes (4), frame sizes (6), then sample rate/channels/
    # bit depth/total samples (8), followed by the MD5 field (16).
    total_samples = sample_rate * seconds
    packed = (sample_rate << 44) | (1 << 41) | (15 << 36) | total_samples
    streaminfo = b"\0" * 10 + packed.to_bytes(8, "big") + b"\0" * 16
    return b"fLaC" + bytes([0x80]) + len(streaminfo).to_bytes(3, "big") + streaminfo


class FlacDurationTests(unittest.TestCase):
    def test_reads_streaminfo_duration(self):
        with tempfile.TemporaryDirectory() as directory:
            path = Path(directory) / "track.flac"
            path.write_bytes(flac_bytes())
            self.assertEqual(flac_duration(path), 3)

    def test_rejects_non_flac_content(self):
        with tempfile.TemporaryDirectory() as directory:
            path = Path(directory) / "track.flac"
            path.write_bytes(b"not flac")
            self.assertIsNone(flac_duration(path))

    def test_formats_album_and_track_runtimes(self):
        self.assertEqual(format_duration(65.4), "1:05")
        self.assertEqual(format_duration(3_665.2), "1:01:05")

    def test_manifest_describes_uncommitted_media(self):
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            (root / "tracks.json").write_text('[{"track":1,"title":"A Track","file":"01_A_Track"}]')
            track = load_track_manifest(root)[0]
            self.assertEqual(track.files["flac"].name, "01_A_Track.flac")
            self.assertFalse(track.files["flac"].exists())


if __name__ == "__main__":
    unittest.main()
