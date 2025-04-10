const fs = require("fs");
const path = require("path");
const { exec } = require("child_process");
const express = require("express");
const router = express.Router();

function safeUnlink(filePath) {
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
  }
}

router.post("/:roomId", (req, res) => {
  const { language, code, input } = req.body;
  const roomId = req.params.roomId;

  if (!language || !code) {
    return res.status(400).json({ output: "Missing code or language" });
  }

  try {
    if (language === "cpp") {
      const cppPath = path.join(__dirname, `temp_${roomId}.cpp`);
      const exePath = path.join(__dirname, `temp_${roomId}.exe`);
      const inputPath = path.join(__dirname, `input_${roomId}.txt`);

      fs.writeFileSync(cppPath, code);
      fs.writeFileSync(inputPath, input || "");

      exec(`g++ "${cppPath}" -o "${exePath}" && "${exePath}" < "${inputPath}"`, (err, stdout, stderr) => {
        if (err) {
          return res.json({ output: err.message });
        }
        res.json({ output: stderr || stdout });

        safeUnlink(cppPath);
        safeUnlink(exePath);
        safeUnlink(inputPath);
      });

    } else if (language === "python") {
      const pyPath = path.join(__dirname, `temp_${roomId}.py`);
      const inputPath = path.join(__dirname, `input_${roomId}.txt`);

      fs.writeFileSync(pyPath, code);
      fs.writeFileSync(inputPath, input || "");

      exec(`python "${pyPath}" < "${inputPath}"`, (err, stdout, stderr) => {
        if (err || stderr) {
          return res.json({ output: stderr || err.message });
        }

        res.json({ output: stdout });
        safeUnlink(pyPath);
        safeUnlink(inputPath);
      });

    } else if (language === "html") {
      const html = `<html><body>${code}</body></html>`;
      res.json({ output: html });

    } else {
      res.status(400).json({ output: "Unsupported language" });
    }
  } catch (e) {
    console.error("Execution error:", e);
    res.status(500).json({ output: e.message });
  }
});

module.exports = router;