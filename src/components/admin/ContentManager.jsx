import { useState, useEffect, useRef } from "react";

export default function ContentManager() {
  const [contentFiles, setContentFiles] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [fileContent, setFileContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [revealedBlocks, setRevealedBlocks] = useState(0);
  const fileTextRef = useRef(null);

  useEffect(() => {
    loadContentFiles();
    setRevealedBlocks(0);
  }, []);

  useEffect(() => {
    const handler = (e) => {
      if (e.key === "Enter" && selectedFile) {
        const hidden = fileContent.match(/#!.*?!#/gs) || [];
        if (revealedBlocks < hidden.length) setRevealedBlocks((p) => p + 1);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [selectedFile, fileContent, revealedBlocks]);

  useEffect(() => {
    if (revealedBlocks > 0 && fileTextRef.current) {
      setTimeout(() => {
        const el = fileTextRef.current.querySelector(`[data-block-index="${revealedBlocks - 1}"]`);
        if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 50);
    }
  }, [revealedBlocks]);

  const loadContentFiles = async () => {
    try {
      setLoading(true);
      const modules = import.meta.glob("/src/documents/*.txt", { query: "?raw", import: "default" });
      const list = Object.keys(modules).map((p) => p.split("/").pop()).sort();
      setContentFiles(list);
      if (list.length > 0) selectFile(list[0]);
    } catch { setFileContent("Error loading content files."); }
    finally { setLoading(false); }
  };

  const selectFile = async (filename) => {
    setSelectedFile(filename); setRevealedBlocks(0);
    try {
      const modules = import.meta.glob("/src/documents/*.txt", { query: "?raw", import: "default" });
      const mod = modules[`/src/documents/${filename}`];
      setFileContent(mod ? await mod() : "Error loading file.");
    } catch { setFileContent("Error loading file."); }
  };

  const parseContent = (content) => {
    const parts = []; const regex = /#!.*?!#/gs;
    let lastIndex = 0, blockIndex = 0, match;
    while ((match = regex.exec(content)) !== null) {
      if (match.index > lastIndex) parts.push({ type: "regular", content: content.slice(lastIndex, match.index) });
      parts.push({ type: "hidden", content: match[0], blockIndex: blockIndex++ });
      lastIndex = regex.lastIndex;
    }
    if (lastIndex < content.length) parts.push({ type: "regular", content: content.slice(lastIndex) });
    return parts;
  };

  const renderContentWithBlocks = (content) => {
    let hiddenCounter = 0;
    return parseContent(content).map((part, i) => {
      if (part.type === "regular") {
        return part.content.split("\n").map((line, li) => (
          <div key={`r-${i}-${li}`} className="line">{line || <br />}</div>
        ));
      }
      const isRevealed = part.blockIndex < revealedBlocks;
      const cur = hiddenCounter++;
      if (!isRevealed) return null;
      return (
        <div key={`h-${cur}`}>
          {part.content.replace(/#!/g, "").replace(/!#/g, "").split("\n").map((line, li) => (
            <div key={`hb-${cur}-${li}`} className="line revealed-block" data-block-index={cur}>
              {line || <br />}
            </div>
          ))}
        </div>
      );
    });
  };

  return (
    <div className={`content-section content-manager ${isFullscreen ? "fullscreen" : ""}`}>
      <div className="content-manager-layout">
        <aside className="content-sidebar">
          <h3>Available Content</h3>
          {loading ? <p className="loading">Loading files...</p>
            : contentFiles.length > 0
              ? <div className="file-list">
                  {contentFiles.map((file) => (
                    <button key={file} className={`file-subheading ${selectedFile === file ? "active" : ""}`} onClick={() => selectFile(file)} title={file}>
                      <span className="file-icon">📄</span>
                      <span className="file-name">{file.replace(".txt", "")}</span>
                    </button>
                  ))}
                </div>
              : <p className="empty-message">No content files found.</p>}
        </aside>
        <div className={`content-main ${isFullscreen ? "fullscreen-main" : ""}`}>
          {selectedFile ? (
            <div className="file-content">
              <div className="file-header">
                <h2>{selectedFile.replace(".txt", "")}</h2>
                <button className="resize-btn" onClick={() => setIsFullscreen(!isFullscreen)}>⛶</button>
              </div>
              <div className="file-text" ref={fileTextRef}>{renderContentWithBlocks(fileContent)}</div>
            </div>
          ) : (
            <div className="no-selection"><p>Select a file from the left to view its content.</p></div>
          )}
        </div>
      </div>
    </div>
  );
}
