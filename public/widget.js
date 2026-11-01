(function () {
  if (document.getElementById("tensorbot-root")) return;

  var currentScript =
    document.currentScript ||
    document.querySelector("script[data-bot-id]") ||
    (function () {
      var scripts = document.getElementsByTagName("script");
      for (var i = 0; i < scripts.length; i++) {
        if (scripts[i].getAttribute("data-bot-id")) return scripts[i];
      }
      return null;
    })();

  if (!currentScript) {
    console.warn("TensorBot: Script tag missing 'data-bot-id' attribute.");
    return;
  }

  var botId = currentScript.getAttribute("data-bot-id");
  var scriptSrc = currentScript.getAttribute("src") || "";
  var customColor = currentScript.getAttribute("data-color") || "#DC2626";
  var baseUrl = "https://tensor-bot-beta.vercel.app";

  try {
    if (scriptSrc.indexOf("http") === 0) {
      var parsed = new URL(scriptSrc);
      baseUrl = parsed.origin;
    } else if (typeof window !== "undefined" && window.location && window.location.origin) {
      baseUrl = window.location.origin;
    }
  } catch (e) {}

  var root = document.createElement("div");
  root.id = "tensorbot-root";
  root.style.position = "fixed";
  root.style.bottom = "24px";
  root.style.right = "24px";
  root.style.zIndex = "2147483647";
  root.style.fontFamily = "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif";

  // Launcher button
  var launcher = document.createElement("button");
  launcher.id = "tensorbot-launcher";
  launcher.setAttribute("aria-label", "Open chat assistant");
  launcher.style.width = "60px";
  launcher.style.height = "60px";
  launcher.style.borderRadius = "30px";
  launcher.style.backgroundColor = customColor;
  launcher.style.color = "#ffffff";
  launcher.style.border = "none";
  launcher.style.cursor = "pointer";
  launcher.style.boxShadow = "0 8px 32px rgba(0, 0, 0, 0.22), 0 2px 8px rgba(0, 0, 0, 0.12)";
  launcher.style.display = "flex";
  launcher.style.alignItems = "center";
  launcher.style.justifyContent = "center";
  launcher.style.transition = "transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 0.2s ease";
  launcher.style.outline = "none";

  launcher.onmouseenter = function () {
    launcher.style.transform = "scale(1.06)";
  };
  launcher.onmouseleave = function () {
    launcher.style.transform = isOpen ? "rotate(90deg) scale(1)" : "rotate(0deg) scale(1)";
  };

  launcher.innerHTML =
    '<img src="' + baseUrl + '/logo.png" style="width: 34px; height: 34px; object-fit: contain; pointer-events: none; filter: drop-shadow(0 2px 6px rgba(0,0,0,0.25));" alt="AI Chat" />';

  // Container iframe
  var iframe = document.createElement("iframe");
  iframe.id = "tensorbot-iframe";
  iframe.src = baseUrl + "/widget/" + botId;
  iframe.title = "Chat Assistant Widget";
  iframe.style.position = "fixed";
  iframe.style.bottom = "96px";
  iframe.style.right = "24px";
  iframe.style.width = "400px";
  iframe.style.height = "640px";
  iframe.style.maxHeight = "calc(100vh - 120px)";
  iframe.style.maxWidth = "calc(100vw - 36px)";
  iframe.style.border = "1px solid rgba(0, 0, 0, 0.08)";
  iframe.style.borderRadius = "24px";
  iframe.style.boxShadow = "0 24px 64px rgba(0, 0, 0, 0.2), 0 4px 16px rgba(0, 0, 0, 0.06)";
  iframe.style.display = "none";
  iframe.style.zIndex = "2147483647";
  iframe.style.backgroundColor = "#ffffff";
  iframe.style.transition = "opacity 0.25s ease, transform 0.25s ease";

  var isOpen = false;
  launcher.onclick = function () {
    isOpen = !isOpen;
    if (isOpen) {
      iframe.style.display = "block";
      iframe.style.opacity = "0";
      iframe.style.transform = "translateY(16px) scale(0.96)";
      setTimeout(function () {
        iframe.style.opacity = "1";
        iframe.style.transform = "translateY(0) scale(1)";
      }, 10);
      launcher.style.transform = "rotate(90deg)";
      launcher.innerHTML =
        '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>';
    } else {
      iframe.style.opacity = "0";
      iframe.style.transform = "translateY(16px) scale(0.96)";
      setTimeout(function () {
        iframe.style.display = "none";
      }, 250);
      launcher.style.transform = "rotate(0deg)";
      launcher.innerHTML =
        '<img src="' + baseUrl + '/logo.png" style="width: 34px; height: 34px; object-fit: contain; pointer-events: none; filter: drop-shadow(0 2px 6px rgba(0,0,0,0.25));" alt="AI Chat" />';
    }
  };

  root.appendChild(iframe);
  root.appendChild(launcher);
  document.body.appendChild(root);
})();
