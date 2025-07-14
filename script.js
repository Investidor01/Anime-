let videos = [];
const apiBase = 'http://localhost:3001';

async function fetchVideos() {
  const res = await fetch(`${apiBase}/api/videos`);
  videos = await res.json();
  renderVideos(videos);
}

const videoInput = document.getElementById("videoInput");
const titleInput = document.getElementById("videoTitle");
const categoryInput = document.getElementById("videoCategory");
const previewThumbnail = document.getElementById("previewThumbnail");

if (videoInput) {
  videoInput.addEventListener("change", showVideoPreview);
}

function showVideoPreview() {
  previewThumbnail.innerHTML = "";
  if (videoInput.files && videoInput.files[0]) {
    const file = videoInput.files[0];
    const url = URL.createObjectURL(file);
    const video = document.createElement("video");
    video.src = url;
    video.controls = true;
    video.muted = true;
    video.width = 220;
    video.style.marginTop = "10px";
    previewThumbnail.appendChild(video);
  }
}

async function uploadVideo() {
  if (!videoInput.files.length || !titleInput.value.trim()) {
    alert("Selecione um vídeo e insira o título.");
    return;
  }
  if (titleInput.value.length < 2) {
    alert("O título deve ter pelo menos 2 caracteres.");
    return;
  }
  const formData = new FormData();
  formData.append('video', videoInput.files[0]);
  formData.append('title', titleInput.value.trim());
  formData.append('category', categoryInput.value);

  try {
    const res = await fetch(`${apiBase}/api/upload`, {
      method: 'POST',
      body: formData
    });
    if (!res.ok) throw new Error('Falha no upload');
    await fetchVideos();
    document.getElementById("uploadForm").reset();
    previewThumbnail.innerHTML = "";
  } catch (err) {
    alert("Erro ao enviar vídeo.");
  }
}

function renderVideos(filteredVideos) {
  const gallery = document.getElementById("videoGallery");
  gallery.innerHTML = "";
  if (!filteredVideos.length) {
    gallery.innerHTML = `<p class="empty-gallery">Nenhum vídeo encontrado nesta categoria.</p>`;
    return;
  }
  filteredVideos.forEach((video) => {
    const card = document.createElement("div");
    card.className = "video-card fade-in";
    card.innerHTML = `
      <h3 title="${video.title}">${video.title}</h3>
      <video controls>
        <source src="${apiBase}${video.url}" type="video/mp4">
        Seu navegador não suporta o player de vídeo.
      </video>
      <p>Categoria: <span class="category-tag">${video.category}</span></p>
      <button class="delete-btn" title="Remover vídeo" onclick="deleteVideo(${video.id})">🗑️ Remover</button>
    `;
    gallery.appendChild(card);
  });
}

async function deleteVideo(id) {
  if (!confirm("Tem certeza que deseja remover este vídeo?")) return;
  await fetch(`${apiBase}/api/videos/${id}`, { method: 'DELETE' });
  await fetchVideos();
}

function filterCategory(category, btn) {
  document.querySelectorAll(".filter-btn").forEach(b => b.classList.remove("active"));
  if (btn) btn.classList.add("active");
  if (category === "todos") {
    renderVideos(videos);
  } else {
    const filtered = videos.filter(v => v.category === category);
    renderVideos(filtered);
  }
}

fetchVideos();
