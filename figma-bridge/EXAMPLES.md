# Example Workflows

Practical examples of using Figma Desktop Bridge with AI agents.

## Example 1: Create a Landing Page Frame

**User Prompt:** "Create a landing page frame with a hero section"

**Agent Workflow:**

```javascript
// 1. Get current page to understand context
figma_get_current_page()

// 2. Create main frame
figma_create_frame({
  name: "Landing Page",
  width: 1440,
  height: 900,
  x: 100,
  y: 100
})

// 3. Create hero section frame inside
figma_create_frame({
  name: "Hero Section",
  width: 1440,
  height: 600,
  x: 0,
  y: 0,
  cornerRadius: 0
})
```

## Example 2: Add Text Content to Frame

**User Prompt:** "Add a headline saying 'Welcome to Our App' in the hero section"

**Agent Workflow:**

```javascript
// 1. Get frames to find the hero section
figma_get_frames()

// 2. Create text layer
figma_create_text({
  name: "Headline",
  content: "Welcome to Our App",
  x: 200,
  y: 200,
  fontSize: 64,
  fontWeight: 700,
  fontFamily: "Inter",
  textAlign: "CENTER",
  width: 1040
})

// 3. Create subheadline
figma_create_text({
  name: "Subheadline",
  content: "Build amazing products faster than ever",
  x: 200,
  y: 300,
  fontSize: 24,
  fontWeight: 400,
  textAlign: "CENTER",
  width: 1040
})
```

## Example 3: Update Existing Design

**User Prompt:** "Change the headline text to 'New Product Launch' and make it blue"

**Agent Workflow:**

```javascript
// 1. Get current selection or find the text node
figma_get_text_nodes()

// 2. Update the headline
figma_update_text({
  nodeId: "1:234",
  content: "New Product Launch",
  color: "#3B82F6"
})
```

## Example 4: Export Designs

**User Prompt:** "Export the hero section as a 2x PNG"

**Agent Workflow:**

```javascript
// 1. Get frames to find the hero section
figma_get_frames()

// 2. Export the frame
figma_export_png({
  nodeId: "1:123",
  scale: 2
})
```

## Example 5: Create Testimonials Section

**User Prompt:** "Create a testimonials section with three testimonial cards"

**Agent Workflow:**

```javascript
// 1. Create main section frame
figma_create_frame({
  name: "Testimonials",
  width: 1200,
  height: 400,
  x: 120,
  y: 800,
  cornerRadius: 12
})

// 2. Create testimonial cards
for (let i = 0; i < 3; i++) {
  figma_create_frame({
    name: `Testimonial ${i + 1}`,
    width: 360,
    height: 360,
    x: 120 + (i * 400),
    y: 820,
    cornerRadius: 8
  })
}

// 3. Add text content to each card
figma_create_text({
  name: "Testimonial 1 Text",
  content: "This product changed our workflow completely!",
  x: 140,
  y: 840,
  fontSize: 18,
  width: 320
})
```

## Example 6: Document Structure Analysis

**User Prompt:** "Show me the structure of my current Figma page"

**Agent Workflow:**

```javascript
// 1. Get current page structure
figma_get_current_page()

// 2. Get specific details about frames
figma_get_frames()

// 3. Get text nodes
figma_get_text_nodes()

// 4. Get components
figma_get_components()
```

## Example 7: Update Multiple Text Nodes

**User Prompt:** "Update all headlines to use the new brand color #FF6B35"

**Agent Workflow:**

```javascript
// 1. Get all text nodes
figma_get_text_nodes()

// 2. Filter for headlines (based on name or size)
// 3. Update each headline
figma_update_text({
  nodeId: "1:234",
  color: "#FF6B35"
})

figma_update_text({
  nodeId: "1:235",
  color: "#FF6B35"
})
```

## Example 8: Reorganize Layout

**User Prompt:** "Move the testimonials section below the hero section"

**Agent Workflow:**

```javascript
// 1. Get current frames to identify sections
figma_get_frames()

// 2. Move the testimonials frame
figma_move_node({
  nodeId: "1:456",
  y: 700
})
```

## Example 9: Create Button Component

**User Prompt:** "Create a primary button with text 'Get Started'"

**Agent Workflow:**

```javascript
// 1. Create button frame
figma_create_frame({
  name: "Primary Button",
  width: 200,
  height: 48,
  x: 620,
  y: 500,
  cornerRadius: 8
})

// 2. Add button text
figma_create_text({
  name: "Button Text",
  content: "Get Started",
  x: 640,
  y: 512,
  fontSize: 16,
  fontWeight: 600,
  textAlign: "CENTER",
  width: 160
})

// 3. Style the button
figma_update_style({
  nodeId: "1:789",
  fills: [{ type: "SOLID", color: { r: 0.2, g: 0.5, b: 1.0 } }],
  opacity: 1
})
```

## Example 10: Export Multiple Assets

**User Prompt:** "Export all frames as PNGs"

**Agent Workflow:**

```javascript
// 1. Get all frames
const frames = figma_get_frames()

// 2. Export each frame
frames.forEach(frame => {
  figma_export_png({
    nodeId: frame.id,
    scale: 2
  })
})
```

## Example 11: Analysis and Recommendations

**User Prompt:** "Analyze my current design and suggest improvements"

**Agent Workflow:**

```javascript
// 1. Get current page structure
const page = figma_get_current_page()

// 2. Analyze frames
const frames = figma_get_frames()

// 3. Analyze text content
const textNodes = figma_get_text_nodes()

// 4. Provide recommendations based on:
//    - Frame organization
//    - Text hierarchy
//    - Spacing consistency
//    - Color usage (via styles)
```

## Example 12: Clean Up Unused Elements

**User Prompt:** "Remove all empty frames from the current page"

**Agent Workflow:**

```javascript
// 1. Get all frames
const frames = figma_get_frames()

// 2. Identify empty frames
// 3. Delete empty frames
figma_delete_node({
  nodeId: "1:999"
})
```

## Example 13: Create Design System Documentation

**User Prompt:** "Document all the styles used in this file"

**Agent Workflow:**

```javascript
// 1. Get all styles
const styles = figma_get_styles()

// 2. Get all variables
const variables = figma_get_variables()

// 3. Generate documentation
//    - Color palette
//    - Typography scale
//    - Spacing system
//    - Component styles
```

## Example 14: Batch Update Text Content

**User Prompt:** "Replace all instances of 'Coming Soon' with 'Available Now'"

**Agent Workflow:**

```javascript
// 1. Get all text nodes
const textNodes = figma_get_text_nodes()

// 2. Find nodes containing 'Coming Soon'
// 3. Update matching nodes
textNodes.forEach(node => {
  if (node.content === 'Coming Soon') {
    figma_update_text({
      nodeId: node.id,
      content: 'Available Now'
    })
  }
})
```

## Example 15: Create Responsive Breakpoints

**User Prompt:** "Create mobile, tablet, and desktop versions of this frame"

**Agent Workflow:**

```javascript
// 1. Get current frame
const frame = figma_get_node({ nodeId: "1:123" })

// 2. Create mobile version (375px)
figma_create_frame({
  name: "Mobile - " + frame.name,
  width: 375,
  height: frame.height * 0.8,
  x: 100,
  y: 100
})

// 3. Create tablet version (768px)
figma_create_frame({
  name: "Tablet - " + frame.name,
  width: 768,
  height: frame.height * 0.9,
  x: 500,
  y: 100
})

// 4. Keep desktop version (original)
//    or create new one if needed
```

These examples demonstrate practical workflows for common design tasks using the Figma Desktop Bridge system.
