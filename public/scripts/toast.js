// public/scripts/toast.js

// Toastify initialization
(() => {
  const DefaultBackground = "linear-gradient(to right, ghostwhite, gainsboro)";
  const ErrorBackground = "linear-gradient(to right, crimson, darkred)";
  const SuccessBackground = "linear-gradient(to right, mediumseagreen, mediumspringgreen)";
  const InfoBackground = "linear-gradient(to right, darkturquoise, deepskyblue)";
  const WarningBackground = "linear-gradient(to right, goldenrod, darkorange)";

  function merge(base, over) {
    return { ...base, ...over, style: { ...base.style, ...over.style } };
  }
  
  const baseOptions = {
    defaultOptions: { 
      duration: 3000, 
      close: true, 
      gravity: 'bottom', 
      position: 'right', 
      stopOnFocus: true,
      style: { 
        color: '#fff', 
        fontSize: '16px', 
        borderRadius: '4px', 
        boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
        padding: '12px 16px'
      }
    }
  };
  
  window.toaster = {
    showErrorToast: opts => Toastify(merge(baseOptions.defaultOptions, { 
      text: opts.text, 
      style: { background: ErrorBackground }
    })).showToast(),
    
    showSuccessToast: opts => Toastify(merge(baseOptions.defaultOptions, { 
      text: opts.text, 
      style: { background: SuccessBackground }
    })).showToast(),
    
    showInfoToast: opts => Toastify(merge(baseOptions.defaultOptions, { 
      text: opts.text, 
      style: { background: InfoBackground }
    })).showToast(),
    
    showWarningToast: opts => Toastify(merge(baseOptions.defaultOptions, { 
      text: opts.text, 
      style: { background: WarningBackground }
    })).showToast()
  };
})();