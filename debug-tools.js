// Temporary debug script to test tool loading
fetch('/assets/mcp-tools.json')
  .then(response => {
    console.log('Fetch response status:', response.status);
    console.log('Response headers:', [...response.headers.entries()]);
    return response.text();
  })
  .then(text => {
    console.log('Response text length:', text.length);
    console.log('First 500 chars:', text.substring(0, 500));
    console.log('Last 200 chars:', text.substring(text.length - 200));
    
    try {
      const parsed = JSON.parse(text);
      console.log('Parsed JSON successfully');
      console.log('Number of tools:', parsed.length);
      parsed.forEach((tool, index) => {
        console.log(`Tool ${index + 1}: ${tool.toolId} - ${tool.title}`);
      });
    } catch (error) {
      console.error('JSON parsing error:', error);
    }
  })
  .catch(error => {
    console.error('Fetch error:', error);
  });
