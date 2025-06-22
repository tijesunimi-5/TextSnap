// components/QuillEditor.jsx
import React, { useEffect, useRef, useCallback } from "react";
import Quill from "quill";
import "quill/dist/quill.snow.css";

// If you have a custom blot, ensure this file exists at components/SnapshotBlock.js
// and its content is valid. Otherwise, keep this line commented out.
// import SnapshotBlockBlot from "../components/SnapshotBlock";

// Register the custom blot with Quill ONLY IF SnapshotBlockBlot is defined and used.
// Quill.register(SnapshotBlockBlot, true);

const QuillEditor = ({ value, onChange }) => {
  const quillElementRef = useRef(null); // Ref to the div element Quill mounts to
  const quillInstanceRef = useRef(null); // Ref to the Quill editor instance
  const isMounted = useRef(false); // To track if the component is mounted

  useEffect(() => {
    isMounted.current = true; // Mark component as mounted

    if (quillElementRef.current && !quillInstanceRef.current) {
      const toolbarOptions = [
        [{ header: [1, 2, 3, false] }],
        [{ font: [] }],
        [{ size: ["small", false, "large", "huge"] }],

        ["bold", "italic", "underline", "strike"],
        ["blockquote", "code-block"],

        [{ list: "ordered" }, { list: "bullet" }],
        [{ script: "sub" }, { script: "super" }], // Corrected: "super" for superscript
        [{ indent: "-1" }, { indent: "+1" }],
        [{ direction: "rtl" }],

        [{ align: [] }],

        ["link", "image", "video"],

        [{ color: [] }, { background: [] }],
        ["clean"],
      ];

      quillInstanceRef.current = new Quill(quillElementRef.current, {
        theme: "snow",
        modules: {
          toolbar: toolbarOptions,
        },
        formats: [
          "header",
          "font",
          "size",
          "bold",
          "italic",
          "underline",
          "strike",
          "blockquote",
          "code-block",
          "list",
          "script",
          "indent",
          "direction",
          "align",
          "link",
          "image",
          "video",
          "color",
          "background",
          // "snapshot-block", // Only include if SnapshotBlockBlot is actually used and registered
        ],
      });

      // Set initial content from props
      if (value) {
        quillInstanceRef.current.clipboard.dangerouslyPasteHTML(0, value);
      }

      // Add text-change listener
      quillInstanceRef.current.on("text-change", () => {
        if (isMounted.current && onChange) {
          onChange(quillInstanceRef.current.root.innerHTML);
        }
      });
    }

    return () => {
      isMounted.current = false;
      // No explicit destroy needed for Quill, letting it be garbage collected
    };
  }, []); // Empty dependency array: run only once on mount

  // Effect to update Quill's content when the 'value' prop changes
  useEffect(() => {
    if (
      quillInstanceRef.current &&
      quillInstanceRef.current.root.innerHTML !== value
    ) {
      const selection = quillInstanceRef.current.getSelection(); // Save current selection
      quillInstanceRef.current.clipboard.dangerouslyPasteHTML(0, value);
      if (selection) {
        quillInstanceRef.current.setSelection(selection); // Restore selection
      }
    }
  }, [value]); // Re-run when 'value' prop changes

  const setQuillElementRef = useCallback((node) => {
    if (node) {
      quillElementRef.current = node;
    }
  }, []);

  return (
    <div className="quill-editor-container shadow-md bg-white">
      <div
        ref={setQuillElementRef}
        style={{ minHeight: "300px", backgroundColor: "white" }}
      />
    </div>
  );
};

export default QuillEditor;
