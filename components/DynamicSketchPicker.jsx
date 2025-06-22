'use client'

import dynamic from "next/dynamic";
const DynamicSketchPicker = dynamic(() => import('react-color').then(mod => mod.SketchPicker), {
  ssr: false,
  loading: () => <p>Loading color picker...</p>
})

export default DynamicSketchPicker