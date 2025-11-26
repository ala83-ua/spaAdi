import { currentUser } from './auth.service.js';

const COL = 'publicaciones';
const STORAGE_KEY = 'app_publicaciones';

function getStoredPublications() {
  const stored = localStorage.getItem(STORAGE_KEY);
  return stored ? JSON.parse(stored) : [];
}

function savePublications(publications) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(publications));
}

export async function crearPublicacion({ comentario = '', archivos = [], ubicacion = '' }) {
  try {
    const user = currentUser();
    if (!user) {
      throw new Error('No hay usuario autenticado');
    }

    const publications = getStoredPublications();
    
    const imagenes = [];
    for (const archivo of archivos) {
      const base64 = await fileToBase64(archivo);
      imagenes.push({
        nombre: archivo.name,
        data: base64
      });
    }

    const newPublication = {
      id: 'pub_' + Date.now(),
      Comentario: comentario,
      comentario: comentario,
      Imagen: imagenes.map(i => i.nombre),
      imagen: imagenes.map(i => i.nombre),
      imagenData: imagenes,
      ubicacion: ubicacion,
      created: new Date().toISOString(),
      updated: new Date().toISOString(),
      expand: {
        id_usuario: {
          id: user.id,
          email: user.email,
          username: user.username,
          avatar: user.avatar
        }
      },
      id_usuario: user.id,
      collectionId: 'publicaciones'
    };

    publications.push(newPublication);
    savePublications(publications);

    return newPublication;
  } catch (err) {
    console.error('Error creating publication:', err);
    throw err;
  }
}

function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve(e.target.result);
    reader.onerror = (err) => reject(err);
    reader.readAsDataURL(file);
  });
}

export async function listarPublicaciones({
  page = 1, perPage = 10, sort = '-created', filter = '', expand = 'id_usuario'
} = {}) {
  try {
    let publications = getStoredPublications();

    if (filter) {
      publications = publications.filter(p => {
        const userMatch = filter.match(/id_usuario\.username\s*~\s*"([^"]+)"/);
        if (userMatch) {
          const username = userMatch[1].toLowerCase();
          const autor = p.expand?.id_usuario?.username || '';
          if (!autor.toLowerCase().includes(username)) {
            return false;
          }
        }
        
        const textMatch = filter.match(/Comentario\s*~\s*"([^"]+)"/g);
        if (textMatch) {
          const texto = (p.Comentario || p.comentario || '').toLowerCase();
          for (const match of textMatch) {
            const searchText = match.match(/"([^"]+)"/)[1].toLowerCase();
            if (!texto.includes(searchText)) {
              return false;
            }
          }
        }
        
        return true;
      });
    }

    const sorted = publications.sort((a, b) => {
      if (sort === '-created' || sort === 'recent') {
        return new Date(b.created) - new Date(a.created);
      } else if (sort === 'created' || sort === 'oldest') {
        return new Date(a.created) - new Date(b.created);
      } else if (sort === 'popular') {
        const aScore = (a.likes || 0) + (a.comments || 0);
        const bScore = (b.likes || 0) + (b.comments || 0);
        return bScore - aScore;
      }
      return new Date(b.created) - new Date(a.created);
    });

    const start = (page - 1) * perPage;
    const end = start + perPage;
    const items = sorted.slice(start, end);

    return Promise.resolve({
      items: items,
      page: page,
      perPage: perPage,
      totalItems: publications.length,
      totalPages: Math.ceil(publications.length / perPage)
    });
  } catch (err) {
    console.error('Error listing publications:', err);
    return Promise.resolve({ items: [], page, perPage, totalItems: 0 });
  }
}

export async function obtenerPublicacion(id) {
  const publications = getStoredPublications();
  const pub = publications.find(p => p.id === id);
  return Promise.resolve(pub || { id, comentario: '' });
}

export async function editarPublicacion(id, { comentario = '' }) {
  try {
    const publications = getStoredPublications();
    const pub = publications.find(p => p.id === id);
    if (!pub) {
      throw new Error('Publicación no encontrada');
    }
    
    const user = currentUser();
    if (pub.id_usuario !== user.id) {
      throw new Error('No tienes permisos para editar esta publicación');
    }
    
    pub.Comentario = comentario;
    pub.comentario = comentario;
    pub.updated = new Date().toISOString();
    
    savePublications(publications);
    return Promise.resolve(pub);
  } catch (err) {
    console.error('Error editing publication:', err);
    throw err;
  }
}

export async function agregarLike(publicacionId) {
  try {
    const user = currentUser();
    if (!user) {
      throw new Error('Debe estar autenticado');
    }
    
    const publications = getStoredPublications();
    const pub = publications.find(p => p.id === publicacionId);
    if (!pub) {
      throw new Error('Publicación no encontrada');
    }
    
    pub.likes = pub.likes || 0;
    pub.likedBy = pub.likedBy || [];
    
    if (!pub.likedBy.includes(user.id)) {
      pub.likedBy.push(user.id);
      pub.likes++;
    }
    
    savePublications(publications);
    return Promise.resolve(pub);
  } catch (err) {
    console.error('Error adding like:', err);
    throw err;
  }
}

export async function removerLike(publicacionId) {
  try {
    const user = currentUser();
    if (!user) {
      throw new Error('Debe estar autenticado');
    }
    
    const publications = getStoredPublications();
    const pub = publications.find(p => p.id === publicacionId);
    if (!pub) {
      throw new Error('Publicación no encontrada');
    }
    
    pub.likes = pub.likes || 0;
    pub.likedBy = pub.likedBy || [];
    
    const index = pub.likedBy.indexOf(user.id);
    if (index > -1) {
      pub.likedBy.splice(index, 1);
      pub.likes = Math.max(0, pub.likes - 1);
    }
    
    savePublications(publications);
    return Promise.resolve(pub);
  } catch (err) {
    console.error('Error removing like:', err);
    throw err;
  }
}

export async function agregarComentario(publicacionId, { texto = '' }) {
  // Mock: agregar comentario a una publicación
  try {
    const user = currentUser();
    if (!user) {
      throw new Error('Debe estar autenticado');
    }
    
    const publications = getStoredPublications();
    const pub = publications.find(p => p.id === publicacionId);
    if (!pub) {
      throw new Error('Publicación no encontrada');
    }
    
    pub.comentarios = pub.comentarios || [];
    const newComment = {
      id: 'comment_' + Date.now(),
      texto,
      autor: user.id,
      autorUsername: user.username,
      created: new Date().toISOString()
    };
    
    pub.comentarios.push(newComment);
    pub.commentCount = (pub.commentCount || 0) + 1;
    
    savePublications(publications);
    return Promise.resolve(pub);
  } catch (err) {
    console.error('Error adding comment:', err);
    throw err;
  }
}

export async function eliminarComentario(publicacionId, comentarioId) {
  try {
    const user = currentUser();
    if (!user) {
      throw new Error('Debe estar autenticado');
    }
    
    const publications = getStoredPublications();
    const pub = publications.find(p => p.id === publicacionId);
    if (!pub) {
      throw new Error('Publicación no encontrada');
    }
    
    const comment = pub.comentarios?.find(c => c.id === comentarioId);
    if (!comment) {
      throw new Error('Comentario no encontrado');
    }
    
    // Verificar que sea el autor del comentario
    if (comment.autor !== user.id) {
      throw new Error('No tienes permisos para eliminar este comentario');
    }
    
    pub.comentarios = pub.comentarios.filter(c => c.id !== comentarioId);
    pub.commentCount = Math.max(0, (pub.commentCount || 1) - 1);
    
    savePublications(publications);
    return Promise.resolve(pub);
  } catch (err) {
    console.error('Error deleting comment:', err);
    throw err;
  }
}

export async function eliminarPublicacion(id) {
  try {
    const publications = getStoredPublications();
    const filtered = publications.filter(p => p.id !== id);
    savePublications(filtered);
    return Promise.resolve({ success: true });
  } catch (err) {
    console.error('Error deleting publication:', err);
    throw err;
  }
}

export async function eliminarImagenDePublicacion(idPublicacion, nombreArchivoAEliminar) {
  return Promise.resolve({ success: true });
}