const chatResponses = {
  "chào": "Chào bạn! Dahla Flower Shop có thể giúp gì cho bạn?",
  "giá hoa": "Hiện tại giá hoa bên mình dao động từ 100,000đ đến 500,000đ tùy loại.",
  "địa chỉ": "Cửa hàng Dahla Flower nằm ở số 123, đường Hoa Đào, TP. HCM.",
  "cảm ơn": "Rất vui được giúp bạn!",
};

// Toggle chat form
function toggleChat() {
  const chatForm = document.getElementById("chatForm");
  chatForm.style.display = chatForm.style.display === "flex" ? "none" : "flex";
}

// Handle user message
function sendMessage() {
  const userInput = document.getElementById("userInput");
  const chatBody = document.getElementById("chatBody");
  const userMessage = userInput.value.trim();

  if (userMessage) {
    // Add user message
    chatBody.innerHTML += `<div class="chat-message user">${userMessage}</div>`;

    // Get bot response
    const botResponse = chatResponses[userMessage.toLowerCase()] || "Xin lỗi, mình không hiểu câu hỏi của bạn.";
    chatBody.innerHTML += `<div class="chat-message bot">${botResponse}</div>`;

    // Scroll to the bottom
    chatBody.scrollTop = chatBody.scrollHeight;

    // Clear input
    userInput.value = "";
  }
}