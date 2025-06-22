import Quill from 'quill'
 
const Block = Quill.import('blots/block') // imports quill fundamental block blot, a block blot represents block-level elements like paragraphs, headings, blockqoutes.

class SnapshotBlockBlot extends Block {
  // Defines a new class that extends Quill's base Block blot.
  // This means SnapshotBlockBlot will behave like a block element in the editor,
  // and you can apply it to entire paragraphs or lines of text.
  
  static blotName = "snapshot-block";

  static tagName = "div";
  static className = "ql-snapshot-block";
}

export default SnapshotBlockBlot