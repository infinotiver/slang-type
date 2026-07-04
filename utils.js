// Adds a bright outline to all Grid and Flexbox layouts instantly
const style = document.createElement('style');
style.textContent = `
  [style*="display: grid"], [style*="display: flex"], 
  .grid, .flex, div { 
    outline: 1px solid #ff5722 !important; 
    outline-offset: -2px;
  }
`;
document.head.append(style);
