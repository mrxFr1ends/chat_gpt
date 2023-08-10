history.scrollRestoration = "manual";
const chat = document.querySelector("#chat");
const input = document.querySelector("#input-message");
let messages = JSON.parse(localStorage.getItem("messages") ?? "[]");

const messageHTML = (message, isBotMessage, isError) =>
  `<li class="chat-message-container ${isBotMessage ? "from" : "my"} ${isError ? "error" : ""}">
    <div class="message-icon">
      <div class="error-icon">!</div>
      <img src="${isBotMessage ? "./chat-gpt-icon.svg" : "./user-icon.svg"}" />
    </div>
    <div class="message-content">${message}</div>
  </li>`;

const addMessage = (message, isBotMessage, isError, save = true) => {
  if (save) {
    messages.push({ text: message, isBot: isBotMessage, isError });
    localStorage.setItem("messages", JSON.stringify(messages));
  }
  chat.innerHTML += messageHTML(message, isBotMessage, isError);
};

window.onload = function () {
  for (const message of messages)
    addMessage(message.text, message.isBot, message.isError, false);
  window.scrollTo({
    left: 0,
    top: document.body.scrollHeight,
    behavior: "smooth",
  });
};

const sendMessage = async () => {
  addMessage(input.value, false, false);
  window.scrollTo({
    left: 0,
    top: document.body.scrollHeight,
    behavior: "smooth",
  });
  await fetch("http://127.0.0.1/", {
    method: "POST",
    body: input.value,
  })
    .then(response => response.json())
    .then(json => {
      if (json.status) return addMessage(json.trace, true, true);
      addMessage(json, true, false);
    })
    .catch(error => addMessage(error.message, true, true))
    .finally(() => {
      input.value = "";
      window.scrollTo({
        left: 0,
        top: document.body.scrollHeight,
        behavior: "smooth",
      });
    });
};

document
  .querySelector("#input-send-message")
  .addEventListener("click", async () => await sendMessage());
document
  .querySelector("#input-form")
  .addEventListener("submit", async event => {
    event.preventDefault();
    await sendMessage();
  });
document.querySelector("#clear-history").addEventListener("click", () => {
  messages = [];
  localStorage.removeItem("messages");
  while (chat.lastElementChild) {
    if (chat.lastElementChild.classList.contains("start")) break;
    chat.removeChild(chat.lastElementChild);
  }
});
