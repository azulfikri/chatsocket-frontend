import Swal from "sweetalert2";

window.onload = async () => {
  const { value: nama } = await Swal.fire({
    title: "Masukkan Nama",
    input: "text",
    inputLabel: "Nama Kamu",
    inputPlaceholder: "Contoh: Messi",
    confirmButtonText: "Lanjut",
    allowOutsideClick: false,
    background: "#1f2937", // Tailwind gray-800
    color: "#fff",
    inputValidator: (value) => {
      if (!value) {
        return "Nama tidak boleh kosong!";
      }
    },
  });

  document.getElementById("name").value = nama ?? "Anonim";
};

const pusher = new Pusher("05a8620a3242d09f9860", {
  cluster: "ap1",
  forceTLS: true,
});

const channel = pusher.subscribe("chat-channel");

channel.bind("chat-event", function (data) {
  const myName = document.getElementById("name").value.trim();
  const isMe = data.name === myName;

  const bubble = document.createElement("div");
  bubble.className = `flex ${isMe ? "justify-end" : "justify-start"}`;

  bubble.innerHTML = `
      <div class="${
        isMe ? "bg-green-500 text-white" : "bg-gray-200 text-gray-900"
      } px-4 py-2 rounded-2xl max-w-[75%]">
        <p class="text-xs font-semibold mb-1">${data.name}</p>
        <p class="text-sm">${data.message}</p>
      </div>
    `;

  const chatBox = document.getElementById("chat");
  chatBox.appendChild(bubble);
  chatBox.scrollTop = chatBox.scrollHeight;

  // Clear typing
  const typing = document.getElementById("typing-indicator");
  if (typing.innerText.includes(data.name)) typing.innerText = "";
});

channel.bind("typing-event", function (data) {
  const myName = document.getElementById("name").value;
  if (data.name !== myName) {
    document.getElementById(
      "typing-indicator"
    ).innerText = `${data.name} sedang mengetik...`;
  }
});

// Kirim pesan
window.sendMessage = function () {
  const name = document.getElementById("name").value;
  const message = document.getElementById("message").value;

  if (!message.trim()) return;

  document.getElementById("send-text").innerText = "Mengirim...";
  document.getElementById("loading-icon").classList.remove("hidden");

  fetch("https://chatsocket-backend-production.up.railway.app/message", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, message }),
  }).then(() => {
    document.getElementById("message").value = "";
    document.getElementById("send-text").innerText = "Kirim";
    document.getElementById("loading-icon").classList.add("hidden");
  });
};

// Typing detection (opsional backend)
// Typing detection
let typingTimeout = null;

document.getElementById("message").addEventListener("input", () => {
  clearTimeout(typingTimeout);

  const name = document.getElementById("name").value;

  fetch("https://chatsocket-backend-production.up.railway.app/typing", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name }),
  });

  typingTimeout = setTimeout(() => {
    document.getElementById("typing-indicator").innerText = "";
  }, 2000);
});
