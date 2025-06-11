# 🐛 Debugging MCP Elements Demo

## Current Issues & Fixes Applied

### 1. **Fixed Shepherd.js Import Issues**
- Updated Shepherd constructor calls to use `new (Shepherd as any).Tour()`
- Fixed CSS import path to use `shepherd.js/dist/css/shepherd.css`

### 2. **Enhanced Error Handling & Debugging**
- Added comprehensive logging to tool registry loading
- Added element waiting mechanism for silent mode actions
- Enhanced action execution with better error messages
- Added fallback tool loading mechanism

### 3. **Improved Auto Question Demo**
- Added navigation logic to ensure user is on `/ask` page
- Enhanced form element targeting with proper IDs
- Added better event dispatching for Angular form detection

### 4. **Added Debug Tools**
- Created simple debug test tool for troubleshooting
- Added debug test button to control panel
- Enhanced logging throughout the application

## 🧪 Testing Instructions

### Step 1: Open the Application
1. Ensure the dev server is running: `npm start`
2. Open http://localhost:4200 in your browser
3. Look for the **🤖 MCP Elements Demo** panel in the top-right corner

### Step 2: Test Basic Functionality
1. **Click the panel** to expand it
2. **Check Service Status**: Should show "✅ Ready"
3. **View Available Tools**: Should list 6-7 tools
4. **Check Event Log**: Should show "No events yet"

### Step 3: Test Welcome Tour (Normal Mode)
1. Click **"Welcome Tour"** button
2. Should see a modal popup with tour steps
3. Navigate through with Next/Back buttons
4. Check event log for activity

### Step 4: Test Debug Tool (Silent Mode)
1. Click **"Debug Test"** button
2. Check browser console for debug messages
3. Should see logging of tool execution
4. Check event log for completion

### Step 5: Test Auto Question Demo
1. Click **"Auto Fill Question"** button
2. If not on `/ask` page, it will navigate there
3. Once on ask page, try the button again
4. Should see form fields being filled automatically

### Step 6: Check Console for Errors
Open browser DevTools Console and look for:
- Tool loading messages
- Tool execution logs
- Any error messages
- Element finding success/failure

## 🔍 Debugging Console Commands

Open browser console and try these commands:

```javascript
// Check if MCP Elements is loaded
console.log('MCP Elements available:', !!window.mcpElements);

// Get available tools
const tools = await mcpController.getRegistry().getAllTools();
console.log('Available tools:', Array.from(tools.keys()));

// Test element selection
console.log('Title input:', document.querySelector('#question-title'));
console.log('Body textarea:', document.querySelector('#question-body'));
console.log('Tags input:', document.querySelector('#question-tags'));

// Test tool execution manually
mcpController.start([{toolId: 'debug-test'}]);
```

## 🛠️ Common Issues & Solutions

### Issue: "Tools not loading"
**Solution**: Check browser console for fetch errors. The `/assets/mcp-tools.json` file should be accessible.

### Issue: "Auto Fill Question not working"
**Solutions**:
1. Ensure you're on the `/ask` page
2. Check if form elements exist: `document.querySelector('#question-title')`
3. Look for console errors during tool execution

### Issue: "Welcome Tour not appearing"
**Solutions**:
1. Check if Shepherd.js is loaded properly
2. Look for CSS conflicts
3. Ensure target elements exist on the page

### Issue: "Events not showing in log"
**Solution**: Check if event listeners are properly attached in the service

## 📊 Expected Console Output

When tools work correctly, you should see:

```
Initializing MCP Elements service...
Loading tools from URL: /assets/mcp-tools.json
Parsed configurations: 6 tools
Validating tool: stack-overflow-welcome
Validating tool: ask-question-guide
...
Loaded 6 tools into registry: ["stack-overflow-welcome", "ask-question-guide", ...]
MCP Elements service initialized successfully

// When running a tool:
Starting tool: Stack Overflow Clone Welcome Tour (normal mode)
MCP Tool started: Stack Overflow Clone Welcome Tour

// When running silent mode:
Executing silent mode tool: Automatic Question Creation Demo with 3 steps
Executing step 1/3: {...}
Performing action: fillInput on element: #question-title
Element found: <input id="question-title"...>
Filling input with value: How to implement TypeScript interfaces effectively?
```

## 🎯 Next Steps if Issues Persist

1. **Check Network Tab**: Ensure `/assets/mcp-tools.json` loads successfully
2. **Verify Element IDs**: Use browser DevTools to confirm form element IDs
3. **Test Shepherd.js Directly**: Try creating a simple Shepherd tour manually
4. **Check Angular Version**: Ensure compatibility with Angular 20
5. **Review Build Output**: Look for any compilation warnings

The demo should work with these fixes. If issues persist, check the browser console for specific error messages and verify that all required elements exist on the page.
