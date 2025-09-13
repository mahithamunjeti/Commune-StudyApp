import React, { useState, useEffect, useRef } from "react";
import Editor from "@monaco-editor/react";
import axios from "axios";
import { io } from "socket.io-client";
import "./PlaygroundPage.css"; // Import the CSS file

const languageDefault = {
  python: 'print("Hello, Python!")',
  cpp: '#include<iostream>\nusing namespace std;\nint main() {\n  cout << "Hello, C++!" << endl;\n  return 0;\n}',
  html: "<!DOCTYPE html>\n<html>\n  <body>\n    <h1>Hello, HTML!</h1>\n  </body>\n</html>",
};

const PlaygroundPage = () => {
  const [language, setLanguage] = useState("python");
  const [code, setCode] = useState(languageDefault.python);
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [loading, setLoading] = useState(false);
  const [roomId, setRoomId] = useState(null);
  const socketRef = useRef(null);

  useEffect(() => {
    const id = "6616547dd3fae9fbbabcde12";
    setRoomId(id);
    const socket = io("http://localhost:4000");
    socketRef.current = socket;

    socket.emit("join-room", id);

    socket.on("code-update", (newCode) => {
      setCode(newCode);
    });

    socket.on("language-update", (newLanguage) => {
      setLanguage(newLanguage);
      setCode(languageDefault[newLanguage]);
      setOutput("");
      setInput("");
    });

    return () => socket.disconnect();
  }, []);

  const handleLanguageChange = (e) => {
    const lang = e.target.value;
    setLanguage(lang);
    setCode(languageDefault[lang]);
    setOutput("");
    setInput("");

    if (socketRef.current && roomId) {
      socketRef.current.emit("language-change", { roomId, language: lang });
    }
  };

  const handleCodeChange = (value) => {
    setCode(value);
    if (socketRef.current && roomId) {
      socketRef.current.emit("code-change", { roomId, code: value });
    }
  };

  const runCode = async () => {
    if (!roomId) return;
    setLoading(true);
    try {
      const res = await axios.post(`http://localhost:4000/execute/${roomId}`, {
        language,
        code,
        input,
      });
      setOutput(res.data.output || "No output");
    } catch (err) {
      setOutput("Error running code");
    }
    setLoading(false);
  };

  return (
    <div className="container">
    <div className="playground-container">
      <div className="playground-header">
        <h2 className="playground-title">Code Playground</h2>
      </div>
      
      <div className="controls-section">
        <select 
          value={language} 
          onChange={handleLanguageChange} 
          className="language-select"
        >
          <option value="python">Python</option>
          {/* <option value="cpp">C++</option> */}
          <option value="html">HTML</option>
        </select>
        <button
          onClick={runCode}
          className={`run-button ${loading ? 'loading' : ''}`}
        >
          {loading ? "Running..." : "Run Code"}
        </button>
      </div>

      <div className="editor-container">
        <Editor
          height="300px"
          defaultLanguage={language}
          language={language}
          value={code}
          onChange={handleCodeChange}
          theme="vs-dark"
          options={{
            fontSize: 14,
            minimap: { enabled: true },
            scrollBeyondLastLine: false,
            wordWrap: "on",
          }}
        />
      </div>

      <div className="io-container">
        {(language === "cpp" || language === "python") && (
          <div className="io-section">
            <div className="io-header">Input</div>
            <textarea
              className="input-textarea"
              placeholder="Enter input here..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
            ></textarea>
          </div>
        )}

        <div className="io-section">
          <div className="io-header">Output</div>
          {language === "html" ? (
            <iframe
              title="HTML Output"
              className="html-output"
              srcDoc={code}
            />
          ) : (
            <div className="output-container">{output}</div>
          )}
        </div>
      </div>
    </div>
    </div>
  );
};

export default PlaygroundPage;