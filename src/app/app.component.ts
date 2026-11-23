import { Component, signal, computed } from '@angular/core';

export interface Contacto {
  id: number;
  nombre: string;
  telefono: string;
  email: string;
  grupo: string;
  favorito: boolean;
}

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  contactos = signal<Contacto[]>([]);
  busqueda = signal<string>('');
  
  // Reto extra 1: Grupo seleccionado ('Todos', 'Clase', 'Familia', 'Trabajo')
  grupoSeleccionado = signal<string>('Todos');
  readonly grupos = ['Todos', 'Clase', 'Familia', 'Trabajo'];

  numFavoritos = computed(() =>
    this.contactos().filter(c => c.favorito).length
  );

  // Reto extra 1: Combinar búsqueda por nombre + filtro por grupo
  filtrados = computed(() => {
    const texto = this.busqueda().trim().toLowerCase();
    const grupo = this.grupoSeleccionado();

    return this.contactos().filter(c => {
      const coincideTexto = !texto || c.nombre.toLowerCase().includes(texto);
      const coincideGrupo = grupo === 'Todos' || c.grupo === grupo;
      return coincideTexto && coincideGrupo;
    });
  });

  constructor() {
    this.cargar();
  }

  // Reto extra 2: Cargar contactos y restaurar favoritos desde localStorage
  async cargar() {
    const respuesta = await fetch('/contactos.json');
    const datos: Contacto[] = await respuesta.json();

    const favGuardados = localStorage.getItem('miagenda_favoritos');
    if (favGuardados) {
      const idsFavoritos: number[] = JSON.parse(favGuardados);
      datos.forEach(c => c.favorito = idsFavoritos.includes(c.id));
    }

    this.contactos.set(datos);
  }

  iniciales(nombre: string): string {
    return nombre
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map(palabra => palabra[0]?.toUpperCase() ?? '')
      .join('');
  }

  // Reto extra 2: Actualizar favorito y persistir los IDs en localStorage
  cambiarFavorito(id: number) {
    this.contactos.update(lista => {
      const actualizada = lista.map(c =>
        c.id === id ? { ...c, favorito: !c.favorito } : c
      );
      const idsFavoritos = actualizada.filter(c => c.favorito).map(c => c.id);
      localStorage.setItem('miagenda_favoritos', JSON.stringify(idsFavoritos));
      return actualizada;
    });
  }
}