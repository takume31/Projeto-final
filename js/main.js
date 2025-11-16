// Registrando o Service Worker
if ('serviceWorker' in navigator) {
  window.addEventListener('load', async () => {
    try {
      let reg;
      reg = await navigator.serviceWorker.register('/sw.js', { type: "module" });
      console.log('Service worker registrada! 😎', reg);
    } catch (err) {
      console.log('😥 Service worker registro falhou: ', err);
    }
  });
}

// configurando as constraintes do video stream
var constraints = { video: { facingMode: "user" }, audio: false };

// capturando os elementos em tela
const cameraView = document.querySelector("#camera--view"),
  cameraOutput = document.querySelector("#camera--output"),
  cameraSensor = document.querySelector("#camera--sensor"),
  cameraTrigger = document.querySelector("#camera--trigger"),
  nome = document.querySelector("#nome"),
  mensagem = document.querySelector("#mensagem"),
  historicoContainer = document.querySelector("#historico");

//Estabelecendo o acesso a camera e inicializando a visualização
function cameraStart() {
  navigator.mediaDevices
    .getUserMedia(constraints)
    .then(function (stream) {
      cameraView.srcObject = stream;
    })
    .catch(function (error) {
      console.error("Ocorreu um erro ao acessar a câmera:", error);
    });
}

// === IndexedDB ===
let db;
const request = indexedDB.open("CameraDB", 1);

request.onupgradeneeded = function (event) {
  db = event.target.result;
  const store = db.createObjectStore("fotos", { keyPath: "id", autoIncrement: true });
  store.createIndex("data", "data", { unique: false });
  console.log("Banco criado ou atualizado 📂");
};

request.onsuccess = function (event) {
  db = event.target.result;
  console.log("Banco de dados aberto com sucesso ✅");
  listarFotos();
};

request.onerror = function (event) {
  console.error("Erro ao abrir o banco de dados ❌", event);
};

// Função para salvar foto no banco
function savePhoto(imageData) {
  if (!db) {
    console.error("Banco de dados não pronto!");
    return;
  }
  const nomeValor = nome.value.trim();
  const mensagemValor = mensagem.value.trim();
  const transaction = db.transaction(["fotos"], "readwrite");
  const store = transaction.objectStore("fotos");
  const foto = { 
  data: imageData, 
  timestamp: new Date().toISOString(),
  nome: nomeValor,
  mensagem: mensagemValor
};
store.add(foto);


  transaction.oncomplete = () => {
    console.log("card salvado com sucesso.");
    listarFotos();
  };
  transaction.onerror = (e) => console.error("Erro ao salvar foto:", e);
}

// Função para listar fotos salvas
function listarFotos() {
  if (!db) return;

  const transaction = db.transaction(["fotos"], "readonly");
  const store = transaction.objectStore("fotos");
  const request = store.getAll();

  request.onsuccess = (e) => {
    const fotos = e.target.result;
    historicoContainer.innerHTML = "";

    if (fotos.length === 0) {
      historicoContainer.innerHTML = "<p>Nenhuma foto salva ainda.</p>";
      return;
    }
fotos.forEach((f) => {
  const div = document.createElement("div");

  div.classList.add("card");
  div.classList.add("foto-item");

  const img = document.createElement("img");
  img.src = f.data;
  
    const nomeEl = document.createElement("h3");
    nomeEl.textContent = `Nome: ${f.nome || "Anônimo"}`;
  
    const mensagemEl = document.createElement("p");
    mensagemEl.textContent = `Descrição: ${f.mensagem || "Sem Descrição"}`;

  const btn = document.createElement("button");
  btn.classList.add("btn-remover");
  btn.textContent = "X";
  btn.onclick = () => removerFoto(f.id);
  div.appendChild(img);
  div.appendChild(btn);
  div.appendChild(nomeEl);
  div.appendChild(mensagemEl);
  historicoContainer.appendChild(div);
});


  };
}

// Função para remover uma foto
function removerFoto(id) {
  const transaction = db.transaction(["fotos"], "readwrite");
  const store = transaction.objectStore("fotos");
  store.delete(id);

  transaction.oncomplete = () => {
    console.log(`card com id ${id} removido.`);
    listarFotos();
  };
  transaction.onerror = (e) => console.error("Erro ao remover foto:", e);
}

  // Função para tirar foto
cameraTrigger.onclick = function () {
  cameraSensor.width = cameraView.videoWidth;
  cameraSensor.height = cameraView.videoHeight;
  cameraSensor.getContext("2d").drawImage(cameraView, 0, 0);

  const imageData = cameraSensor.toDataURL("image/webp");

  savePhoto(imageData);
};

// carrega imagem de camera quando a janela carregar
window.addEventListener("load", cameraStart, false);
