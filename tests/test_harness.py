from __future__ import annotations

import tempfile
import unittest
from pathlib import Path

from career_zoo.builder import build_webapp
from career_zoo.engine import score_answers, simulate_distribution
from career_zoo.spec import DEFAULT_RUN, PROJECT_ROOT, compile_spec
from career_zoo.validation import validate_spec


class HarnessTest(unittest.TestCase):
    @classmethod
    def setUpClass(cls) -> None:
        cls.spec = compile_spec(DEFAULT_RUN)

    def test_spec_is_valid(self) -> None:
        self.assertEqual(validate_spec(self.spec, PROJECT_ROOT), [])

    def test_scoring_is_deterministic(self) -> None:
        answers = [question["options"][0]["id"] for question in self.spec["scoredQuestions"]]
        first = score_answers(self.spec, answers)
        second = score_answers(self.spec, answers)
        self.assertEqual(first, second)

    def test_conditional_career_modes_are_gated(self) -> None:
        quiet_answers = [question["options"][-1]["id"] for question in self.spec["scoredQuestions"]]
        quiet_result = score_answers(self.spec, quiet_answers)
        quiet_modes = {career["mode"] for career in quiet_result["careers"]}
        self.assertNotIn("public", quiet_modes)
        self.assertNotIn("independent", quiet_modes)

        public_answers = [question["options"][0]["id"] for question in self.spec["scoredQuestions"]]
        public_answers[-1] = "q08_a"
        public_result = score_answers(self.spec, public_answers)
        self.assertIn("public", {career["mode"] for career in public_result["careers"]})

    def test_every_result_is_reachable_and_balanced(self) -> None:
        report = simulate_distribution(self.spec)
        self.assertEqual(report["total"], 65_536)
        for item in report["distribution"].values():
            self.assertGreaterEqual(item["percent"], 10)
            self.assertLessEqual(item["percent"], 25)

    def test_build_contains_required_files(self) -> None:
        with tempfile.TemporaryDirectory() as temporary:
            output = Path(temporary)
            build_webapp(self.spec, output)
            for relative in ("index.html", "styles.css", "app.js", "test-spec.json"):
                self.assertTrue((output / relative).is_file())
            self.assertEqual(len(list((output / "assets").glob("*.png"))), 6)
            self.assertTrue((output / "assets" / "fonts" / "Hakgyoansim-Dunggeunmiso-TTF-B.ttf").is_file())
            self.assertTrue((output / "assets" / "fonts" / "OFL.txt").is_file())
            html = (output / "index.html").read_text(encoding="utf-8")
            javascript = (output / "app.js").read_text(encoding="utf-8")
            self.assertIn("G-WHM8Y81MM2", html)
            for event_name in (
                "test_start",
                "question_answer",
                "test_complete",
                "result_image_save",
                "test_restart",
            ):
                self.assertIn(event_name, javascript)
            self.assertIn("navigator.canShare", javascript)
            self.assertIn("navigator.share", javascript)
            self.assertIn("image-save-dialog", javascript)
            self.assertIn("image-save-dialog", (output / "styles.css").read_text(encoding="utf-8"))


if __name__ == "__main__":
    unittest.main()

