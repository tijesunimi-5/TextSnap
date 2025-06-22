// pages/index.js
"use client";
import React, { useState, useRef } from "react";
import dynamic from "next/dynamic";
import html2canvas from "html2canvas";

const DynamicQuillEditor = dynamic(() => import("../components/QuillEditor"), {
  ssr: false,
  loading: () => <p>Loading editor...</p>,
});

const DynamicSketchPicker = dynamic(
  () => import("react-color").then((mod) => mod.SketchPicker),
  {
    ssr: false,
    loading: () => <p>Loading color picker...</p>,
  }
);

function HomePage() {
  const [editorHtmlContent, setEditorHtmlContent] = useState(
    "<p>Start typing...</p>"
  );
  const [snapshotBackgroundColor, setSnapshotBackgroundColor] =
    useState("#DBDAD5");
  const [snapshotTextColor, setSnapshotTextColor] = useState("#ffffff");
  const [snapshotBorderRadius, setSnapshotBorderRadius] = useState(12);

  const [snapshotBackgroundImage, setSnapshotBackgroundImage] = useState("");
  const [backgroundType, setBackgroundType] = useState("color");

  const fileInputRef = useRef(null);
  const snapshotPreviewRef = useRef(null);

  const defaultBackgrounds = [
    "/textbg01.jpg",
    "/textbg02.jpg",
    "/textbg03.jpg",
    "/textbg04.jpg",
    "/textbg05.jpg",
    "/textbg06.jpg",
    "/textbg07.jpg",
    "/textbg08.jpg",
    "/text09.jpg",
  ];

  const handleEditorChange = (html) => {
    setEditorHtmlContent(html);
  };

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSnapshotBackgroundImage(reader.result);
        setBackgroundType("image");
      };
      reader.readAsDataURL(file);
    }
  };

  const applyDefaultBackground = (imageUrl) => {
    setSnapshotBackgroundImage(imageUrl);
    setBackgroundType("image");
  };

  const downloadSnapshot = async () => {
    if (snapshotPreviewRef.current) {
      const previewElement = snapshotPreviewRef.current; // This is the outer container

      // We no longer need to temporarily adjust outer padding/alignment
      // as html2canvas should respect the applied Tailwind classes on the outer div.

      // Find the inner div that holds the text content and glassmorphism styles
      const innerContentDiv = previewElement.querySelector(
        ".text-center.w-full"
      );

      // Store original styles for the innerContentDiv before temporary changes
      const originalInnerPadding = innerContentDiv
        ? innerContentDiv.style.padding
        : "";
      const originalInnerBackgroundColor = innerContentDiv
        ? innerContentDiv.style.backgroundColor
        : "";
      const originalInnerBackdropFilter = innerContentDiv
        ? innerContentDiv.style.backdropFilter
        : "";
      const originalInnerWebkitBackdropFilter = innerContentDiv
        ? innerContentDiv.style.webkitBackdropFilter
        : "";
      const originalInnerBorder = innerContentDiv
        ? innerContentDiv.style.border
        : "";
      const originalInnerBoxShadow = innerContentDiv
        ? innerContentDiv.style.boxShadow
        : "";
      const originalInnerMinHeight = innerContentDiv
        ? innerContentDiv.style.minHeight
        : "";

      // Apply temporary styles for the innerContentDiv ONLY for capture
      if (innerContentDiv) {
        // Increase padding for capture if desired, to ensure it's visible.
        // This will overwrite the inline style temporarily.
        innerContentDiv.style.padding = "1.5rem"; // Example: 1.5rem for capture

        // Make the background a bit more opaque for html2canvas,
        // as backdrop-filter blur might not render perfectly.
        innerContentDiv.style.backgroundColor = "rgba(255, 255, 255, 0.3)"; // Slightly more opaque white for capture

        // While backdrop-filter might not be perfect, include it for best effort.
        innerContentDiv.style.backdropFilter = "blur(10px) brightness(1.2)";
        innerContentDiv.style.webkitBackdropFilter =
          "blur(10px) brightness(1.2)";

        innerContentDiv.style.border = "1px solid rgba(255, 255, 255, 0.4)"; // A bit more visible border
        innerContentDiv.style.boxShadow =
          "0 12px 48px 0 rgba(31, 38, 135, 0.45)"; // Stronger shadow
        innerContentDiv.style.minHeight = "150px"; // Ensure a minimum height for the glass block itself
      }

      // Capture the div content as a canvas
      const canvas = await html2canvas(previewElement, {
        useCORS: true,
        backgroundColor: null, // Makes sure transparent areas stay transparent
        allowTaint: true,
        scale: window.devicePixelRatio * 2 || 2, // Increase scale for higher resolution capture
        // log: true, // Uncomment for debugging html2canvas rendering
      });

      // Restore original styles for the innerContentDiv AFTER capture
      if (innerContentDiv) {
        innerContentDiv.style.padding = originalInnerPadding;
        innerContentDiv.style.backgroundColor = originalInnerBackgroundColor;
        innerContentDiv.style.backdropFilter = originalInnerBackdropFilter;
        innerContentDiv.style.webkitBackdropFilter =
          originalInnerWebkitBackdropFilter;
        innerContentDiv.style.border = originalInnerBorder;
        innerContentDiv.style.boxShadow = originalInnerBoxShadow;
        innerContentDiv.style.minHeight = originalInnerMinHeight;
      }

      // Create an image URL from the canvas
      const image = canvas.toDataURL("image/png");

      // Create a temporary link element to trigger the download
      const link = document.createElement("a");
      link.href = image;
      link.download = "text-snapshot.png";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <section className="bg-[#f1f3f6]">
      <h1 className="text-3xl font-bold mb-6 text-center bg-orange-500 text-white rounded shadow py-1 mx-4 mt-2">
        Text Snapshot Creator
      </h1>
      <div className="container mt-[-40px] mx-auto p-8 grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="editor-controls-column">
          <div className="mb-8">
            <h2 className="xl:text-4xl text-xl font-semibold mb-3 text-orange-500">
              Editor
            </h2>
            <DynamicQuillEditor
              value={editorHtmlContent}
              onChange={handleEditorChange}
            />
          </div>

          <div className="mb-8 md:flex gap-[150px] xl:w-[900px]">
            <div>
              <h2 className="text-xl font-semibold mb-3">Customize Snapshot</h2>

              {/* Background Type Selection */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Background Type
                </label>
                <div className="flex space-x-4">
                  <label className="inline-flex items-center">
                    <input
                      type="radio"
                      className="form-radio"
                      name="backgroundType"
                      value="color"
                      checked={backgroundType === "color"}
                      onChange={() => setBackgroundType("color")}
                    />
                    <span className="ml-2">Solid Color</span>
                  </label>
                  <label className="inline-flex items-center">
                    <input
                      type="radio"
                      className="form-radio"
                      name="backgroundType"
                      value="image"
                      checked={backgroundType === "image"}
                      onChange={() => setBackgroundType("image")}
                    />
                    <span className="ml-2">Image</span>
                  </label>
                </div>
              </div>

              {/* Conditional Rendering based on backgroundType */}
              {backgroundType === "color" && (
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Background Color
                  </label>
                  <DynamicSketchPicker
                    color={snapshotBackgroundColor}
                    onChangeComplete={(color) =>
                      setSnapshotBackgroundColor(color.hex)
                    }
                  />
                </div>
              )}

              {backgroundType === "image" && (
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Choose Background Image
                  </label>
                  {/* Default Images */}
                  <div className="grid grid-cols-3 gap-2 mb-4">
                    {defaultBackgrounds.map((bg, index) => (
                      <div
                        key={index}
                        className="w-full h-20 bg-cover bg-center border-2 border-gray-300 cursor-pointer hover:border-blue-500 transition-all"
                        style={{ backgroundImage: `url(${bg})` }}
                        onClick={() => applyDefaultBackground(bg)}
                      ></div>
                    ))}
                  </div>

                  {/* Upload Image */}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="block w-full text-sm text-gray-500
                   file:mr-4 file:py-2 file:px-4
                   file:rounded-full file:border-0
                   file:text-sm file:font-semibold
                   file:bg-blue-50 file:text-blue-700
                   hover:file:bg-blue-100"
                  />
                </div>
              )}
            </div>

            <div className="flex flex-col gap-9 mt-8 justify-between xl:flex md:mt-[110px] xl:flex-row xl:w-[700px]">
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1 xl:text-xl">
                  Text Color
                </label>
                <DynamicSketchPicker
                  color={snapshotTextColor}
                  onChangeComplete={(color) => setSnapshotTextColor(color.hex)}
                />
              </div>

              {/* Border Radius */}
              <div className="mb-4 xl:mt-20">
                <label className="block text-sm font-medium text-gray-700 mb-1 xl:text-xl">
                  Border Radius: {snapshotBorderRadius}px
                </label>
                <input
                  type="range"
                  min="0"
                  max="24"
                  value={snapshotBorderRadius}
                  onChange={(e) =>
                    setSnapshotBorderRadius(parseInt(e.target.value, 10))
                  }
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                />
              </div>
            </div>
          </div>

          <button
            onClick={downloadSnapshot}
            className="px-6 py-3 bg-white border border-orange-400 text-orange-500 hover:text-white font-semibold rounded-lg shadow-md hover:bg-orange-400 transition duration-300"
          >
            Download Snapshot
          </button>
        </div>

        {/* preview */}
        <div className="preview-column flex flex-col items-center justify-start pt-16 mt-[-60px]">
          <h2 className="text-xl font-semibold mb-4">Live Preview</h2>
          <div
            id="snapshot-preview"
            ref={snapshotPreviewRef}
            // Retain existing flexbox classes for centering and live padding
            className="p-8 shadow-xl flex items-center justify-center min-h-[300px] w-full max-w-lg overflow-hidden"
            style={{
              backgroundColor:
                backgroundType === "color"
                  ? snapshotBackgroundColor
                  : "transparent",
              backgroundImage:
                backgroundType === "image"
                  ? `url(${snapshotBackgroundImage})`
                  : "none",
              backgroundSize: "cover",
              backgroundPosition: "center",
              backgroundRepeat: "no-repeat",
              color: snapshotTextColor,
              borderRadius: `${(snapshotBorderRadius / 4) * 16}px`,
            }}
          >
            <div
              dangerouslySetInnerHTML={{ __html: editorHtmlContent }}
              className="text-center w-full"
              style={{
                // Glassmorphism effect when backgroundType is 'image'
                backgroundColor:
                  backgroundType === "image"
                    ? "rgba(255, 255, 255, 0.1)" // Live preview opacity
                    : "transparent",
                backdropFilter:
                  backgroundType === "image"
                    ? "blur(7px) brightness(1.2)" // Live preview blur
                    : "none",
                WebkitBackdropFilter:
                  backgroundType === "image"
                    ? "blur(7px) brightness(1.2)" // Live preview blur for Safari
                    : "none",
                border:
                  backgroundType === "image"
                    ? "1px solid rgba(255, 255, 255, 0.2)" // Live preview border
                    : "none",
                boxShadow:
                  backgroundType === "image"
                    ? "0 8px 32px 0 rgba(31, 38, 135, 0.37)" // Live preview shadow
                    : "none",
                padding: "1rem", // Live preview internal padding for the glass box
                borderRadius: "8px",
                minHeight: "100px", // Ensure some minimum height for the glass box itself
              }}
            />
          </div>
        </div>
      </div>
    </section>
  );
}

export default HomePage;
