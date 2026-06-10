import unittest

from tools.build_page_shells import BASE_URL, build_records, shell


class PageShellTests(unittest.TestCase):
    def test_project_shell_has_route_specific_metadata(self):
        record = build_records()["/projects/dns-database.html"]
        document = shell("/projects/dns-database.html", record["title"], record["description"], record["kind"], record["og_type"])
        self.assertIn("<title>DNS Database — Timo Schmidt</title>", document)
        self.assertIn(f'<link rel="canonical" href="{BASE_URL}/projects/dns-database.html">', document)
        self.assertIn('property="og:type" content="article"', document)
        self.assertEqual(document.count('property="og:image"'), 1)

    def test_track_shell_uses_music_song_metadata(self):
        record = build_records()["/music/core-override/used-to-be-easy/"]
        document = shell("/music/core-override/used-to-be-easy/", record["title"], record["description"], record["kind"], record["og_type"])
        self.assertIn('property="og:type" content="music.song"', document)
        self.assertIn('data-page-kind="track"', document)
        self.assertIn("synchronized lyrics", document)

    def test_description_and_title_are_escaped(self):
        document = shell("/example/", 'A <Title>', 'Systems & "stories"')
        self.assertIn("A &lt;Title&gt; — Timo Schmidt", document)
        self.assertIn('Systems &amp; &quot;stories&quot;', document)


if __name__ == "__main__":
    unittest.main()
